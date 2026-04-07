window.FM_GEN = (function () {

  // ─── Private helpers ──────────────────────────────────────────────────────

  function _clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function _deepCopy2D(arr) {
    var copy = [];
    for (var r = 0; r < arr.length; r++) {
      copy.push(arr[r].slice());
    }
    return copy;
  }

  /**
   * Mulberry32 seeded PRNG — returns a function that yields [0, 1)
   */
  function _createSeededRNG(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Returns rng() * 2 - 1, giving range [-1, 1] */
  function _seededRNGSigned(rng) {
    return rng() * 2 - 1;
  }

  /**
   * Bilinear interpolation over a 2-D matrix.
   * matrix rows correspond to yAxis entries, columns to xAxis entries.
   */
  function _bilinearInterpolate(matrix, xAxis, yAxis, x, y) {
    var rows = matrix.length;
    var cols = matrix[0].length;

    // Find bounding column indices for x (rpm)
    var c1 = 0;
    for (var ci = 0; ci < xAxis.length - 1; ci++) {
      if (x >= xAxis[ci] && x <= xAxis[ci + 1]) { c1 = ci; break; }
      if (x < xAxis[0]) { c1 = 0; break; }
      if (x > xAxis[xAxis.length - 1]) { c1 = xAxis.length - 2; break; }
      c1 = ci;
    }
    var c2 = Math.min(c1 + 1, cols - 1);

    // Find bounding row indices for y (load)
    var r1 = 0;
    for (var ri = 0; ri < yAxis.length - 1; ri++) {
      if (y >= yAxis[ri] && y <= yAxis[ri + 1]) { r1 = ri; break; }
      if (y < yAxis[0]) { r1 = 0; break; }
      if (y > yAxis[yAxis.length - 1]) { r1 = yAxis.length - 2; break; }
      r1 = ri;
    }
    var r2 = Math.min(r1 + 1, rows - 1);

    var tx = (xAxis[c2] !== xAxis[c1])
      ? _clamp((x - xAxis[c1]) / (xAxis[c2] - xAxis[c1]), 0, 1)
      : 0;
    var ty = (yAxis[r2] !== yAxis[r1])
      ? _clamp((y - yAxis[r1]) / (yAxis[r2] - yAxis[r1]), 0, 1)
      : 0;

    var v00 = matrix[r1][c1];
    var v10 = matrix[r1][c2];
    var v01 = matrix[r2][c1];
    var v11 = matrix[r2][c2];

    return (1 - tx) * (1 - ty) * v00 +
           tx       * (1 - ty) * v10 +
           (1 - tx) * ty       * v01 +
           tx       * ty       * v11;
  }

  function _getMapById(mapId) {
    return (window.FM_DATA.MAPS || []).find(function (m) { return m.id === mapId; }) || null;
  }

  // ─── 1. generateDirtyMap ──────────────────────────────────────────────────

  /**
   * Returns a copy of referenceValues with realistic errors injected.
   * @param {string} mapId
   * @param {number} difficulty  1 | 2 | 3
   * @param {number} [seed]
   * @returns {number[][]}
   */
  function generateDirtyMap(mapId, difficulty, seed) {
    var map = _getMapById(mapId);
    if (!map) {
      console.warn('FM_GEN.generateDirtyMap : cartographie introuvable — id=' + mapId);
      return [];
    }

    var ref = map.referenceValues;
    var rows = ref.length;
    var cols = rows > 0 ? ref[0].length : 0;
    var dirtyValues = _deepCopy2D(ref);

    var rngSeed = (seed !== undefined && seed !== null) ? seed : mapId.charCodeAt(0);
    var rng = _createSeededRNG(rngSeed);

    var numErrors = difficulty === 1 ? 3 : difficulty === 2 ? 6 : 10;

    // Category-based cluster zones — [minRow, maxRow, minCol, maxCol] (inclusive, clamped later)
    var clusterZone = null;
    var cat = map.category;
    var eng = map.engineType;

    if (cat === 'injection' && eng === 'diesel') {
      // High-RPM + high-load corner: rows 5-7, cols 6-9
      clusterZone = { rMin: 5, rMax: 7, cMin: 6, cMax: 9 };
    } else if (cat === 'rail_pressure' && eng === 'diesel') {
      // High-load band: rows 4-6
      clusterZone = { rMin: 4, rMax: 6, cMin: 0, cMax: cols - 1 };
    } else if (cat === 'ignition' && eng === 'gasoline') {
      // High RPM + high load
      clusterZone = { rMin: Math.max(0, rows - 4), rMax: rows - 1, cMin: Math.max(0, cols - 5), cMax: cols - 1 };
    } else if (cat === 'boost') {
      // Middle RPM peak — columns roughly representing 2000-3500 rpm
      // Heuristic: middle third of columns, all rows
      var cMidStart = Math.floor(cols * 0.35);
      var cMidEnd = Math.floor(cols * 0.65);
      clusterZone = { rMin: 0, rMax: rows - 1, cMin: cMidStart, cMax: cMidEnd };
    }

    for (var i = 0; i < numErrors; i++) {
      var r, c;

      // 70% chance to pick from cluster zone when defined and difficulty >= 2
      if (clusterZone && rng() < 0.7) {
        var zrMin = _clamp(clusterZone.rMin, 0, rows - 1);
        var zrMax = _clamp(clusterZone.rMax, 0, rows - 1);
        var zcMin = _clamp(clusterZone.cMin, 0, cols - 1);
        var zcMax = _clamp(clusterZone.cMax, 0, cols - 1);
        r = zrMin + Math.floor(rng() * (zrMax - zrMin + 1));
        c = zcMin + Math.floor(rng() * (zcMax - zcMin + 1));
      } else {
        // Weight toward high-load rows (upper rows = higher load in typical tables)
        // Sample row with quadratic bias toward higher indices
        var rRaw = rng();
        r = Math.floor(Math.pow(rRaw, 0.6) * rows);
        r = _clamp(r, 0, rows - 1);
        c = Math.floor(rng() * cols);
        c = _clamp(c, 0, cols - 1);
      }

      var errorType = rng() > 0.5 ? 'too_high' : 'too_low';
      var errorMagnitude = map.warningRange * (1 + rng() * difficulty);
      var sign = (errorType === 'too_high') ? 1 : -1;

      dirtyValues[r][c] += sign * errorMagnitude;
      dirtyValues[r][c] = _clamp(
        dirtyValues[r][c],
        map.safeRange[0] * 0.7,
        map.safeRange[1] * 1.3
      );
    }

    return dirtyValues;
  }

  // ─── 2. generateLogWithNoise ─────────────────────────────────────────────

  /**
   * Adds realistic sensor noise and physical effects to a clean base log.
   * @param {Object[]} baseLog  Array of 30 LogEntry objects
   * @param {number}   difficulty  1 | 2 | 3
   * @returns {Object[]}
   */
  function generateLogWithNoise(baseLog, difficulty) {
    if (!Array.isArray(baseLog) || baseLog.length === 0) return [];

    var rng = _createSeededRNG(Date.now() & 0xFFFF);
    var noiseFactors = { 1: 0.02, 2: 0.05, 3: 0.08 };
    var nf = noiseFactors[difficulty] || 0.02;

    // Deep-clone entries
    var log = baseLog.map(function (entry) {
      return JSON.parse(JSON.stringify(entry));
    });

    var len = log.length;

    // Step 1: apply per-channel sensor noise
    for (var t = 0; t < len; t++) {
      var e = log[t];
      e.rpm     = Math.round(e.rpm    + _seededRNGSigned(rng) * nf * e.rpm);
      e.boost   = e.boost   + _seededRNGSigned(rng) * 0.02;
      e.afr     = e.afr     + _seededRNGSigned(rng) * 0.15;
      e.timing  = e.timing  + _seededRNGSigned(rng) * 0.5;
      e.egt     = e.egt     + _seededRNGSigned(rng) * 8;
    }

    // Step 2: turbo boost latency — boost[t] = 0.7*boost[t] + 0.3*boost[max(0,t-3)]
    for (var t2 = 0; t2 < len; t2++) {
      var pastBoost = log[Math.max(0, t2 - 3)].boost;
      log[t2].boost = 0.7 * log[t2].boost + 0.3 * pastBoost;
    }

    // Step 3: AFR closed-loop hunting oscillation
    for (var t3 = 0; t3 < len; t3++) {
      log[t3].afr += Math.sin(t3 * 0.8) * 0.1 * (difficulty / 3);
    }

    // Step 4: clamp to physical ranges
    for (var t4 = 0; t4 < len; t4++) {
      var en = log[t4];
      en.rpm    = Math.round(_clamp(en.rpm,    0,    10000));
      en.boost  = Math.round(_clamp(en.boost,  0.5,  4.0)  * 1000) / 1000;
      en.afr    = Math.round(_clamp(en.afr,    8,    22)   * 100)  / 100;
      en.timing = Math.round(_clamp(en.timing, -10,  50)   * 10)   / 10;
      en.egt    = Math.round(_clamp(en.egt,    100,  1100));
    }

    return log;
  }

  // ─── 3. simulateLogFromMap ────────────────────────────────────────────────

  /**
   * Translates user-edited map values into a coherent 30-point time-series log.
   * @param {Object} params
   * @param {number[][]} params.userValues
   * @param {string}     params.mapId
   * @param {string}     params.engineType  'diesel'|'gasoline'
   * @param {number[]}   [params.rpmSequence]
   * @returns {Object[]}  30 LogEntry objects
   */
  function simulateLogFromMap(params) {
    var userValues  = params.userValues;
    var mapId       = params.mapId;
    var engineType  = params.engineType;

    var map = _getMapById(mapId);
    if (!map) {
      console.warn('FM_GEN.simulateLogFromMap : cartographie introuvable — id=' + mapId);
      return [];
    }

    var ref  = map.referenceValues;
    var rows = ref.length;
    var cols = rows > 0 ? ref[0].length : 0;

    // Default sequences (30 points — acceleration run then deceleration)
    var DEFAULT_RPM = [
      800, 800, 900, 1000, 1200, 1500, 2000, 2000, 2500, 2500,
      3000, 3000, 3200, 3500, 3500, 4000, 4000, 3500, 3000, 2500,
      2000, 1800, 1500, 1200, 1000, 900, 800, 800, 800, 800
    ];
    var DEFAULT_LOAD = [
      5, 5, 10, 15, 20, 30, 60, 80, 90, 100,
      100, 100, 100, 100, 100, 100, 90, 70, 50, 30,
      20, 15, 10, 8, 5, 5, 5, 5, 5, 5
    ];

    var rpmSeq  = (params.rpmSequence && params.rpmSequence.length === 30)
      ? params.rpmSequence : DEFAULT_RPM;
    var loadSeq = DEFAULT_LOAD;

    var rng = _createSeededRNG(mapId.charCodeAt(0) ^ 0xAB12);

    // ── Step 1: build delta and normalizedDelta matrices ──
    var delta           = [];
    var normalizedDelta = [];
    for (var r = 0; r < rows; r++) {
      delta.push([]);
      normalizedDelta.push([]);
      for (var c = 0; c < cols; c++) {
        var d = ((userValues[r] && userValues[r][c] !== undefined)
          ? userValues[r][c] : ref[r][c]) - ref[r][c];
        delta[r].push(d);
        normalizedDelta[r].push(d / Math.max(Math.abs(ref[r][c]), 1));
      }
    }

    // ── Accumulate boost deltas for latency pass ──
    var rawBoostDelta = new Array(30).fill(0);
    var knockAccum    = 0;  // accumulated timing pull from knock retard
    var results       = [];

    // ── Step 2-7: per time-point simulation ──
    for (var t = 0; t < 30; t++) {
      var rpm  = rpmSeq[t];
      var load = loadSeq[t];

      // Bilinear interpolation of normalizedDelta
      var localDelta = _bilinearInterpolate(
        normalizedDelta, map.xAxis.values, map.yAxis.values, rpm, load
      );

      // ── Step 3: base physical values ──
      var baseEGT, baseAFR, baseBoost, baseTiming;
      var baseRailPressure;

      if (engineType === 'diesel') {
        baseEGT           = 180 + (load / 100) * 470 + (rpm / 4000) * 50;
        baseAFR           = 30  - (load / 100) * 13;
        baseBoost         = 0.95 + (load / 100) * 0.8 * Math.min(rpm / 2500, 1);
        baseRailPressure  = 280  + (load / 100) * 1520 + (rpm / 4000) * 200;
        baseTiming        = 5   + (rpm / 4000) * 3;
      } else {
        // gasoline
        baseEGT    = 450 + (load / 100) * 400 + (rpm / 6500) * 100;
        baseAFR    = 14.7 - (load / 100) * 2.9;
        baseBoost  = 0.98 + (load / 100) * 1.12 * Math.min(rpm / 3000, 1);
        baseTiming = 16  - (load / 100) * 16 + (rpm / 6500) * 10;
      }

      // ── Step 4: delta effects by category ──
      var egtDelta    = 0;
      var afrDelta    = 0;
      var timingDelta = 0;
      var railDelta   = 0;
      var knockRisk   = 0;
      var knockEvent  = 0;
      var turboOverspeed = false;

      var cat = map.category;

      if (cat === 'injection' && engineType === 'diesel') {
        egtDelta            = localDelta * 120;
        rawBoostDelta[t]   += localDelta * 0.6;
        afrDelta            = -localDelta * 3;
        railDelta           = -localDelta * 50;

      } else if (cat === 'rail_pressure' && engineType === 'diesel') {
        var refRailAtPoint = _bilinearInterpolate(
          ref, map.xAxis.values, map.yAxis.values, rpm, load
        );
        egtDelta  = localDelta * 40;
        afrDelta  = -localDelta * 1.5;
        railDelta = localDelta * refRailAtPoint;

      } else if (cat === 'egr' && engineType === 'diesel') {
        afrDelta = localDelta * 2;
        egtDelta = -localDelta * 30;

      } else if (cat === 'ignition' && engineType === 'gasoline') {
        var refTimingAtPoint = _bilinearInterpolate(
          ref, map.xAxis.values, map.yAxis.values, rpm, load
        );
        timingDelta = localDelta * refTimingAtPoint;
        var absoluteTiming = baseTiming + timingDelta + knockAccum;

        if (absoluteTiming > 20 && load > 60 && rpm > 2500) {
          knockRisk = _clamp((absoluteTiming - 20) / 8, 0, 1);
        }
        knockEvent = (rng() < knockRisk) ? 1 : 0;
        if (knockEvent) {
          knockAccum -= 2;    // ECU pulls timing on knock event
        }
        egtDelta = timingDelta * 15;
        afrDelta = -knockRisk * 0.5;  // ECU enriches on knock

      } else if (cat === 'boost') {
        var refBoostAtPoint = _bilinearInterpolate(
          ref, map.xAxis.values, map.yAxis.values, rpm, load
        );
        rawBoostDelta[t] += localDelta * refBoostAtPoint;
        egtDelta = Math.abs(localDelta) * 30;
        if (localDelta > 0.1) {
          turboOverspeed = (localDelta > 0.15);
        }
      }

      results.push({
        _t:              t,
        _rpm:            rpm,
        _load:           load,
        _localDelta:     localDelta,
        _baseEGT:        baseEGT,
        _baseAFR:        baseAFR,
        _baseBoost:      baseBoost,
        _baseTiming:     baseTiming,
        _baseRail:       baseRailPressure || 0,
        _egtDelta:       egtDelta,
        _afrDelta:       afrDelta,
        _timingDelta:    timingDelta,
        _railDelta:      railDelta,
        _knockEvent:     knockEvent,
        _knockAccum:     knockAccum,
        _turboOverspeed: turboOverspeed,
      });
    }

    // ── Step 5: apply turbo latency to boost delta ──
    var effectiveBoostDelta = new Array(30).fill(0);
    for (var t5 = 0; t5 < 30; t5++) {
      var lag = Math.min(3, t5);
      var pastRaw = rawBoostDelta[Math.max(0, t5 - 3)];
      effectiveBoostDelta[t5] = pastRaw * (1 - Math.exp(-0.5 * lag));
    }

    // ── Step 6-7-8: add noise, compute fault codes, assemble LogEntry ──

    // Reference boost for fault thresholds (bilinear at each point)
    var refBoostMatrix = [];
    if (engineType === 'diesel' || engineType === 'gasoline') {
      // We need a uniform ref-boost surface — approximate from base formula per cell
      // Actually we just compute per-point reference boost for P0234/P0299
    }

    // Pre-compute per-t reference boost
    var refBoostPerT = [];
    for (var ti = 0; ti < 30; ti++) {
      var rpmTi  = rpmSeq[ti];
      var loadTi = loadSeq[ti];
      var rb;
      if (engineType === 'diesel') {
        rb = 0.95 + (loadTi / 100) * 0.8 * Math.min(rpmTi / 2500, 1);
      } else {
        rb = 0.98 + (loadTi / 100) * 1.12 * Math.min(rpmTi / 3000, 1);
      }
      refBoostPerT.push(rb);
    }

    // Noise amplitudes
    var noiseAmp = { egt: 8, afr: 0.15, boost: 0.02, rpm: 10, timing: 0.5 };

    // Build raw entries with noise applied
    var entries = [];
    for (var t6 = 0; t6 < 30; t6++) {
      var d6    = results[t6];
      var ld6   = d6._localDelta;
      var noiseMult = 1 + Math.abs(ld6) * 0.5;

      var finalRPM     = d6._rpm     + _seededRNGSigned(rng) * noiseAmp.rpm;
      var finalEGT     = d6._baseEGT + d6._egtDelta    + _seededRNGSigned(rng) * noiseAmp.egt    * noiseMult;
      var finalAFR     = d6._baseAFR + d6._afrDelta    + _seededRNGSigned(rng) * noiseAmp.afr    * noiseMult;
      var finalBoost   = d6._baseBoost + effectiveBoostDelta[t6] + _seededRNGSigned(rng) * noiseAmp.boost * noiseMult;
      var finalTiming  = d6._baseTiming + d6._timingDelta + d6._knockAccum + _seededRNGSigned(rng) * noiseAmp.timing;
      var finalRail    = d6._baseRail + d6._railDelta   + _seededRNGSigned(rng) * 5 * noiseMult;

      // AFR closed-loop oscillation
      finalAFR += Math.sin(t6 * 0.8) * 0.1 * 1;  // mild oscillation always present

      // Clamp physical ranges
      finalRPM    = Math.round(_clamp(finalRPM,    0,    10000));
      finalEGT    = Math.round(_clamp(finalEGT,    80,   1100));
      finalAFR    = Math.round(_clamp(finalAFR,    8,    25) * 100) / 100;
      finalBoost  = Math.round(_clamp(finalBoost,  0.5,  4.0) * 1000) / 1000;
      finalTiming = Math.round(_clamp(finalTiming, -10,  60) * 10) / 10;
      finalRail   = Math.round(_clamp(finalRail,   0,    2500));

      var entry = {
        t:       t6,
        rpm:     finalRPM,
        load:    d6._load,
        boost:   finalBoost,
        afr:     finalAFR,
        timing:  finalTiming,
        egt:     finalEGT,
        knock:   d6._knockEvent,
        faults:  [],
      };

      if (engineType === 'diesel') {
        entry.railPressure = finalRail;
        // smoke proxy: high load + rich mixture
        var smokeBase = (d6._load / 100) * 20 + Math.max(0, (18 - finalAFR)) * 8;
        entry.smoke = Math.round(_clamp(smokeBase + _seededRNGSigned(rng) * 3, 0, 100));
      }

      entries.push(entry);
    }

    // ── Step 7: generate fault codes ──

    // P0087 / P0088: rail pressure
    // P0234 / P0299: boost (3+ / 5+ consecutive)
    // P0300: knock > 3 events in any 5-pt window
    // P0171 / P0172: AFR streaks

    // Boost tracking
    var boostHighCount = 0;
    var boostHighStart = -1;
    var boostLowCount  = 0;
    var boostLowStart  = -1;

    for (var t7 = 0; t7 < 30; t7++) {
      var en7  = entries[t7];
      var rb7  = refBoostPerT[t7];

      // Rail pressure faults (diesel only)
      if (engineType === 'diesel' && en7.railPressure !== undefined) {
        if (en7.railPressure < 700 && en7.load > 60) {
          en7.faults.push('P0087');
        }
        if (en7.railPressure > 2050) {
          en7.faults.push('P0088');
        }
      }

      // Boost high streak
      if (en7.boost > rb7 + 0.25) {
        if (boostHighStart < 0) boostHighStart = t7;
        boostHighCount++;
      } else {
        if (boostHighCount >= 3) {
          for (var bh = boostHighStart; bh < t7; bh++) {
            if (entries[bh].faults.indexOf('P0234') === -1) entries[bh].faults.push('P0234');
          }
        }
        boostHighCount = 0;
        boostHighStart = -1;
      }

      // Boost low streak
      if (en7.boost < rb7 - 0.2) {
        if (boostLowStart < 0) boostLowStart = t7;
        boostLowCount++;
      } else {
        if (boostLowCount >= 5) {
          for (var bl = boostLowStart; bl < t7; bl++) {
            if (entries[bl].faults.indexOf('P0299') === -1) entries[bl].faults.push('P0299');
          }
        }
        boostLowCount = 0;
        boostLowStart = -1;
      }
    }
    // Flush open streaks
    if (boostHighCount >= 3) {
      for (var bh2 = boostHighStart; bh2 < 30; bh2++) {
        if (entries[bh2].faults.indexOf('P0234') === -1) entries[bh2].faults.push('P0234');
      }
    }
    if (boostLowCount >= 5) {
      for (var bl2 = boostLowStart; bl2 < 30; bl2++) {
        if (entries[bl2].faults.indexOf('P0299') === -1) entries[bl2].faults.push('P0299');
      }
    }

    // P0300: knock events > 3 in any 5-point window
    for (var t8 = 0; t8 < 30; t8++) {
      var windowEnd   = Math.min(t8 + 5, 30);
      var knockCount  = 0;
      for (var wt = t8; wt < windowEnd; wt++) {
        if (entries[wt].knock === 1) knockCount++;
      }
      if (knockCount > 3) {
        for (var wt2 = t8; wt2 < windowEnd; wt2++) {
          if (entries[wt2].faults.indexOf('P0300') === -1) entries[wt2].faults.push('P0300');
        }
      }
    }

    // P0171 / P0172: AFR streaks
    var afrHighCount = 0;
    var afrHighStart = -1;
    var afrLowCount  = 0;
    var afrLowStart  = -1;

    for (var t9 = 0; t9 < 30; t9++) {
      var afr9 = entries[t9].afr;

      if (afr9 > 14.8) {
        if (afrHighStart < 0) afrHighStart = t9;
        afrHighCount++;
      } else {
        if (afrHighCount >= 4) {
          for (var ah = afrHighStart; ah < t9; ah++) {
            if (entries[ah].faults.indexOf('P0171') === -1) entries[ah].faults.push('P0171');
          }
        }
        afrHighCount = 0;
        afrHighStart = -1;
      }

      if (afr9 < 12.0) {
        if (afrLowStart < 0) afrLowStart = t9;
        afrLowCount++;
      } else {
        if (afrLowCount >= 4) {
          for (var al = afrLowStart; al < t9; al++) {
            if (entries[al].faults.indexOf('P0172') === -1) entries[al].faults.push('P0172');
          }
        }
        afrLowCount = 0;
        afrLowStart = -1;
      }
    }
    // Flush open streaks
    if (afrHighCount >= 4) {
      for (var ah2 = afrHighStart; ah2 < 30; ah2++) {
        if (entries[ah2].faults.indexOf('P0171') === -1) entries[ah2].faults.push('P0171');
      }
    }
    if (afrLowCount >= 4) {
      for (var al2 = afrLowStart; al2 < 30; al2++) {
        if (entries[al2].faults.indexOf('P0172') === -1) entries[al2].faults.push('P0172');
      }
    }

    return entries;
  }

  // ─── 4. generateWorkshopCase ─────────────────────────────────────────────

  /**
   * Returns a workshop case enriched with dirty map data.
   * @param {number} level  Difficulty level (1-7)
   * @returns {Object}
   */
  function generateWorkshopCase(level) {
    var cases = (window.FM_DATA.WORKSHOP_CASES || []).filter(function (c) {
      return c.difficulty <= level;
    });

    if (cases.length === 0) {
      console.warn('FM_GEN.generateWorkshopCase : aucun cas disponible pour le niveau ' + level);
      return null;
    }

    // Pick a pseudo-random case based on level seed
    var rng = _createSeededRNG(level * 31 + 7);
    var idx = Math.floor(rng() * cases.length);
    var workshopCase = cases[idx];

    var mapDifficulty = level <= 3 ? 1 : 2;
    var dirtyMaps = {};

    var mapsInvolved = workshopCase.mapsInvolved || [];
    for (var i = 0; i < mapsInvolved.length; i++) {
      var mapId = mapsInvolved[i].mapId || mapsInvolved[i];
      if (typeof mapId === 'string') {
        dirtyMaps[mapId] = generateDirtyMap(mapId, mapDifficulty, level * 17 + i);
      }
    }

    return Object.assign({}, workshopCase, { dirtyMaps: dirtyMaps });
  }

  // ─── 5. adaptDifficulty ──────────────────────────────────────────────────

  /**
   * Returns a recommended difficulty level based on past scores.
   * @param {string} exerciseId   (unused in calculation, reserved for future use)
   * @param {number[]} userHistory  Past scores for exercises of the same type
   * @returns {1|2|3}
   */
  function adaptDifficulty(exerciseId, userHistory) {
    if (!Array.isArray(userHistory) || userHistory.length === 0) {
      return 1;
    }

    var sum = 0;
    for (var i = 0; i < userHistory.length; i++) {
      sum += userHistory[i];
    }
    var mean = sum / userHistory.length;

    if (mean < 40)  return 1;
    if (mean <= 75) return 2;
    return 3;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    generateDirtyMap:     generateDirtyMap,
    generateLogWithNoise: generateLogWithNoise,
    simulateLogFromMap:   simulateLogFromMap,
    generateWorkshopCase: generateWorkshopCase,
    adaptDifficulty:      adaptDifficulty,
  };

})();
