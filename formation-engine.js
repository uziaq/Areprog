window.FM_ENGINE = (function () {

  // ─── Private helpers ──────────────────────────────────────────────────────

  function _getMapById(mapId) {
    return (window.FM_DATA.MAPS || []).find(function (m) { return m.id === mapId; }) || null;
  }

  function _getExerciseById(id) {
    return (window.FM_DATA.EXERCISES || []).find(function (e) { return e.id === id; }) || null;
  }

  function _mean(arr2d) {
    var flat = [];
    for (var r = 0; r < arr2d.length; r++) {
      for (var c = 0; c < arr2d[r].length; c++) {
        flat.push(arr2d[r][c]);
      }
    }
    if (flat.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < flat.length; i++) { sum += flat[i]; }
    return sum / flat.length;
  }

  function _clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function _readProgress() {
    try {
      var raw = localStorage.getItem('fm_progress');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { completedExercises: {}, currentLevel: 1 };
  }

  function _writeProgress(data) {
    try {
      localStorage.setItem('fm_progress', JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  // ─── 1. validateMapEdit ───────────────────────────────────────────────────

  function validateMapEdit(userValues, exerciseId) {
    var exercise = _getExerciseById(exerciseId);
    if (!exercise) {
      return {
        score: 0,
        cellScores: [],
        feedbackItems: [],
        safetyViolation: false,
        passed: false,
        summary: 'Exercice introuvable.',
      };
    }

    var map = _getMapById(exercise.targetMapId);
    if (!map) {
      return {
        score: 0,
        cellScores: [],
        feedbackItems: [],
        safetyViolation: false,
        passed: false,
        summary: 'Cartographie introuvable.',
      };
    }

    var ref = map.referenceValues;
    var rows = ref.length;
    var cols = rows > 0 ? ref[0].length : 0;
    var warningRange = map.warningRange;
    var dangerRange = map.dangerRange;
    var safeMin = map.safeRange[0];
    var safeMax = map.safeRange[1];

    var cellScores = [];
    var feedbackItems = [];
    var safetyViolation = false;

    var criticalCells = (exercise.validationRules && exercise.validationRules.criticalCells)
      ? exercise.validationRules.criticalCells
      : [];

    var criticalSet = {};
    for (var k = 0; k < criticalCells.length; k++) {
      criticalSet[criticalCells[k][0] + '_' + criticalCells[k][1]] = true;
    }

    for (var r = 0; r < rows; r++) {
      cellScores.push([]);
      for (var c = 0; c < cols; c++) {
        var userVal = (userValues[r] !== undefined && userValues[r][c] !== undefined)
          ? userValues[r][c]
          : ref[r][c];
        var refVal = ref[r][c];
        var error = Math.abs(userVal - refVal);

        var cellScore;
        if (error <= warningRange) {
          cellScore = 100;
        } else if (error <= dangerRange) {
          cellScore = 60 - ((error - warningRange) / (dangerRange - warningRange)) * 40;
        } else {
          cellScore = 0;
        }

        cellScores[r].push(cellScore);

        if (userVal < safeMin || userVal > safeMax) {
          safetyViolation = true;
        }

        if (error > warningRange) {
          var direction = userVal > refVal ? 'too_high' : 'too_low';
          var consequences = resolveConsequence(map.category, direction, map.engineType, error);
          var consequence = consequences.length > 0 ? consequences[0].description : null;

          var rpmLabel = (map.xAxis && map.xAxis.values && map.xAxis.values[c] !== undefined)
            ? map.xAxis.values[c]
            : c;
          var loadLabel = (map.yAxis && map.yAxis.values && map.yAxis.values[r] !== undefined)
            ? map.yAxis.values[r]
            : r;

          feedbackItems.push({
            row: r,
            col: c,
            rpm: rpmLabel,
            load: loadLabel,
            error: Math.round(error * 100) / 100,
            direction: direction,
            consequence: consequence,
          });
        }
      }
    }

    var totalPenalty = 0;
    for (var p = 0; p < criticalCells.length; p++) {
      var cr = criticalCells[p][0];
      var cc = criticalCells[p][1];
      if (cellScores[cr] !== undefined && cellScores[cr][cc] !== undefined) {
        if (cellScores[cr][cc] < 60) {
          totalPenalty += 20;
        }
      }
    }

    var baseScore = _mean(cellScores);
    var finalScore = _clamp(Math.round(baseScore - totalPenalty), 0, 100);

    if (safetyViolation) {
      finalScore = Math.min(finalScore, 30);
    }

    var passed = finalScore >= 60;

    var summary;
    if (safetyViolation) {
      summary = 'Violation de sécurité détectée : des valeurs dépassent les limites autorisées. Score plafonné à 30/100.';
    } else if (passed) {
      summary = 'Bonne calibration. Score : ' + finalScore + '/100. ' +
        (feedbackItems.length > 0
          ? feedbackItems.length + ' cellule(s) hors tolérance d\'avertissement.'
          : 'Toutes les cellules sont dans les tolérances.');
    } else {
      summary = 'Calibration insuffisante. Score : ' + finalScore + '/100. ' +
        feedbackItems.length + ' cellule(s) hors tolérance. Revoyez les zones critiques.';
    }

    return {
      score: finalScore,
      cellScores: cellScores,
      feedbackItems: feedbackItems,
      safetyViolation: safetyViolation,
      passed: passed,
      summary: summary,
    };
  }

  // ─── 2. resolveConsequence ────────────────────────────────────────────────

  function resolveConsequence(category, direction, engineType, delta) {
    var table = window.FM_DATA.CONSEQUENCE_TABLE;
    if (!table || !Array.isArray(table)) return [];

    var severityOrder = { warning: 0, danger: 1, critical: 2 };

    var matches = table.filter(function (entry) {
      return entry.category === category &&
        entry.direction === direction &&
        (entry.engineType === engineType || entry.engineType === '*') &&
        delta >= entry.deltaThreshold;
    });

    matches.sort(function (a, b) {
      var sa = severityOrder[a.severity] !== undefined ? severityOrder[a.severity] : 0;
      var sb = severityOrder[b.severity] !== undefined ? severityOrder[b.severity] : 0;
      return sa - sb;
    });

    return matches;
  }

  // ─── 3. checkProgression ──────────────────────────────────────────────────

  function checkProgression() {
    var progress = _readProgress();
    var unlockedLevels = [];
    for (var lvl = 1; lvl <= 7; lvl++) {
      if (canUnlockLevel(lvl)) {
        unlockedLevels.push(lvl);
      }
    }
    return {
      completedExercises: progress.completedExercises,
      currentLevel: progress.currentLevel,
      unlockedLevels: unlockedLevels,
    };
  }

  // ─── 4. saveProgress ─────────────────────────────────────────────────────

  function saveProgress(exerciseId, score, passed) {
    var progress = _readProgress();

    progress.completedExercises[exerciseId] = {
      score: score,
      passed: passed,
      completedAt: new Date().toISOString(),
    };

    for (var lvl = 7; lvl >= 1; lvl--) {
      if (canUnlockLevel(lvl, progress)) {
        if (lvl > progress.currentLevel) {
          progress.currentLevel = lvl;
        }
        break;
      }
    }

    _writeProgress(progress);
  }

  // ─── 5. canUnlockLevel ────────────────────────────────────────────────────

  function canUnlockLevel(levelId, progressOverride) {
    if (levelId <= 1) return true;

    var progress = progressOverride || _readProgress();
    var previousLevel = levelId - 1;

    var mandatoryExercises = (window.FM_DATA.EXERCISES || []).filter(function (e) {
      return e.level === previousLevel && e.mandatory === true;
    });

    if (mandatoryExercises.length === 0) return true;

    for (var i = 0; i < mandatoryExercises.length; i++) {
      var ex = mandatoryExercises[i];
      var record = progress.completedExercises[ex.id];
      if (!record || record.score < 60) {
        return false;
      }
    }

    return true;
  }

  // ─── 6. buildAIPrompt ─────────────────────────────────────────────────────

  function buildAIPrompt(workshopCaseId, userAnalysis) {
    var cases = window.FM_DATA.WORKSHOP_CASES || [];
    var workshopCase = cases.find(function (c) { return c.id === workshopCaseId; }) || null;

    var caseDetails = '';
    var mapSummary = '';

    if (workshopCase) {
      caseDetails = [
        'Véhicule : ' + (workshopCase.vehicle || 'inconnu'),
        'Moteur : ' + (workshopCase.engineType || 'inconnu'),
        'Symptômes : ' + (workshopCase.symptoms || 'non renseignés'),
      ].join('\n');

      if (workshopCase.mapsInvolved && Array.isArray(workshopCase.mapsInvolved)) {
        var mapLines = workshopCase.mapsInvolved.map(function (entry) {
          return '- Cartographie « ' + entry.category + ' » : ' + (entry.outOfToleranceCells || 0) + ' cellule(s) hors tolérance';
        });
        mapSummary = mapLines.join('\n');
      }
    }

    var prompt = [
      '=== INSTRUCTIONS POUR L\'IA ===',
      'Tu es un formateur expert en cartographie moteur automobile. Ton rôle est d\'évaluer l\'analyse d\'un apprenant.',
      'Règles strictes : ne jamais inventer de données techniques. Si tu n\'es pas certain d\'une information, indique « incertain ».',
      'Réponds uniquement en français. Sois pédagogique mais précis.',
      '',
      '=== DÉTAILS DU CAS ATELIER ===',
      caseDetails || 'Aucun cas disponible.',
      '',
      '=== RÉSUMÉ DES CARTOGRAPHIES ===',
      mapSummary || 'Aucune cartographie renseignée.',
      '',
      '=== POINTS CLÉS DES LOGS (à titre indicatif) ===',
      '- Point log 1 : à analyser selon le générateur de données',
      '- Point log 2 : à analyser selon le générateur de données',
      '- Point log 3 : à analyser selon le générateur de données',
      '- Point log 4 : à analyser selon le générateur de données',
      '- Point log 5 : à analyser selon le générateur de données',
      '',
      '=== ANALYSE DE L\'APPRENANT ===',
      userAnalysis || '(aucune analyse fournie)',
      '',
      '=== CONSIGNES DE NOTATION ===',
      'Fournis une réponse structurée en respectant ce format (max 300 mots) :',
      '1. Score /100 (justifié en 1 phrase)',
      '2. Points corrects identifiés par l\'apprenant (liste à puces)',
      '3. Corrections nécessaires (liste à puces)',
      '4. Conseil pédagogique final (1 phrase)',
    ].join('\n');

    return prompt;
  }

  // ─── 7. callAI ───────────────────────────────────────────────────────────

  function callAI(prompt) {
    return fetch('/.netlify/functions/claude-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (text) {
            return 'Erreur serveur (' + res.status + ') : ' + text;
          });
        }
        return res.json().then(function (data) {
          if (data && data.content && data.content[0] && data.content[0].text) {
            return data.content[0].text;
          }
          return 'Réponse inattendue du serveur.';
        });
      })
      .catch(function (err) {
        return 'Erreur de connexion : ' + (err.message || String(err));
      });
  }

  // ─── 8. scoreLogAnalysis ─────────────────────────────────────────────────

  function scoreLogAnalysis(userAnnotations, correctFindings) {
    if (!Array.isArray(userAnnotations) || !Array.isArray(correctFindings) || correctFindings.length === 0) {
      return { score: 0, passed: false, feedback: ['Données insuffisantes pour l\'évaluation.'] };
    }

    var userLower = userAnnotations.map(function (a) { return a.toLowerCase(); });

    var matched = 0;
    var matchedKeywords = [];

    for (var f = 0; f < correctFindings.length; f++) {
      var keyword = correctFindings[f].toLowerCase();
      var found = userLower.some(function (annotation) {
        return annotation.indexOf(keyword) !== -1;
      });
      if (found) {
        matched++;
        matchedKeywords.push(correctFindings[f]);
      }
    }

    var score = Math.round((matched / correctFindings.length) * 100);

    var criticalFindings = correctFindings.slice(0, 2);
    var criticalFound = criticalFindings.every(function (cf) {
      var cfLower = cf.toLowerCase();
      return userLower.some(function (annotation) {
        return annotation.indexOf(cfLower) !== -1;
      });
    });

    var passed = score >= 60 && criticalFound;

    var feedback = [];
    if (matched > 0) {
      feedback.push('Éléments correctement identifiés : ' + matchedKeywords.join(', ') + '.');
    }
    var missed = correctFindings.filter(function (cf) {
      return matchedKeywords.indexOf(cf) === -1;
    });
    if (missed.length > 0) {
      feedback.push('Éléments manqués : ' + missed.join(', ') + '.');
    }
    if (!criticalFound) {
      feedback.push('Attention : les anomalies critiques n\'ont pas toutes été identifiées. Révisez les points essentiels du log.');
    }
    if (passed) {
      feedback.push('Analyse satisfaisante. Continuez à affiner votre lecture des données moteur.');
    } else {
      feedback.push('Analyse insuffisante. Relisez attentivement le log en vous concentrant sur les écarts significatifs.');
    }

    return { score: score, passed: passed, feedback: feedback };
  }

  // ─── 9. scoreTuningStrategy ──────────────────────────────────────────────

  function scoreTuningStrategy(userChoices, exerciseId) {
    var exercise = _getExerciseById(exerciseId);
    if (!exercise || !exercise.strategyConfig) {
      return { score: 0, passed: false, feedback: ['Configuration de l\'exercice introuvable.'] };
    }

    var config = exercise.strategyConfig;
    var correctMaps = config.correctMaps || [];
    var wrongMaps = config.wrongMaps || [];
    var keywords = config.reasoningKeywords || [];

    var selectedMaps = userChoices.selectedMaps || [];
    var reasoning = (userChoices.reasoning || '').toLowerCase();

    // Jaccard × 60
    var intersection = selectedMaps.filter(function (m) { return correctMaps.indexOf(m) !== -1; }).length;
    var union = correctMaps.length + selectedMaps.filter(function (m) { return correctMaps.indexOf(m) === -1; }).length;
    var jaccardScore = union > 0 ? (intersection / union) * 60 : 0;

    // Wrong maps NOT selected × 20
    var selectedWrong = selectedMaps.filter(function (m) { return wrongMaps.indexOf(m) !== -1; }).length;
    var wrongScore = wrongMaps.length > 0
      ? ((wrongMaps.length - selectedWrong) / wrongMaps.length) * 20
      : 20;

    // Reasoning keywords × 4 (max 20)
    var keywordMatches = 0;
    for (var k = 0; k < keywords.length; k++) {
      if (reasoning.indexOf(keywords[k].toLowerCase()) !== -1) {
        keywordMatches++;
      }
    }
    var keywordScore = Math.min(keywordMatches * 4, 20);

    var score = _clamp(Math.round(jaccardScore + wrongScore + keywordScore), 0, 100);
    var passed = score >= 60;

    var feedback = [];

    var correctSelected = selectedMaps.filter(function (m) { return correctMaps.indexOf(m) !== -1; });
    var missedCorrect = correctMaps.filter(function (m) { return selectedMaps.indexOf(m) === -1; });
    var wrongSelected = selectedMaps.filter(function (m) { return wrongMaps.indexOf(m) !== -1; });

    if (correctSelected.length > 0) {
      feedback.push('Cartographies correctement sélectionnées : ' + correctSelected.join(', ') + '.');
    }
    if (missedCorrect.length > 0) {
      feedback.push('Cartographies manquées : ' + missedCorrect.join(', ') + '. Ces maps sont importantes dans ce contexte.');
    }
    if (wrongSelected.length > 0) {
      feedback.push('Cartographies non pertinentes sélectionnées : ' + wrongSelected.join(', ') + '. Évitez de modifier des maps sans lien direct avec le problème.');
    }
    if (keywordMatches > 0) {
      feedback.push('Bonne argumentation technique : ' + keywordMatches + ' mot(s)-clé(s) pertinent(s) identifié(s) dans le raisonnement.');
    } else if (keywords.length > 0) {
      feedback.push('Le raisonnement manque de précision technique. Utilisez les termes adaptés à la problématique moteur.');
    }
    if (passed) {
      feedback.push('Stratégie de calibration validée. Score : ' + score + '/100.');
    } else {
      feedback.push('Stratégie insuffisante. Score : ' + score + '/100. Revoyez la sélection des cartographies et affinez votre raisonnement.');
    }

    return { score: score, passed: passed, feedback: feedback };
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    validateMapEdit: validateMapEdit,
    resolveConsequence: resolveConsequence,
    checkProgression: checkProgression,
    saveProgress: saveProgress,
    buildAIPrompt: buildAIPrompt,
    callAI: callAI,
    scoreLogAnalysis: scoreLogAnalysis,
    scoreTuningStrategy: scoreTuningStrategy,
    canUnlockLevel: canUnlockLevel,
  };

})();
