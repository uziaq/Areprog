/* ═══════════════════════════════════════════
   AREPROG — Formation Cartographie ECU
   formation-ui.js — Interface utilisateur SPA
   ═══════════════════════════════════════════ */

window.FM_UI = (function () {

  // ─── State ────────────────────────────────────────────────────────────────

  var state = {
    currentScreen: 'dashboard',
    currentLevelId: null,
    currentExercise: null,
    mapEditorInstance: null,
    mapEditorInstance2: null,
    logViewerInstance: null,
    userValues: null,
    dirtyValues: null,
    selectedDiscoveryBlock: null,
    hintIndex: 0,
    rngSeed: Date.now(),
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function deepCopy2D(arr) {
    return arr.map(function (row) { return row.slice(); });
  }

  function lerpColor(t) {
    // 0 → green, 0.5 → orange, 1 → red (rgba strings)
    if (t <= 0)   return 'rgba(52,211,153,0.22)';
    if (t < 0.5)  return 'rgba(245,158,11,' + (0.3 + t * 0.4) + ')';
    return 'rgba(248,113,113,' + (0.45 + (t - 0.5) * 0.4) + ')';
  }

  function showToast(msg, type) {
    var el = document.getElementById('fm-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'fm-toast' + (type ? ' fm-toast-' + type : '');
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.add('hidden'); }, 3000);
  }

  function engineTypeLabel(engineType) {
    return engineType === 'diesel' ? 'Diesel' : engineType === 'gasoline' ? 'Essence' : 'Mixte';
  }

  function exerciseTypeIcon(type) {
    var icons = {
      'map-fix': '🔧', 'log-analyze': '📊', 'map-to-log': '🔁',
      'workshop': '🏭', 'map-discovery': '🔍', 'tuning-strategy': '🎯', 'raw-block': '💻'
    };
    return icons[type] || '⚙️';
  }

  function getMap(mapId) {
    return (FM_DATA.MAPS || []).find(function (m) { return m.id === mapId; }) || null;
  }

  function getExercise(exerciseId) {
    return (FM_DATA.EXERCISES || []).find(function (e) { return e.id === exerciseId; }) || null;
  }

  function getLevel(levelId) {
    return (FM_DATA.LEVELS || []).find(function (l) { return l.id === levelId; }) || null;
  }

  function progressData() {
    return FM_ENGINE.checkProgression();
  }

  function exerciseResult(exerciseId) {
    var p = progressData();
    return (p.completedExercises || {})[exerciseId] || null;
  }

  // ─── Screen navigation ────────────────────────────────────────────────────

  function showScreen(screenId) {
    var screens = document.querySelectorAll('.fm-screen');
    screens.forEach(function (s) { s.classList.add('hidden'); });
    var target = document.getElementById('fm-screen-' + screenId);
    if (target) {
      target.classList.remove('hidden');
      state.currentScreen = screenId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  function renderDashboard() {
    var container = document.getElementById('fm-screen-dashboard');
    if (!container) return;

    var p = progressData();
    var allExercises = FM_DATA.EXERCISES || [];
    var completed = Object.keys(p.completedExercises || {});
    var passedCount = completed.filter(function (id) {
      return (p.completedExercises[id].passed);
    }).length;
    var scores = completed.map(function (id) { return p.completedExercises[id].score || 0; });
    var avgScore = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : 0;

    var statsHtml = '<div class="fm-stats-bar">' +
      '<div class="fm-stat"><div class="fm-stat-value">' + passedCount + '/' + allExercises.length + '</div><div class="fm-stat-label">Exercices réussis</div></div>' +
      '<div class="fm-stat"><div class="fm-stat-value">' + (avgScore || '—') + (avgScore ? '/100' : '') + '</div><div class="fm-stat-label">Score moyen</div></div>' +
      '<div class="fm-stat"><div class="fm-stat-value">' + p.currentLevel + '/7</div><div class="fm-stat-label">Niveau actuel</div></div>' +
      '</div>';

    var levelsHtml = '';
    (FM_DATA.LEVELS || []).forEach(function (level) {
      var mandatoryIds = level.mandatoryExerciseIds || [];
      var mandatoryTotal = mandatoryIds.length;
      var mandatoryDone = mandatoryIds.filter(function (id) {
        var r = exerciseResult(id);
        return r && r.passed;
      }).length;

      var unlocked = FM_ENGINE.canUnlockLevel(level.id);
      var allDone = mandatoryDone >= mandatoryTotal && mandatoryTotal > 0;
      var stateClass = !unlocked ? 'fm-level-locked' : allDone ? 'fm-level-complete' : 'fm-level-available';

      var ringCirc = 2 * Math.PI * 20;
      var ringDash = mandatoryTotal > 0 ? (mandatoryDone / mandatoryTotal) * ringCirc : 0;
      var ringColor = allDone ? 'var(--green)' : 'var(--blue)';

      var progressHtml = !unlocked
        ? '<div class="fm-lock-icon">🔒</div>'
        : '<svg class="fm-ring-svg" width="52" height="52" viewBox="0 0 52 52">' +
          '<circle cx="26" cy="26" r="20" fill="none" stroke="var(--border2)" stroke-width="4"/>' +
          '<circle cx="26" cy="26" r="20" fill="none" stroke="' + ringColor + '" stroke-width="4"' +
          ' stroke-dasharray="' + ringDash.toFixed(1) + ' ' + ringCirc.toFixed(1) + '"' +
          ' stroke-linecap="round" transform="rotate(-90 26 26)"/>' +
          '</svg>' +
          '<div class="fm-ring-text">' + mandatoryDone + '/' + mandatoryTotal + '</div>';

      levelsHtml += '<div class="fm-level-card ' + stateClass + '" data-level-id="' + level.id + '">' +
        '<div class="fm-level-number">N' + level.id + '</div>' +
        '<div class="fm-level-info">' +
        '<div class="fm-level-label">' + escHtml(level.label) + '</div>' +
        '<div class="fm-level-subtitle">' + escHtml(level.subtitle) + '</div>' +
        '<div class="fm-level-engine-badge fm-badge-' + level.engineType + '">' + engineTypeLabel(level.engineType) + '</div>' +
        '<button class="fm-btn fm-btn-primary" onclick="FM_UI.openLevel(' + level.id + ')"' +
        (unlocked ? '' : ' disabled') + '>' +
        (allDone ? 'Revoir' : unlocked ? 'Ouvrir' : 'Verrouillé') + '</button>' +
        '</div>' +
        '<div class="fm-level-progress">' + progressHtml + '</div>' +
        '</div>';
    });

    container.innerHTML = '<div class="fm-dashboard">' +
      '<div class="fm-dashboard-header">' +
      '<h1 class="display">Formation <em>ECU</em></h1>' +
      '<p>Parcours de formation cartographie moteur — 7 niveaux progressifs</p>' +
      statsHtml +
      '</div>' +
      '<div class="fm-levels-grid">' + levelsHtml + '</div>' +
      '</div>';
  }

  // ─── Level screen ─────────────────────────────────────────────────────────

  function openLevel(levelId) {
    if (!FM_ENGINE.canUnlockLevel(levelId)) {
      showProgressGate(levelId);
      return;
    }
    state.currentLevelId = levelId;
    renderLevelScreen(levelId);
    showScreen('level');
  }

  function renderLevelScreen(levelId) {
    var container = document.getElementById('fm-screen-level');
    if (!container) return;
    var level = getLevel(levelId);
    if (!level) return;

    var exercises = (FM_DATA.EXERCISES || []).filter(function (e) { return e.level === levelId; });

    var exerciseListHtml = exercises.map(function (ex) {
      var result = exerciseResult(ex.id);
      var scoreHtml = result
        ? '<div class="fm-exercise-score ' + (result.passed ? 'pass' : 'fail') + '">' + result.score + '</div>'
        : '<div class="fm-exercise-score">—</div>';
      var mandatoryBadge = ex.mandatory
        ? '<span class="fm-mandatory-badge">Obligatoire</span>'
        : '';
      var completedClass = result && result.passed ? 'fm-exercise-completed' : '';
      return '<div class="fm-exercise-item ' + completedClass + '">' +
        '<div class="fm-exercise-icon">' + exerciseTypeIcon(ex.type) + '</div>' +
        '<div class="fm-exercise-info">' +
        '<div class="fm-exercise-title">' + escHtml(ex.title) + mandatoryBadge + '</div>' +
        '<div class="fm-exercise-desc">' + escHtml(ex.description) + '</div>' +
        '<div class="fm-exercise-meta">Type : ' + escHtml(ex.type) +
        ' &nbsp;|&nbsp; Moteur : ' + engineTypeLabel(ex.engineType) +
        ' &nbsp;|&nbsp; Difficulté : ' + '★'.repeat(ex.difficulty) + '☆'.repeat(3 - ex.difficulty) +
        '</div>' +
        '</div>' +
        scoreHtml +
        '<button class="fm-btn fm-btn-primary" onclick="FM_UI.startExercise(\'' + escHtml(ex.id) + '\')">' +
        (result ? 'Refaire' : 'Démarrer') + '</button>' +
        '</div>';
    }).join('');

    container.innerHTML = '<div class="fm-level-screen">' +
      '<div class="fm-level-nav">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showScreen(\'dashboard\')">← Tableau de bord</button>' +
      '</div>' +
      '<div class="fm-theory-card">' + (level.theoryHtml || '') + '</div>' +
      '<div class="fm-section-title">Exercices du ' + escHtml(level.label) + '</div>' +
      '<div class="fm-exercise-list">' + exerciseListHtml + '</div>' +
      '</div>';
  }

  // ─── Progress gate ────────────────────────────────────────────────────────

  function showProgressGate(levelId) {
    var container = document.getElementById('fm-screen-level');
    if (!container) return;

    var prevLevelId = levelId - 1;
    var prevLevel = getLevel(prevLevelId);
    if (!prevLevel) return;

    var missing = (prevLevel.mandatoryExerciseIds || []).filter(function (id) {
      var r = exerciseResult(id);
      return !r || !r.passed;
    });
    var ex = (FM_DATA.EXERCISES || []);
    var reqHtml = missing.map(function (id) {
      var e = ex.find(function (e) { return e.id === id; }) || {};
      return '<div class="fm-gate-req-item">' + escHtml(e.title || id) + '</div>';
    }).join('');

    container.innerHTML = '<div class="fm-progress-gate">' +
      '<div class="fm-gate-icon">🔒</div>' +
      '<h3>Niveau ' + levelId + ' verrouillé</h3>' +
      '<p>Réussissez les exercices obligatoires du Niveau ' + prevLevelId + ' (score ≥ 60) pour débloquer ce niveau.</p>' +
      '<div class="fm-gate-requirements">' + reqHtml + '</div>' +
      '<button class="fm-btn fm-btn-primary" onclick="FM_UI.openLevel(' + prevLevelId + ')">Aller au Niveau ' + prevLevelId + '</button>' +
      '</div>';
    showScreen('level');
  }

  // ─── Start exercise ───────────────────────────────────────────────────────

  function startExercise(exerciseId) {
    var exercise = getExercise(exerciseId);
    if (!exercise) { showToast('Exercice introuvable', 'error'); return; }
    state.currentExercise = exercise;
    state.hintIndex = 0;
    renderExerciseScreen(exercise);
    showScreen('exercise');
  }

  function renderExerciseScreen(exercise) {
    var container = document.getElementById('fm-screen-exercise');
    if (!container) return;

    var headerHtml = '<div class="fm-exercise-header">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showScreen(\'level\')">← Retour</button>' +
      '<div class="fm-exercise-title-bar">' +
      '<span class="fm-type-badge">' + escHtml(exercise.type) + '</span>' +
      '<h2>' + escHtml(exercise.title) + '</h2>' +
      '<span class="fm-engine-badge fm-badge-' + exercise.engineType + '">' + engineTypeLabel(exercise.engineType) + '</span>' +
      '</div>' +
      '<p class="fm-exercise-description">' + escHtml(exercise.description) + '</p>' +
      '</div>';

    var bodyHtml = '';
    switch (exercise.type) {
      case 'map-fix':       bodyHtml = buildMapFixBody(exercise);       break;
      case 'log-analyze':   bodyHtml = buildLogAnalyzeBody(exercise);   break;
      case 'map-to-log':    bodyHtml = buildMapToLogBody(exercise);     break;
      case 'workshop':      bodyHtml = buildWorkshopBody(exercise);     break;
      case 'map-discovery': bodyHtml = buildMapDiscoveryBody(exercise); break;
      case 'tuning-strategy': bodyHtml = buildTuningStrategyBody(exercise); break;
      case 'raw-block':     bodyHtml = buildRawBlockBody(exercise);     break;
      default:              bodyHtml = '<p>Type d\'exercice non supporté.</p>';
    }

    container.innerHTML = headerHtml + bodyHtml;

    // Post-render: initialize map editors, log viewers, etc.
    setTimeout(function () { initExerciseComponents(exercise); }, 50);
  }


  // ─── Exercise body builders ───────────────────────────────────────────────

  function buildMapFixBody(exercise) {
    var map = getMap(exercise.targetMapId);
    if (!map) return '<p>Cartographie introuvable.</p>';
    return '<div class="fm-map-fix-layout">' +
      '<div class="fm-map-editor-container" id="fm-map-editor-wrap"></div>' +
      '<div class="fm-consequence-panel" id="fm-consequence-panel">' +
      '<h4>Conséquences moteur</h4>' +
      '<div id="fm-consequence-list"><p class="fm-muted">Cliquez sur une cellule pour voir les conséquences.</p></div>' +
      '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-danger" onclick="FM_UI.resetMapEdit()">Réinitialiser</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitMapFix()">Valider</button>' +
      '</div>';
  }

  function buildLogAnalyzeBody(exercise) {
    var logConfig = exercise.logConfig || {};
    var allFindings = (logConfig.correctFindings || []).concat([
      'déséquilibre cylindres', 'capteur lambda défaillant', 'fuite admission', 'pompe carburant usée'
    ]).slice(0, 8);
    // Shuffle array
    for (var i = allFindings.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = allFindings[i]; allFindings[i] = allFindings[j]; allFindings[j] = tmp;
    }
    var checkboxHtml = allFindings.map(function (f, idx) {
      return '<label class="fm-finding-check"><input type="checkbox" name="finding" value="' + escHtml(f) + '"> ' + escHtml(f) + '</label>';
    }).join('');
    var symptomsHtml = (logConfig.symptoms || []).map(function (s) { return '<li>' + escHtml(s) + '</li>'; }).join('');
    return '<div class="fm-log-analyze-layout">' +
      '<div class="fm-workshop-symptoms"><h4>Symptômes observés</h4><ul>' + symptomsHtml + '</ul></div>' +
      '<div class="fm-log-viewer-wrap" id="fm-log-viewer-wrap"></div>' +
      '<div class="fm-log-findings">' +
      '<h4>Vos observations</h4>' +
      '<div class="fm-findings-checklist">' + checkboxHtml + '</div>' +
      '<textarea id="fm-log-notes" placeholder="Notez vos observations supplémentaires..."></textarea>' +
      '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitLogAnalysis()">Soumettre l\'analyse</button>' +
      '</div>';
  }

  function buildMapToLogBody(exercise) {
    return '<div class="fm-map-to-log-layout">' +
      '<div class="fm-map-editor-panel">' +
      '<h4>Cartographie à modifier</h4>' +
      '<div id="fm-maptolog-editor-wrap"></div>' +
      '<button class="fm-btn fm-btn-secondary" onclick="FM_UI.simulateLog()" style="margin-top:10px">Simuler le log ▶</button>' +
      '</div>' +
      '<div class="fm-log-panel">' +
      '<h4>Log simulé</h4>' +
      '<div class="fm-log-viewer-wrap" id="fm-maptolog-log-wrap"></div>' +
      '<div class="fm-fault-list" id="fm-maptolog-faults"></div>' +
      '</div>' +
      '</div>' +
      '<div class="fm-maptolog-analysis">' +
      '<h4>Votre analyse</h4>' +
      '<p style="color:var(--text2);font-size:.9rem;margin-bottom:10px">Ce réglage est-il sécurisé pour le moteur ?</p>' +
      '<div class="fm-radio-group">' +
      '<label><input type="radio" name="safety" value="safe"> Sécurisé</label>' +
      '<label><input type="radio" name="safety" value="risky"> Risqué</label>' +
      '<label><input type="radio" name="safety" value="dangerous"> Dangereux</label>' +
      '</div>' +
      '<textarea id="fm-maptolog-analysis" placeholder="Justifiez votre analyse en vous appuyant sur le log simulé..."></textarea>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitMapToLog()">Valider l\'analyse</button>' +
      '</div>';
  }

  function buildWorkshopBody(exercise) {
    var caseId = exercise.workshopCaseId;
    var wCase = (FM_DATA.WORKSHOP_CASES || []).find(function (c) { return c.id === caseId; });
    if (!wCase) return '<p>Cas atelier introuvable.</p>';
    var symptomsHtml = wCase.symptoms.map(function (s) { return '<li>' + escHtml(s) + '</li>'; }).join('');
    var faultsHtml = wCase.symptoms
      .filter(function (s) { return /P\d{4}/.test(s); })
      .map(function (s) {
        var m = s.match(/P\d{4}/g) || [];
        return m.map(function (code) { return '<span class="fm-fault-badge">' + code + '</span>'; }).join('');
      }).join('');
    return '<div class="fm-workshop-layout">' +
      '<div class="fm-workshop-symptoms">' +
      '<h4>Dossier client — ' + escHtml(wCase.vehicle) + '</h4>' +
      '<ul>' + symptomsHtml + '</ul>' +
      (faultsHtml ? '<div class="fm-fault-list" style="margin-top:12px">' + faultsHtml + '</div>' : '') +
      '</div>' +
      '<div class="fm-workshop-analysis">' +
      '<h4>Votre diagnostic</h4>' +
      '<textarea id="fm-workshop-text" rows="8" placeholder="Décrivez : la cause probable, les cartographies impliquées, votre plan de correction et les vérifications à effectuer..."></textarea>' +
      '<p class="fm-ai-notice">Votre analyse sera évaluée par un formateur IA (score /100 + corrections détaillées).</p>' +
      '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitWorkshop()">Soumettre le diagnostic</button>' +
      '</div>';
  }

  function buildMapDiscoveryBody(exercise) {
    var map = getMap(exercise.targetMapId);
    var cfg = exercise.discoveryConfig || {};
    // Build 3 blocks: 1 correct + 2 false positives
    var blocks = buildDiscoveryBlocks(map, cfg);
    var blocksHtml = blocks.map(function (block, idx) {
      return '<div class="fm-discovery-block" data-block-idx="' + idx + '" data-correct="' + block.correct + '" onclick="FM_UI.selectDiscoveryBlock(this)">' +
        '<div class="fm-discovery-block-title">' + escHtml(block.title) + '</div>' +
        '<div class="fm-discovery-block-meta">Axe X : ' + escHtml(block.xLabel) + ' | Axe Y : ' + escHtml(block.yLabel) + ' | Unité : ' + escHtml(block.unit) + '</div>' +
        '<div class="fm-discovery-preview">' + block.preview + '</div>' +
        '</div>';
    }).join('');
    return '<div class="fm-discovery-layout">' +
      '<p class="fm-discovery-instruction">' +
      'Parmi les ' + blocks.length + ' blocs de données ECU suivants, identifiez la cartographie de type <strong>' + escHtml(cfg.correctCategory || '') + '</strong>.' +
      '</p>' +
      '<div class="fm-discovery-blocks">' + blocksHtml + '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitMapDiscovery()">Valider ma sélection</button>' +
      '</div>';
  }

  function buildMapDiscoveryBody(exercise) {
    var map = getMap(exercise.targetMapId);
    var cfg = exercise.discoveryConfig || {};
    var blocks = buildDiscoveryBlocks(map, cfg);
    var blocksHtml = blocks.map(function (block, idx) {
      return '<div class="fm-discovery-block" data-block-idx="' + idx + '" data-correct="' + block.correct + '" onclick="FM_UI.selectDiscoveryBlock(this)">' +
        '<div class="fm-discovery-block-title">' + escHtml(block.title) + '</div>' +
        '<div class="fm-discovery-block-meta">X: ' + escHtml(block.xLabel) + ' | Y: ' + escHtml(block.yLabel) + ' | Unité: ' + escHtml(block.unit) + '</div>' +
        '<div class="fm-discovery-preview">' + block.preview + '</div>' +
        '</div>';
    }).join('');
    return '<div class="fm-discovery-layout">' +
      '<p class="fm-discovery-instruction">Identifiez la cartographie de type <strong>' + escHtml(cfg.correctCategory || '') + '</strong> (' + escHtml(cfg.correctUnit || '') + ') parmi ces blocs.</p>' +
      '<div class="fm-discovery-blocks">' + blocksHtml + '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitMapDiscovery()">Valider</button>' +
      '</div>';
  }

  function buildTuningStrategyBody(exercise) {
    var cfg = exercise.strategyConfig || {};
    var constraintsHtml = (cfg.constraints || []).map(function (c) { return '<li>' + escHtml(c) + '</li>'; }).join('');
    var mapsHtml = (FM_DATA.MAPS || []).map(function (m) {
      return '<label class="fm-map-checkbox">' +
        '<input type="checkbox" name="strategy_map" value="' + escHtml(m.id) + '">' +
        '<div class="fm-map-checkbox-info">' +
        '<div class="fm-map-checkbox-label">' + escHtml(m.label) + '</div>' +
        '<div class="fm-map-checkbox-meta">' + engineTypeLabel(m.engineType) + ' · ' + escHtml(m.category) + ' · ' + escHtml(m.unit) + '</div>' +
        '</div>' +
        '</label>';
    }).join('');
    return '<div class="fm-strategy-layout">' +
      '<div class="fm-strategy-brief">' +
      '<h4>Dossier client</h4>' +
      '<p><strong>Objectif :</strong> ' + escHtml(cfg.objective || '') + '</p>' +
      '<ul class="fm-constraints-list">' + constraintsHtml + '</ul>' +
      '</div>' +
      '<div class="fm-strategy-maps">' +
      '<h4>Cartographies disponibles — Sélectionnez celles à modifier</h4>' +
      '<div class="fm-map-checkboxes">' + mapsHtml + '</div>' +
      '</div>' +
      '<div class="fm-strategy-reasoning">' +
      '<h4>Justification</h4>' +
      '<textarea id="fm-strategy-text" rows="5" placeholder="Expliquez votre choix et l\'ordre d\'intervention..."></textarea>' +
      '</div>' +
      '</div>' +
      '<div class="fm-exercise-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.showHint()">Indice</button>' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitTuningStrategy()">Valider la stratégie</button>' +
      '</div>';
  }

  function buildRawBlockBody(exercise) {
    setTimeout(function () { openRawOverlay(exercise); }, 100);
    return '<div style="padding:40px;text-align:center;color:var(--muted)">' +
      '<p>Ouverture du visualiseur ECU brut...</p>' +
      '</div>';
  }


  // ─── Map Editor ───────────────────────────────────────────────────────────

  function MapEditor(containerId, mapId, initialValues, opts) {
    this.mapId = mapId;
    this.map = getMap(mapId);
    this.values = deepCopy2D(initialValues);
    this.initialValues = deepCopy2D(initialValues);
    this.hoveredCell = null;
    this.canvas = null;
    this.rafPending = false;
    this.readOnly = (opts && opts.readOnly) || false;
    this.showConsequences = (opts && opts.showConsequences !== false);
    this._build(containerId);
  }

  MapEditor.prototype._build = function (containerId) {
    var self = this;
    var container = document.getElementById(containerId);
    if (!container || !this.map) return;

    var map = this.map;
    var rows = map.yAxis.values.length;
    var cols = map.xAxis.values.length;

    // Axis X label
    var axisXHtml = '<div class="fm-axis-label-x">' + escHtml(map.xAxis.label) + ' (' + escHtml(map.xAxis.unit) + ')</div>';

    // Table header
    var theadHtml = '<thead><tr><th></th>';
    for (var c = 0; c < cols; c++) {
      theadHtml += '<th>' + map.xAxis.values[c] + '</th>';
    }
    theadHtml += '</tr></thead>';

    // Table body
    var tbodyHtml = '<tbody>';
    for (var r = 0; r < rows; r++) {
      tbodyHtml += '<tr>';
      // Y axis cell
      tbodyHtml += '<td style="padding:2px 6px;color:var(--muted);font-size:.68rem;text-align:right;white-space:nowrap;border:none">' + map.yAxis.values[r] + '</td>';
      for (var c2 = 0; c2 < cols; c2++) {
        var val = this.values[r][c2];
        var step = map.category === 'boost' || map.category === 'lambda' ? '0.01' : map.category === 'ignition' ? '0.5' : '1';
        tbodyHtml += '<td><input type="number" class="fm-cell-input" ' +
          'data-r="' + r + '" data-c="' + c2 + '" ' +
          'value="' + val + '" step="' + step + '" ' +
          (this.readOnly ? 'readonly ' : '') +
          'min="' + map.safeRange[0] * 0.5 + '" max="' + map.safeRange[1] * 1.3 + '">' +
          '</td>';
      }
      tbodyHtml += '</tr>';
    }
    tbodyHtml += '</tbody>';

    var editorHtml = '<div class="fm-map-editor">' +
      '<div class="fm-map-editor-title">' + escHtml(map.label) + '</div>' +
      '<div class="fm-map-editor-subtitle">' + escHtml(map.xAxis.label) + ' × ' + escHtml(map.yAxis.label) + '</div>' +
      axisXHtml +
      '<div class="fm-map-wrap" id="fm-wrap-' + escHtml(mapId) + '">' +
      '<table class="fm-map-table" id="fm-tbl-' + escHtml(this.mapId) + '">' + theadHtml + tbodyHtml + '</table>' +
      '<canvas class="fm-map-canvas" id="fm-canvas-' + escHtml(this.mapId) + '"></canvas>' +
      '</div>' +
      '<div class="fm-map-unit">Unité : ' + escHtml(map.unit) + '</div>' +
      '<div class="fm-map-legend">' +
      '<div class="fm-legend-item"><div class="fm-legend-dot" style="background:rgba(52,211,153,.5)"></div>Dans les tolérances</div>' +
      '<div class="fm-legend-item"><div class="fm-legend-dot" style="background:rgba(245,158,11,.6)"></div>Zone warning</div>' +
      '<div class="fm-legend-item"><div class="fm-legend-dot" style="background:rgba(248,113,113,.7)"></div>Zone danger</div>' +
      '</div>' +
      '</div>';

    container.innerHTML = editorHtml;

    // Setup canvas after DOM render
    var mapId = this.mapId;
    setTimeout(function () {
      var wrap = document.getElementById('fm-wrap-' + mapId);
      var tbl = document.getElementById('fm-tbl-' + mapId);
      var cnv = document.getElementById('fm-canvas-' + mapId);
      if (!wrap || !tbl || !cnv) return;
      var rect = tbl.getBoundingClientRect();
      cnv.width = Math.round(rect.width);
      cnv.height = Math.round(rect.height);
      self.canvas = cnv;
      self.drawHeatmap();
    }, 100);

    // Setup event listeners
    var tblEl = document.getElementById('fm-tbl-' + this.mapId);
    if (!tblEl) return;

    if (!this.readOnly) {
      tblEl.addEventListener('input', function (e) {
        var inp = e.target;
        if (!inp.classList.contains('fm-cell-input')) return;
        var r = parseInt(inp.dataset.r, 10);
        var c = parseInt(inp.dataset.c, 10);
        var v = parseFloat(inp.value) || 0;
        self.values[r][c] = v;
        self.drawHeatmap();
        if (self.showConsequences) {
          updateConsequencePanel(self.mapId, self.values, r, c);
        }
        // Update global state
        state.userValues = self.values;
      });
    }

    tblEl.addEventListener('mouseover', function (e) {
      var inp = e.target;
      if (!inp.classList.contains('fm-cell-input')) return;
      self.hoveredCell = [parseInt(inp.dataset.r, 10), parseInt(inp.dataset.c, 10)];
      self.drawHeatmap();
    });
    tblEl.addEventListener('mouseout', function (e) {
      if (!e.target.classList.contains('fm-cell-input')) return;
      self.hoveredCell = null;
      self.drawHeatmap();
    });
  };

  MapEditor.prototype.drawHeatmap = function () {
    if (this.rafPending) return;
    this.rafPending = true;
    var self = this;
    requestAnimationFrame(function () {
      self.rafPending = false;
      var canvas = self.canvas;
      if (!canvas || !canvas.getContext) return;
      var ctx = canvas.getContext('2d');
      var map = self.map;
      var ref = map.referenceValues;
      var rows = self.values.length;
      if (!rows) return;
      var cols = self.values[0].length;
      var cW = canvas.width / cols;
      var cH = canvas.height / rows;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var v = parseFloat(self.values[r][c]) || 0;
          var refV = ref[r][c];
          var delta = Math.abs(v - refV);
          var t;

          if (v < map.safeRange[0] || v > map.safeRange[1]) {
            t = 1.2; // beyond safe → deep red
          } else if (delta <= map.warningRange * 0.4) {
            t = 0;
          } else if (delta <= map.warningRange) {
            t = (delta - map.warningRange * 0.4) / (map.warningRange * 0.6) * 0.35;
          } else if (delta <= map.dangerRange) {
            t = 0.35 + (delta - map.warningRange) / (map.dangerRange - map.warningRange) * 0.5;
          } else {
            t = 1;
          }

          ctx.fillStyle = lerpColor(Math.min(t, 1));
          ctx.fillRect(c * cW, r * cH, cW, cH);

          if (self.hoveredCell && self.hoveredCell[0] === r && self.hoveredCell[1] === c) {
            ctx.strokeStyle = 'rgba(33,150,243,.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(c * cW + 1, r * cH + 1, cW - 2, cH - 2);
          }
        }
      }
    });
  };

  MapEditor.prototype.reset = function () {
    this.values = deepCopy2D(this.initialValues);
    var tbl = document.getElementById('fm-tbl-' + this.mapId);
    if (tbl) {
      var inputs = tbl.querySelectorAll('.fm-cell-input');
      inputs.forEach(function (inp) {
        var r = parseInt(inp.dataset.r, 10);
        var c = parseInt(inp.dataset.c, 10);
        // access this.values via closure impossible here; re-read from initialValues
      });
    }
    // Rebuild is simpler
    var wrap = document.getElementById('fm-wrap-' + this.mapId);
    if (wrap) {
      // update all input values
      var self = this;
      var inputs = document.querySelectorAll('#fm-tbl-' + this.mapId + ' .fm-cell-input');
      inputs.forEach(function (inp) {
        var r = parseInt(inp.dataset.r, 10);
        var c = parseInt(inp.dataset.c, 10);
        inp.value = self.values[r][c];
      });
      this.drawHeatmap();
    }
    state.userValues = this.values;
  };

  MapEditor.prototype.getValues = function () { return this.values; };


  // ─── Log Viewer ───────────────────────────────────────────────────────────

  function LogViewer(containerId, logEntries, engineType) {
    this.entries = logEntries || [];
    this.engineType = engineType;
    this.canvas = null;
    this._build(containerId);
  }

  LogViewer.prototype._build = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<canvas class="fm-log-canvas" id="fm-log-cnv-' + containerId + '" width="620" height="200"></canvas>';
    this.canvas = document.getElementById('fm-log-cnv-' + containerId);
    this.draw();
  };

  LogViewer.prototype.update = function (logEntries) {
    this.entries = logEntries;
    this.draw();
  };

  LogViewer.prototype.draw = function () {
    var canvas = this.canvas;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var pad = { top: 24, right: 16, bottom: 36, left: 44 };
    var plotW = W - pad.left - pad.right;
    var plotH = H - pad.top - pad.bottom;
    var entries = this.entries;
    var n = entries.length;
    var isGasoline = this.engineType === 'gasoline';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#17181b';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(38,40,44,.8)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var yg = pad.top + (g / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(pad.left, yg); ctx.lineTo(W - pad.right, yg); ctx.stroke();
    }

    if (!n) return;

    var series = [
      { key: 'boost',  label: 'Boost (bar)', color: '#2196F3', min: 0.8,  max: 2.5  },
      { key: 'afr',    label: isGasoline ? 'AFR' : 'λ×14.7', color: '#34D399', min: 10.0, max: 32.0 },
      { key: 'egt',    label: 'EGT (°C)',    color: '#FB923C', min: 100,  max: 900  },
      { key: 'timing', label: isGasoline ? 'Avance (°)' : 'Pression rail /100', color: '#F59E0B', min: -12, max: 35 }
    ];

    // Draw series
    series.forEach(function (s) {
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      for (var i = 0; i < n; i++) {
        var raw = entries[i][s.key];
        if (s.key === 'timing' && !isGasoline) raw = (entries[i].railPressure || 1000) / 100;
        var norm = Math.max(0, Math.min(1, (raw - s.min) / (s.max - s.min)));
        var x = pad.left + (i / Math.max(n - 1, 1)) * plotW;
        var y = pad.top + (1 - norm) * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Dots for fault points
      for (var i2 = 0; i2 < n; i2++) {
        if (entries[i2].faults && entries[i2].faults.length) {
          var raw2 = entries[i2][s.key];
          if (s.key === 'timing' && !isGasoline) raw2 = (entries[i2].railPressure || 1000) / 100;
          var norm2 = Math.max(0, Math.min(1, (raw2 - s.min) / (s.max - s.min)));
          var x2 = pad.left + (i2 / Math.max(n - 1, 1)) * plotW;
          var y2 = pad.top + (1 - norm2) * plotH;
          ctx.beginPath();
          ctx.arc(x2, y2, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#F87171';
          ctx.fill();
        }
      }
    });

    // X axis labels
    ctx.fillStyle = 'rgba(124,132,144,.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (var xi = 0; xi < n; xi += 5) {
      var xp = pad.left + (xi / Math.max(n - 1, 1)) * plotW;
      ctx.fillText('t' + xi, xp, H - 6);
    }

    // Legend
    var lx = pad.left + 4;
    var ly = pad.top + 12;
    series.forEach(function (s, si) {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx + si * 110, ly - 8, 10, 4);
      ctx.fillStyle = 'rgba(200,205,212,.8)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, lx + si * 110 + 14, ly - 2);
    });

    // Fault codes at bottom
    var faultCodes = [];
    entries.forEach(function (e) {
      (e.faults || []).forEach(function (f) {
        if (faultCodes.indexOf(f) === -1) faultCodes.push(f);
      });
    });
    if (faultCodes.length) {
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('DTC: ' + faultCodes.join(', '), pad.left, H - pad.bottom + 18);
    }
  };

  // ─── Consequence panel update ─────────────────────────────────────────────

  function updateConsequencePanel(mapId, userValues, r, c) {
    var map = getMap(mapId);
    if (!map || !map.referenceValues[r]) return;
    var refV = map.referenceValues[r][c];
    var userV = parseFloat(userValues[r][c]) || 0;
    var delta = userV - refV;
    if (Math.abs(delta) < 0.001) {
      var list = document.getElementById('fm-consequence-list');
      if (list) list.innerHTML = '<p class="fm-muted">Valeur dans les tolérances — aucun impact notable.</p>';
      return;
    }
    var direction = delta > 0 ? 'too_high' : 'too_low';
    var consequences = FM_ENGINE.resolveConsequence(map.category, direction, map.engineType, Math.abs(delta));
    var panel = document.getElementById('fm-consequence-list');
    if (!panel) return;
    if (!consequences || !consequences.length) {
      panel.innerHTML = '<p class="fm-muted">Écart faible — impact moteur négligeable.</p>';
      return;
    }
    panel.innerHTML = consequences.map(function (con) {
      return '<div class="fm-consequence-item fm-consequence-' + con.severity + '">' +
        '<span class="fm-severity-dot"></span>' +
        escHtml(con.desc) + '</div>';
    }).join('');
  }

  // ─── Discovery blocks builder ─────────────────────────────────────────────

  function buildDiscoveryBlocks(map, cfg) {
    if (!map) return [];
    // Correct block
    var correctPreview = buildMapPreview(map.referenceValues.slice(0, 4).map(function (row) { return row.slice(0, 6); }));
    var blocks = [{
      title: map.label,
      xLabel: map.xAxis.label + ' (' + map.xAxis.unit + ')',
      yLabel: map.yAxis.label + ' (' + map.yAxis.unit + ')',
      unit: map.unit,
      preview: correctPreview,
      correct: true
    }];

    // False positive 1: sensor calibration table
    var fp1Values = [];
    for (var r = 0; r < 4; r++) {
      var row = [];
      for (var c = 0; c < 6; c++) {
        row.push((0.8 + r * 0.05 + c * 0.02).toFixed(3));
      }
      fp1Values.push(row);
    }
    blocks.push({
      title: 'Table correction température',
      xLabel: 'Température (°C)',
      yLabel: 'Facteur correction',
      unit: 'facteur',
      preview: buildMapPreview(fp1Values),
      correct: false
    });

    // False positive 2: checksum / lookup table
    var fp2Values = [];
    for (var r2 = 0; r2 < 4; r2++) {
      var row2 = [];
      for (var c2 = 0; c2 < 6; c2++) {
        row2.push(Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0'));
      }
      fp2Values.push(row2);
    }
    blocks.push({
      title: 'Bloc checksum / données binaires',
      xLabel: 'Offset (hex)',
      yLabel: 'Adresse (hex)',
      unit: 'hex',
      preview: buildMapPreview(fp2Values),
      correct: false
    });

    // Shuffle
    for (var i = blocks.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = blocks[i]; blocks[i] = blocks[j]; blocks[j] = tmp;
    }
    return blocks;
  }

  function buildMapPreview(values) {
    return values.map(function (row) {
      return row.map(function (v) {
        var s = String(v);
        return s.length > 5 ? s.substring(0, 5) : s;
      }).join('  ');
    }).join('\n');
  }

  // ─── Raw block overlay ────────────────────────────────────────────────────

  function openRawOverlay(exercise) {
    var overlay = document.getElementById('fm-overlay-raw');
    var wrap = document.getElementById('fm-raw-viewer-wrap');
    if (!overlay || !wrap) return;

    var map = getMap(exercise.targetMapId);
    var hexHtml = buildHexDump(map);
    wrap.innerHTML = '<div style="color:var(--muted);font-size:.82rem;margin-bottom:12px">Sélectionnez une plage de données pour identifier la cartographie injection.</div>' +
      '<div class="fm-hex-viewer" id="fm-hex-viewer">' + hexHtml + '</div>' +
      '<div class="fm-raw-feedback" id="fm-raw-feedback" style="display:none"></div>' +
      '<div style="margin-top:16px;display:flex;gap:10px">' +
      '<button class="fm-btn fm-btn-success" onclick="FM_UI.submitRawBlock()">Valider la sélection</button>' +
      '</div>';

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    document.getElementById('fm-overlay-close').onclick = function () {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      showScreen('exercise');
    };
  }

  function buildHexDump(map) {
    var html = '';
    var totalRows = 32;
    var mapStartRow = Math.floor(Math.random() * 12) + 8;
    var mapRows = map ? map.referenceValues.length : 8;
    var mapCols = map ? map.referenceValues[0].length : 10;
    var mapRowOffset = 0;

    for (var row = 0; row < totalRows; row++) {
      var addr = (row * 16).toString(16).toUpperCase().padStart(4, '0');
      var bytesHtml = '';
      for (var b = 0; b < 16; b++) {
        var byteVal, regionClass = '';
        if (row >= mapStartRow && row < mapStartRow + mapRows && b < mapCols * 2) {
          var mapR = row - mapStartRow;
          var mapC = Math.floor(b / 2);
          if (mapR < mapRows && mapC < mapCols) {
            byteVal = Math.round(map.referenceValues[mapR][mapC]).toString(16).toUpperCase().padStart(2, '0');
            regionClass = ' map-region';
          } else {
            byteVal = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
          }
        } else if (row >= 4 && row < 8) {
          // False positive region
          byteVal = (0xA0 + Math.floor(Math.random() * 48)).toString(16).toUpperCase();
          regionClass = ' false-positive';
        } else {
          byteVal = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
        }
        bytesHtml += '<span class="fm-hex-byte' + regionClass + '" data-row="' + row + '" data-b="' + b + '">' + byteVal + '</span> ';
      }
      html += '<div class="fm-hex-row"><span class="fm-hex-addr">' + addr + ':</span><div class="fm-hex-bytes">' + bytesHtml + '</div></div>';
    }
    return html;
  }


  // ─── Component initialization after render ────────────────────────────────

  function initExerciseComponents(exercise) {
    switch (exercise.type) {
      case 'map-fix':
        var map = getMap(exercise.targetMapId);
        if (!map) return;
        state.dirtyValues = FM_GEN.generateDirtyMap(exercise.targetMapId, exercise.difficulty, exercise.id.charCodeAt(0));
        state.userValues = deepCopy2D(state.dirtyValues);
        state.mapEditorInstance = new MapEditor('fm-map-editor-wrap', exercise.targetMapId, state.dirtyValues, { showConsequences: true });
        state.userValues = state.mapEditorInstance.getValues();
        break;

      case 'log-analyze':
        var baseLog = FM_GEN.simulateLogFromMap({
          userValues: getMap(exercise.targetMapId) ? getMap(exercise.targetMapId).referenceValues : [],
          mapId: exercise.targetMapId,
          engineType: exercise.engineType
        });
        var noisyLog = FM_GEN.generateLogWithNoise(baseLog, exercise.difficulty);
        state.logViewerInstance = new LogViewer('fm-log-viewer-wrap', noisyLog, exercise.engineType);
        break;

      case 'map-to-log':
        var map2 = getMap(exercise.targetMapId);
        if (!map2) return;
        state.dirtyValues = FM_GEN.generateDirtyMap(exercise.targetMapId, exercise.difficulty, exercise.id.charCodeAt(0));
        state.userValues = deepCopy2D(state.dirtyValues);
        state.mapEditorInstance = new MapEditor('fm-maptolog-editor-wrap', exercise.targetMapId, state.dirtyValues, { showConsequences: false });
        // Initial log simulation
        var initLog = FM_GEN.simulateLogFromMap({ userValues: state.dirtyValues, mapId: exercise.targetMapId, engineType: exercise.engineType });
        state.logViewerInstance = new LogViewer('fm-maptolog-log-wrap', initLog, exercise.engineType);
        updateFaultDisplay(initLog);
        break;
    }
  }

  function updateFaultDisplay(logEntries) {
    var faultEl = document.getElementById('fm-maptolog-faults');
    if (!faultEl) return;
    var faults = [];
    (logEntries || []).forEach(function (e) {
      (e.faults || []).forEach(function (f) { if (faults.indexOf(f) === -1) faults.push(f); });
    });
    faultEl.innerHTML = faults.map(function (f) {
      var info = FM_DATA.FAULT_CODES[f] || {};
      return '<span class="fm-fault-badge" title="' + escHtml(info.desc || '') + '">' + escHtml(f) + '</span>';
    }).join('');
  }

  // ─── Exercise submit handlers ─────────────────────────────────────────────

  function submitMapFix() {
    if (!state.mapEditorInstance || !state.currentExercise) return;
    var userValues = state.mapEditorInstance.getValues();
    var result = FM_ENGINE.validateMapEdit(userValues, state.currentExercise.id);
    FM_ENGINE.saveProgress(state.currentExercise.id, result.score, result.passed);
    renderResultScreen(result);
    showScreen('result');
  }

  function submitLogAnalysis() {
    var exercise = state.currentExercise;
    if (!exercise) return;
    var checkboxes = document.querySelectorAll('input[name="finding"]:checked');
    var userAnnotations = [];
    checkboxes.forEach(function (cb) { userAnnotations.push(cb.value); });
    var notes = (document.getElementById('fm-log-notes') || {}).value || '';
    if (notes.trim()) userAnnotations.push(notes);

    var correctFindings = (exercise.logConfig || {}).correctFindings || [];
    var result = FM_ENGINE.scoreLogAnalysis(userAnnotations, correctFindings);
    FM_ENGINE.saveProgress(exercise.id, result.score, result.passed);

    renderResultScreen({
      score: result.score,
      passed: result.passed,
      safetyViolation: false,
      feedbackItems: result.feedback.map(function (f) { return { desc: f }; }),
      cellScores: [],
      summary: result.passed ? 'Bonne analyse !' : 'Analyse incomplète — révisez les indices.'
    });
    showScreen('result');
  }

  function submitMapToLog() {
    var exercise = state.currentExercise;
    if (!exercise || !state.mapEditorInstance) return;
    var safetyRadio = document.querySelector('input[name="safety"]:checked');
    var safetyValue = safetyRadio ? safetyRadio.value : null;
    var analysisText = (document.getElementById('fm-maptolog-analysis') || {}).value || '';

    if (!safetyValue) { showToast('Sélectionnez un niveau de sécurité', 'error'); return; }

    // Validate map edit
    var userValues = state.mapEditorInstance.getValues();
    var mapResult = FM_ENGINE.validateMapEdit(userValues, exercise.id);

    // Bonus/penalty based on safety assessment accuracy
    var safetyBonus = 0;
    if (mapResult.passed && safetyValue === 'safe') safetyBonus = 10;
    else if (!mapResult.passed && safetyValue === 'dangerous') safetyBonus = 10;
    else if (safetyValue === 'risky' && mapResult.score >= 40 && mapResult.score < 70) safetyBonus = 5;

    var finalScore = Math.min(100, mapResult.score + safetyBonus);
    var passed = finalScore >= 60;

    FM_ENGINE.saveProgress(exercise.id, finalScore, passed);
    renderResultScreen({
      score: finalScore,
      passed: passed,
      safetyViolation: mapResult.safetyViolation,
      feedbackItems: mapResult.feedbackItems || [],
      summary: mapResult.summary + (safetyBonus > 0 ? ' Évaluation du risque correcte (+' + safetyBonus + ' pts).' : '')
    });
    showScreen('result');
  }

  function submitWorkshop() {
    var exercise = state.currentExercise;
    if (!exercise) return;
    var text = (document.getElementById('fm-workshop-text') || {}).value || '';
    if (text.trim().length < 30) { showToast('Votre analyse doit contenir au moins 30 caractères', 'error'); return; }

    openAIModal();

    var prompt = FM_ENGINE.buildAIPrompt(exercise.workshopCaseId, text);
    FM_ENGINE.callAI(prompt).then(function (response) {
      showAIResult(response);
      // Score from AI response
      var scoreMatch = response.match(/SCORE\s+(\d+)\s*\/\s*100/i);
      var aiScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
      FM_ENGINE.saveProgress(exercise.id, aiScore, aiScore >= 60);
    }).catch(function (err) {
      showAIResult('Erreur de connexion au formateur IA. Score estimé basé sur les mots-clés.');
    });
  }

  function submitMapDiscovery() {
    var selected = document.querySelector('.fm-discovery-block.selected');
    if (!selected) { showToast('Sélectionnez un bloc', 'error'); return; }
    var isCorrect = selected.dataset.correct === 'true';
    var score = isCorrect ? 100 : 0;
    var passed = isCorrect;
    FM_ENGINE.saveProgress(state.currentExercise.id, score, passed);
    renderResultScreen({
      score: score,
      passed: passed,
      safetyViolation: false,
      feedbackItems: [],
      summary: isCorrect
        ? 'Correct ! Vous avez identifié la bonne cartographie.'
        : 'Incorrect. Relisez les indices sur les axes et unités caractéristiques.'
    });
    showScreen('result');
  }

  function submitTuningStrategy() {
    var exercise = state.currentExercise;
    if (!exercise) return;
    var selectedMaps = [];
    document.querySelectorAll('input[name="strategy_map"]:checked').forEach(function (cb) {
      selectedMaps.push(cb.value);
    });
    var reasoning = (document.getElementById('fm-strategy-text') || {}).value || '';
    var result = FM_ENGINE.scoreTuningStrategy({ selectedMaps: selectedMaps, reasoning: reasoning }, exercise.id);
    FM_ENGINE.saveProgress(exercise.id, result.score, result.passed);
    renderResultScreen({
      score: result.score,
      passed: result.passed,
      safetyViolation: false,
      feedbackItems: result.feedback.map(function (f) { return { desc: f }; }),
      summary: result.passed ? 'Bonne stratégie !' : 'Stratégie à revoir — consultez les corrections.'
    });
    showScreen('result');
  }

  function submitRawBlock() {
    var exercise = state.currentExercise;
    if (!exercise) return;
    var selectedBytes = document.querySelectorAll('.fm-hex-byte.selected');
    var hasMapRegion = false;
    selectedBytes.forEach(function (b) { if (b.classList.contains('map-region')) hasMapRegion = true; });
    var score = hasMapRegion ? (selectedBytes.length >= 8 ? 85 : 60) : 20;
    var passed = score >= 60;
    FM_ENGINE.saveProgress(exercise.id, score, passed);

    var overlay = document.getElementById('fm-overlay-raw');
    if (overlay) { overlay.classList.add('hidden'); document.body.style.overflow = ''; }

    renderResultScreen({
      score: score,
      passed: passed,
      safetyViolation: false,
      feedbackItems: [],
      summary: passed
        ? 'Bloc correctement identifié. Bonne reconnaissance des structures ECU.'
        : 'Sélection incorrecte. Relisez la théorie sur l\'identification des maps dans un dump binaire.'
    });
    showScreen('result');
  }

  // ─── Simulate log (map-to-log) ────────────────────────────────────────────

  function simulateLog() {
    if (!state.mapEditorInstance || !state.currentExercise) return;
    var userValues = state.mapEditorInstance.getValues();
    var logEntries = FM_GEN.simulateLogFromMap({
      userValues: userValues,
      mapId: state.currentExercise.targetMapId,
      engineType: state.currentExercise.engineType
    });
    if (state.logViewerInstance) {
      state.logViewerInstance.update(logEntries);
    } else {
      state.logViewerInstance = new LogViewer('fm-maptolog-log-wrap', logEntries, state.currentExercise.engineType);
    }
    updateFaultDisplay(logEntries);
    showToast('Log simulé mis à jour', 'success');
  }

  // ─── Hint ─────────────────────────────────────────────────────────────────

  function showHint() {
    var exercise = state.currentExercise;
    if (!exercise) return;
    var hints = exercise.hints || [];
    if (!hints.length) { showToast('Aucun indice disponible pour cet exercice.'); return; }
    var hint = hints[state.hintIndex % hints.length];
    state.hintIndex++;
    showToast('Indice ' + state.hintIndex + '/' + hints.length + ' : ' + hint);
  }

  function resetMapEdit() {
    if (state.mapEditorInstance) {
      state.dirtyValues = FM_GEN.generateDirtyMap(
        state.currentExercise.targetMapId,
        state.currentExercise.difficulty,
        state.currentExercise.id.charCodeAt(0)
      );
      state.mapEditorInstance.initialValues = deepCopy2D(state.dirtyValues);
      state.mapEditorInstance.values = deepCopy2D(state.dirtyValues);
      state.mapEditorInstance.reset();
      var list = document.getElementById('fm-consequence-list');
      if (list) list.innerHTML = '<p class="fm-muted">Cliquez sur une cellule pour voir les conséquences.</p>';
      showToast('Cartographie réinitialisée', 'success');
    }
  }

  function selectDiscoveryBlock(el) {
    document.querySelectorAll('.fm-discovery-block').forEach(function (b) { b.classList.remove('selected'); });
    el.classList.add('selected');
    state.selectedDiscoveryBlock = el;
  }

  // ─── Result screen ────────────────────────────────────────────────────────

  function renderResultScreen(result) {
    var container = document.getElementById('fm-screen-result');
    if (!container) return;

    var score = Math.round(result.score || 0);
    var passed = result.passed;
    var scoreClass = passed ? 'fm-score-pass' : 'fm-score-fail';
    var statusText = passed ? 'RÉUSSI' : 'INSUFFISANT';
    var statusStyle = passed
      ? 'background:rgba(52,211,153,.15);color:var(--green);border:1px solid rgba(52,211,153,.3)'
      : 'background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.3)';

    var safetyHtml = result.safetyViolation
      ? '<div class="fm-safety-alert">⚠️ Zone de danger franchie — score plafonné à 30/100</div>'
      : '';

    var feedbackHtml = '';
    if (result.feedbackItems && result.feedbackItems.length) {
      var fbRows = result.feedbackItems.map(function (item) {
        if (item.desc) {
          return '<div class="fm-feedback-row"><span class="fm-fb-consequence">' + escHtml(item.desc) + '</span></div>';
        }
        var rpmLabel = item.rpm ? 'RPM ' + item.rpm : '';
        var loadLabel = item.load ? ' / Charge ' + item.load + '%' : '';
        var errorLabel = item.error ? ' | Écart : ' + (item.direction === 'too_high' ? '+' : '-') + Math.abs(item.error).toFixed(1) : '';
        return '<div class="fm-feedback-row">' +
          '<span class="fm-fb-location">[' + (rpmLabel + loadLabel) + ']</span>' +
          '<span class="fm-fb-error">' + errorLabel + '</span>' +
          (item.consequence && item.consequence.length
            ? '<span class="fm-fb-consequence">' + escHtml(item.consequence[0].desc || '') + '</span>'
            : '') +
          '</div>';
      }).join('');
      feedbackHtml = '<div class="fm-feedback-section"><h3>Corrections détaillées</h3>' + fbRows + '</div>';
    }

    var summaryHtml = result.summary
      ? '<p style="color:var(--text2);margin:12px 0 20px">' + escHtml(result.summary) + '</p>'
      : '';

    container.innerHTML = '<div class="fm-result-screen">' +
      '<div class="fm-score-display">' +
      '<div class="fm-score-number ' + scoreClass + '">' + score + '</div>' +
      '<div class="fm-score-label">/100</div>' +
      '<div class="fm-score-status" style="' + statusStyle + '">' + statusText + '</div>' +
      '</div>' +
      safetyHtml +
      summaryHtml +
      feedbackHtml +
      '<div class="fm-result-actions">' +
      '<button class="fm-btn fm-btn-ghost" onclick="FM_UI.startExercise(\'' + escHtml(state.currentExercise ? state.currentExercise.id : '') + '\')">Recommencer</button>' +
      '<button class="fm-btn fm-btn-primary" onclick="FM_UI.openLevel(' + (state.currentLevelId || 1) + ')">Retour au niveau</button>' +
      '</div>' +
      '</div>';
  }

  // ─── AI Modal ─────────────────────────────────────────────────────────────

  function openAIModal() {
    var modal = document.getElementById('fm-modal-ai');
    if (!modal) return;
    modal.querySelector('.fm-modal-inner').innerHTML =
      '<div class="fm-modal-header">' +
      '<h3>Correction formateur IA</h3>' +
      '<button class="fm-modal-close" onclick="FM_UI.closeAIModal()">×</button>' +
      '</div>' +
      '<div class="fm-modal-body">' +
      '<div class="fm-ai-loading"><div class="fm-spinner"></div><p>Analyse en cours...</p></div>' +
      '</div>';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function showAIResult(text) {
    var modal = document.getElementById('fm-modal-ai');
    if (!modal) return;
    var scoreMatch = text.match(/SCORE\s+(\d+)\s*\/\s*100/i);
    var score = scoreMatch ? scoreMatch[1] : null;
    var bodyContent = '<div class="fm-ai-raw">' + escHtml(text).replace(/\n/g, '<br>') + '</div>';
    if (score) {
      bodyContent = '<div class="fm-ai-score">' + score + '/100</div>' + bodyContent;
    }
    var body = modal.querySelector('.fm-modal-body');
    if (body) body.innerHTML = bodyContent;
  }

  function closeAIModal() {
    var modal = document.getElementById('fm-modal-ai');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    renderDashboard();
    showScreen('dashboard');
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.FM_DATA && window.FM_GEN && window.FM_ENGINE && window.FM_UI) {
      window.FM_UI.init();
    }
  });

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    init: init,
    showScreen: showScreen,
    openLevel: openLevel,
    startExercise: startExercise,
    submitMapFix: submitMapFix,
    submitLogAnalysis: submitLogAnalysis,
    submitMapToLog: submitMapToLog,
    submitWorkshop: submitWorkshop,
    submitMapDiscovery: submitMapDiscovery,
    submitTuningStrategy: submitTuningStrategy,
    submitRawBlock: submitRawBlock,
    simulateLog: simulateLog,
    showHint: showHint,
    resetMapEdit: resetMapEdit,
    selectDiscoveryBlock: selectDiscoveryBlock,
    closeAIModal: closeAIModal,
    renderDashboard: renderDashboard,
  };

})();
