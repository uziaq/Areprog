/* ═══════════════════════════════════════════
   AREPROG — Formation Cartographie ECU
   formation-data.js — Données statiques
   ═══════════════════════════════════════════ */

window.FM_DATA = (function () {

  var MAPS = [
    {
      id: 'diesel_injection_qty',
      engineType: 'diesel',
      category: 'injection',
      label: 'Quantité injection (mg/c)',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000] },
      yAxis: { label: 'Charge moteur', unit: '%', values: [0, 10, 20, 40, 60, 80, 100, 120] },
      referenceValues: [
        [2,  2,  2,  2,  2,  2,  2,  2,  2,  2],
        [5,  5,  6,  6,  6,  7,  7,  7,  7,  6],
        [8,  9,  9, 10, 11, 12, 12, 11, 10,  9],
        [14, 16, 17, 18, 20, 22, 23, 22, 20, 18],
        [22, 25, 27, 29, 32, 35, 37, 35, 32, 28],
        [32, 36, 39, 42, 46, 51, 54, 52, 47, 41],
        [42, 47, 51, 55, 61, 68, 72, 70, 63, 55],
        [48, 54, 58, 62, 69, 77, 82, 80, 72, 62]
      ],
      unit: 'mg/c',
      safeRange: [1, 85],
      warningRange: 8,
      dangerRange: 15
    },
    {
      id: 'diesel_rail_pressure',
      engineType: 'diesel',
      category: 'rail_pressure',
      label: 'Pression rampe common rail (bar)',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [600, 1000, 1500, 2000, 2500, 3000, 3500, 4000] },
      yAxis: { label: 'Charge moteur', unit: '%', values: [0, 20, 40, 60, 80, 100, 120] },
      referenceValues: [
        [250,  280,  300,  320,  340,  350,  360,  360],
        [400,  450,  500,  540,  560,  580,  590,  590],
        [700,  780,  850,  900,  930,  950,  960,  960],
        [900,  980, 1050, 1120, 1180, 1220, 1250, 1250],
        [1100, 1200, 1300, 1400, 1450, 1490, 1510, 1510],
        [1350, 1450, 1560, 1680, 1750, 1800, 1830, 1830],
        [1500, 1600, 1720, 1850, 1920, 1980, 2000, 2000]
      ],
      unit: 'bar',
      safeRange: [200, 2050],
      warningRange: 150,
      dangerRange: 300
    },
    {
      id: 'diesel_egr_rate',
      engineType: 'diesel',
      category: 'egr',
      label: 'Taux EGR (%)',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [800, 1200, 1600, 2000, 2500, 3000, 3500] },
      yAxis: { label: 'Charge moteur', unit: '%', values: [0, 20, 40, 60, 80] },
      referenceValues: [
        [60, 55, 50, 42, 35, 20,  5],
        [50, 45, 40, 32, 25, 12,  0],
        [30, 25, 20, 14,  8,  0,  0],
        [10,  8,  5,  2,  0,  0,  0],
        [ 0,  0,  0,  0,  0,  0,  0]
      ],
      unit: '%',
      safeRange: [0, 65],
      warningRange: 10,
      dangerRange: 20
    },
    {
      id: 'gasoline_ignition_advance',
      engineType: 'gasoline',
      category: 'ignition',
      label: 'Avance allumage (°av PMH)',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 6500] },
      yAxis: { label: 'Pression collecteur', unit: 'bar', values: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3] },
      referenceValues: [
        [16, 17, 18, 20, 22, 24, 25, 26, 26, 27, 27, 26],
        [14, 15, 17, 18, 20, 22, 23, 24, 25, 26, 26, 25],
        [11, 13, 14, 16, 18, 20, 21, 22, 23, 24, 24, 23],
        [ 8, 10, 12, 13, 16, 18, 19, 20, 21, 22, 22, 21],
        [ 5,  7,  9, 11, 14, 16, 17, 18, 19, 20, 20, 19],
        [ 2,  4,  6,  8, 11, 13, 15, 16, 17, 18, 18, 17],
        [ 0,  2,  4,  6,  9, 11, 13, 14, 15, 16, 16, 15],
        [-2,  0,  2,  4,  7,  9, 11, 12, 13, 14, 14, 13],
        [-4, -2,  0,  2,  5,  7,  9, 10, 11, 12, 12, 11],
        [-6, -4, -2,  0,  3,  5,  7,  8,  9, 10, 10,  9]
      ],
      unit: '°av PMH',
      safeRange: [-10, 32],
      warningRange: 3,
      dangerRange: 6
    },
    {
      id: 'gasoline_boost_target',
      engineType: 'gasoline',
      category: 'boost',
      label: 'Cible pression turbo (bar abs)',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000] },
      yAxis: { label: 'Enfoncement pédale', unit: '%', values: [20, 40, 60, 80, 100] },
      referenceValues: [
        [1.05, 1.10, 1.15, 1.18, 1.20, 1.20, 1.18, 1.15, 1.12, 1.08],
        [1.10, 1.20, 1.30, 1.35, 1.38, 1.38, 1.35, 1.32, 1.28, 1.20],
        [1.20, 1.35, 1.50, 1.60, 1.65, 1.65, 1.62, 1.58, 1.52, 1.42],
        [1.30, 1.50, 1.70, 1.82, 1.88, 1.88, 1.85, 1.80, 1.72, 1.60],
        [1.40, 1.62, 1.88, 2.02, 2.10, 2.10, 2.06, 2.00, 1.90, 1.75]
      ],
      unit: 'bar abs',
      safeRange: [0.95, 2.20],
      warningRange: 0.10,
      dangerRange: 0.20
    },
    {
      id: 'gasoline_lambda_target',
      engineType: 'gasoline',
      category: 'lambda',
      label: 'Cible lambda',
      xAxis: { label: 'Régime moteur', unit: 'tr/min', values: [800, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6000] },
      yAxis: { label: 'Enfoncement pédale', unit: '%', values: [10, 30, 50, 70, 90, 100] },
      referenceValues: [
        [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
        [1.00, 1.00, 1.00, 1.00, 0.99, 0.98, 0.97, 0.97, 0.97],
        [1.00, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.94],
        [0.98, 0.97, 0.96, 0.95, 0.93, 0.92, 0.90, 0.89, 0.89],
        [0.95, 0.94, 0.93, 0.91, 0.90, 0.89, 0.87, 0.86, 0.86],
        [0.92, 0.91, 0.90, 0.88, 0.87, 0.86, 0.85, 0.85, 0.85]
      ],
      unit: '\u03bb',
      safeRange: [0.80, 1.05],
      warningRange: 0.03,
      dangerRange: 0.06
    }
  ];

  var EXERCISES = [
    {
      id: 'ex01_discovery_diesel_basic',
      type: 'map-discovery',
      level: 1,
      engineType: 'diesel',
      difficulty: 1,
      mandatory: true,
      title: 'Identifier la cartographie injection',
      description: 'Parmi les blocs de données ECU proposés, identifiez la cartographie de quantité d\'injection diesel.',
      targetMapId: 'diesel_injection_qty',
      validationRules: { warningTolerance: 8, criticalCells: [] },
      hints: [
        'Les axes d\'une carte injection sont toujours Régime × Charge.',
        'Les valeurs en mg/c augmentent avec la charge — elles sont faibles à vide.',
        'Les faux positifs peuvent être des tables de correction température ou des courbes débit.'
      ],
      discoveryConfig: {
        correctCategory: 'injection',
        correctUnit: 'mg/c',
        falsePositives: 2,
        description: 'Identifiez la cartographie injection parmi 3 blocs ECU'
      }
    },
    {
      id: 'ex02_discovery_diesel_axes',
      type: 'map-discovery',
      level: 1,
      engineType: 'diesel',
      difficulty: 1,
      mandatory: true,
      title: 'Lire les axes d\'une cartographie',
      description: 'Sur la cartographie de pression rampe, identifiez l\'axe X, l\'axe Y et les unités correctes.',
      targetMapId: 'diesel_rail_pressure',
      validationRules: { warningTolerance: 150, criticalCells: [] },
      hints: [
        'L\'axe X est toujours le régime moteur en tr/min.',
        'L\'axe Y est la charge moteur (%) ou la demande de couple.',
        'La pression rampe s\'exprime en bar sur les systèmes common rail.'
      ],
      discoveryConfig: {
        correctCategory: 'rail_pressure',
        correctUnit: 'bar',
        falsePositives: 2,
        description: 'Identifiez les axes et unités de la cartographie pression rampe'
      }
    },
    {
      id: 'ex03_fix_diesel_injection_easy',
      type: 'map-fix',
      level: 1,
      engineType: 'diesel',
      difficulty: 1,
      mandatory: true,
      title: 'Correction injection — Niveau 1',
      description: 'Corrigez les valeurs erronées sur la cartographie injection diesel. 3 cellules sont incorrectes.',
      targetMapId: 'diesel_injection_qty',
      validationRules: {
        warningTolerance: 8,
        criticalCells: [[6, 5], [7, 6], [7, 7]]
      },
      hints: [
        'Les cellules en rouge dépassent la plage de danger.',
        'Comparez les valeurs avec les cellules voisines — la progression doit être régulière.',
        'Les zones pleine charge (lignes 6-7) sont critiques pour la sécurité moteur.'
      ]
    },
    {
      id: 'ex04_fix_diesel_injection_med',
      type: 'map-fix',
      level: 1,
      engineType: 'diesel',
      difficulty: 2,
      mandatory: true,
      title: 'Correction injection — Niveau 2',
      description: 'Corrigez les anomalies sur la cartographie injection. 6 cellules présentent des erreurs plus subtiles.',
      targetMapId: 'diesel_injection_qty',
      validationRules: {
        warningTolerance: 6,
        criticalCells: [[5, 4], [5, 5], [6, 5], [6, 6], [7, 5], [7, 6]]
      },
      hints: [
        'Observez la cohérence de la progression diagonale (bas régime/faible charge → haut régime/forte charge).',
        'Une erreur en zone orange peut paraître acceptable mais crée une rupture de progressivité.',
        'Vérifiez que les transitions entre cellules ne dépassent pas 15% d\'écart.'
      ]
    },
    {
      id: 'ex05_discovery_gasoline_ignition',
      type: 'map-discovery',
      level: 2,
      engineType: 'gasoline',
      difficulty: 1,
      mandatory: true,
      title: 'Identifier la carte avance allumage',
      description: 'Identifiez la cartographie d\'avance allumage parmi les blocs ECU proposés.',
      targetMapId: 'gasoline_ignition_advance',
      validationRules: { warningTolerance: 3, criticalCells: [] },
      hints: [
        'Les valeurs d\'avance diminuent quand la pression collecteur augmente (charge élevée).',
        'Les valeurs sont en degrés avant PMH (\u00b0av PMH) — elles peuvent être négatives en pleine charge.',
        'L\'axe Y est la pression collecteur (bar) et non la charge en % sur les moteurs essence suralimentés.'
      ],
      discoveryConfig: {
        correctCategory: 'ignition',
        correctUnit: '\u00b0av PMH',
        falsePositives: 2,
        description: 'Identifiez la cartographie avance allumage parmi 3 blocs'
      }
    },
    {
      id: 'ex06_fix_gasoline_ignition_easy',
      type: 'map-fix',
      level: 2,
      engineType: 'gasoline',
      difficulty: 1,
      mandatory: true,
      title: 'Correction avance allumage — Niveau 1',
      description: 'Corrigez les valeurs d\'avance erronées. Attention aux zones à risque cliquetis.',
      targetMapId: 'gasoline_ignition_advance',
      validationRules: {
        warningTolerance: 3,
        criticalCells: [[8, 9], [8, 10], [9, 9], [9, 10]]
      },
      hints: [
        'En pleine charge (pression > 0.9 bar), tout dépassement de 28\u00b0 est dangereux.',
        'Les zones rouge indiquent un risque de cliquetis ou pré-allumage.',
        'Réduisez l\'avance en pleine charge — mieux vaut perdre un peu de puissance que cramer un piston.'
      ]
    },
    {
      id: 'ex07_fix_gasoline_ignition_med',
      type: 'map-fix',
      level: 2,
      engineType: 'gasoline',
      difficulty: 2,
      mandatory: true,
      title: 'Correction avance allumage — Niveau 2',
      description: 'Optimisation avance allumage : trouvez l\'équilibre entre performance et sécurité.',
      targetMapId: 'gasoline_ignition_advance',
      validationRules: {
        warningTolerance: 2,
        criticalCells: [[6, 8], [6, 9], [7, 8], [7, 9], [8, 8], [8, 9]]
      },
      hints: [
        'Un moteur sain peut accepter quelques degrés de plus en charge partielle.',
        'La transition entre zone orange et rouge est graduelle — regardez le ConsequencePanel.',
        'En pratique, visez 2\u00b0 en dessous du seuil de cliquetis mesuré sur banc.'
      ]
    },
    {
      id: 'ex08_discovery_gasoline_boost',
      type: 'map-discovery',
      level: 2,
      engineType: 'gasoline',
      difficulty: 2,
      mandatory: false,
      title: 'Identifier la carte boost (bonus)',
      description: 'Identifiez la cartographie de cible pression turbo et ses caractéristiques.',
      targetMapId: 'gasoline_boost_target',
      validationRules: { warningTolerance: 0.10, criticalCells: [] },
      hints: [
        'Les valeurs boost sont en bar absolu — l\'atmosphère vaut 1.0 bar.',
        'Le pic de boost est généralement entre 2500 et 4000 tr/min.',
        'Au-delà de 6000 tr/min, le boost redescend pour protéger le turbo.'
      ],
      discoveryConfig: {
        correctCategory: 'boost',
        correctUnit: 'bar abs',
        falsePositives: 2,
        description: 'Identifiez la cartographie boost parmi 3 blocs'
      }
    },
    {
      id: 'ex09_log_analyze_diesel_smoke',
      type: 'log-analyze',
      level: 3,
      engineType: 'diesel',
      difficulty: 1,
      mandatory: true,
      title: 'Analyse log — Fumée noire diesel',
      description: 'Analysez ce log moteur diesel et identifiez la cause des anomalies observées.',
      targetMapId: 'diesel_injection_qty',
      validationRules: { warningTolerance: 8, criticalCells: [] },
      hints: [
        'Observez la corrélation entre l\'EGT et la quantité d\'injection aux hauts régimes.',
        'Une chute de pression rampe accompagnée d\'une hausse EGT indique une surinjection.',
        'Le code P0087 confirme une pression insuffisante — vérifiez rail_pressure vs injection_qty.'
      ],
      logConfig: {
        symptoms: ['EGT > 700\u00b0C en charge', 'fumée noire visible', 'légère perte puissance'],
        correctFindings: ['surinjection', 'EGT élevé', 'pression rampe insuffisante', 'P0087'],
        faultCodes: ['P0087']
      }
    },
    {
      id: 'ex10_log_analyze_diesel_rail',
      type: 'log-analyze',
      level: 3,
      engineType: 'diesel',
      difficulty: 2,
      mandatory: true,
      title: 'Analyse log — Pression rampe instable',
      description: 'Ce log montre des oscillations de pression rampe. Identifiez la cause et la cartographie impliquée.',
      targetMapId: 'diesel_rail_pressure',
      validationRules: { warningTolerance: 150, criticalCells: [] },
      hints: [
        'Les oscillations de pression rampe apparaissent quand la demande d\'injection dépasse la capacité de la pompe.',
        'Vérifiez la cohérence entre les valeurs injection_qty et le niveau de pression rail.',
        'Un rail qui chute brutalement à mi-régime indique souvent une injection excessive dans ce régime.'
      ],
      logConfig: {
        symptoms: ['oscillations pression rampe 800-1200 bar', 'régularité irrégulière', 'P0088 intermittent'],
        correctFindings: ['oscillation rail', 'surinjection mi-régime', 'pression excessive', 'P0088'],
        faultCodes: ['P0088']
      }
    },
    {
      id: 'ex11_fix_diesel_egr',
      type: 'map-fix',
      level: 3,
      engineType: 'diesel',
      difficulty: 2,
      mandatory: false,
      title: 'Correction taux EGR (bonus)',
      description: 'Ajustez la cartographie EGR pour réduire les instabilités à bas régime sans générer de DTC.',
      targetMapId: 'diesel_egr_rate',
      validationRules: {
        warningTolerance: 10,
        criticalCells: [[0, 0], [0, 1], [1, 0], [1, 1]]
      },
      hints: [
        'Un taux EGR trop élevé à bas régime provoque des instabilités de ralenti.',
        'Réduire légèrement les valeurs à 0-20% de charge améliore la stabilité sans toucher aux émissions NOx.',
        'Évitez de mettre 0% d\'EGR partout — le contrôle technique vérifie les émissions !'
      ]
    },
    {
      id: 'ex12_log_analyze_gasoline_knock',
      type: 'log-analyze',
      level: 4,
      engineType: 'gasoline',
      difficulty: 2,
      mandatory: true,
      title: 'Analyse log — Cliquetis essence',
      description: 'Ce log TSI montre des événements de cliquetis. Identifiez la zone critique et la correction ECU.',
      targetMapId: 'gasoline_ignition_advance',
      validationRules: { warningTolerance: 3, criticalCells: [] },
      hints: [
        'Les événements knock (valeur 1) déclenchent un retard d\'allumage ECU automatique.',
        'Localisez les RPM et charge où les knocks se produisent — c\'est la zone à corriger.',
        'La correction de retard cumulée (timing_retard) indique l\'ampleur du problème.'
      ],
      logConfig: {
        symptoms: ['cliquetis > 3000 tr/min pleine charge', 'retard allumage ECU détecté', 'P0300'],
        correctFindings: ['cliquetis', 'avance excessive', 'retard ECU', 'P0300', 'zone pleine charge'],
        faultCodes: ['P0300']
      }
    },
    {
      id: 'ex13_map_to_log_gasoline_timing',
      type: 'map-to-log',
      level: 4,
      engineType: 'gasoline',
      difficulty: 2,
      mandatory: true,
      title: 'Simulation map→log — Avance allumage',
      description: 'Modifiez la cartographie d\'avance, observez le log simulé, puis analysez si votre réglage est optimal.',
      targetMapId: 'gasoline_ignition_advance',
      validationRules: {
        warningTolerance: 3,
        criticalCells: [[7, 8], [7, 9], [8, 8], [8, 9], [9, 8], [9, 9]]
      },
      hints: [
        'Augmentez l\'avance progressivement et observez le knock counter dans le log.',
        'L\'objectif est le maximum de puissance SANS knock — regardez la courbe timing simulée.',
        'Si le log montre P0300, vous êtes allé trop loin.'
      ]
    },
    {
      id: 'ex14_map_to_log_gasoline_boost',
      type: 'map-to-log',
      level: 4,
      engineType: 'gasoline',
      difficulty: 3,
      mandatory: true,
      title: 'Simulation map→log — Pression turbo',
      description: 'Augmentez la cible boost et vérifiez que le log simulé reste dans les limites de sécurité.',
      targetMapId: 'gasoline_boost_target',
      validationRules: {
        warningTolerance: 0.10,
        criticalCells: [[3, 4], [3, 5], [4, 4], [4, 5]]
      },
      hints: [
        'Le turbo d\'origine supporte généralement +0.15 bar max au-dessus de la cible stock.',
        'Observez l\'EGT simulé — au-delà de 850\u00b0C avec boost élevé, le turbo est en danger.',
        'P0234 (surpression) s\'active si vous dépassez la limite de 3 points consécutifs.'
      ]
    },
    {
      id: 'ex15_workshop_diesel_derate',
      type: 'workshop',
      level: 5,
      engineType: 'diesel',
      difficulty: 2,
      mandatory: true,
      title: 'Cas atelier — Golf TDI perte de puissance',
      description: 'Client : Golf 7 TDI 150 ch, se met en mode dégradé en charge. Analysez et proposez une solution.',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [
        'Le mode dégradé diesel est souvent lié à la pression rampe ou au turbo.',
        'P0087 + EGT élevé indique une surinjection combinée à un rail sous-pression.',
        'Votre analyse doit identifier QUELLE cartographie corriger et COMMENT.'
      ],
      workshopCaseId: 'wc01_golf_tdi_derate'
    },
    {
      id: 'ex16_strategy_stage1_diesel',
      type: 'tuning-strategy',
      level: 5,
      engineType: 'diesel',
      difficulty: 2,
      mandatory: true,
      title: 'Stratégie Stage 1 diesel',
      description: 'Client veut +20% de puissance sur son TDI. Quelles cartographies modifier et dans quel ordre ?',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [
        'Sur un diesel, la puissance vient principalement de l\'injection et du boost.',
        'Toujours augmenter la pression rampe AVANT l\'injection pour ne pas manquer de carburant.',
        'Ne pas oublier les limites thermiques — EGT max 750\u00b0C sur turbos d\'origine.'
      ],
      strategyConfig: {
        objective: 'Gain de puissance +20% sur TDI 150ch, turbo d\'origine',
        constraints: ['Turbo stock', 'pas de modif hardware', 'usage quotidien'],
        correctMaps: ['diesel_injection_qty', 'diesel_rail_pressure'],
        wrongMaps: ['diesel_egr_rate'],
        correctReasoning: 'augmenter injection et pression rampe en cohérence, respecter limites EGT et turbo'
      }
    },
    {
      id: 'ex17_strategy_stage1_gasoline',
      type: 'tuning-strategy',
      level: 5,
      engineType: 'gasoline',
      difficulty: 2,
      mandatory: true,
      title: 'Stratégie Stage 1 essence TSI',
      description: 'Client 1.8 TSI, veut +15% couple à mi-régime. Quelles cartographies et pourquoi ?',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [
        'Le couple à mi-régime dépend principalement du boost et de l\'avance allumage.',
        'Augmenter le boost avant l\'avance — plus de charge → risque cliquetis si avance trop agressive.',
        'Lambda doit rester ≤ 0.88 en pleine charge pour protéger le moteur.'
      ],
      strategyConfig: {
        objective: 'Gain couple +15% mi-régime sur 1.8 TSI, intercooler stock',
        constraints: ['Turbo stock', 'carburant SP98 garanti', 'usage autoroute principal'],
        correctMaps: ['gasoline_boost_target', 'gasoline_ignition_advance'],
        wrongMaps: ['gasoline_lambda_target'],
        correctReasoning: 'boost et avance optimisés, lambda légèrement enrichi en full load pour sécurité'
      }
    },
    {
      id: 'ex18_workshop_gasoline_knock',
      type: 'workshop',
      level: 6,
      engineType: 'gasoline',
      difficulty: 3,
      mandatory: true,
      title: 'Cas atelier — Audi A3 TSI cliquetis',
      description: 'Client : Audi A3 1.8 TSI, cliquetis audibles > 3000 tr/min pleine charge. P0300 présent.',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [
        'Avant de réduire l\'avance, vérifiez si le client utilise bien du SP98.',
        'P0300 avec retard ECU observé = l\'avance actuelle dépasse le seuil de cliquetis.',
        'Comparez la carte actuelle avec le stock — quelqu\'un a peut-être déjà retouché l\'avance.'
      ],
      workshopCaseId: 'wc02_audi_a3_knock'
    },
    {
      id: 'ex19_strategy_full_delete',
      type: 'tuning-strategy',
      level: 6,
      engineType: 'mixed',
      difficulty: 3,
      mandatory: true,
      title: 'Stratégie préparation usage piste',
      description: 'Client prépare son véhicule pour un usage piste exclusif. Quelles modifications stratégiques ?',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [
        'Usage piste = thermique plus sévère, donc marges de sécurité à revoir.',
        'EGR et FAP peuvent poser problème en usage intensif.',
        'L\'objectif est performance ET fiabilité sur la durée, pas juste le tour le plus rapide.'
      ],
      strategyConfig: {
        objective: 'Préparation piste, fiabilité prioritaire, pas de contrainte émissions',
        constraints: ['Carburant piste disponible', 'budget hardware limité', 'refroidissement stock'],
        correctMaps: ['diesel_injection_qty', 'diesel_rail_pressure', 'diesel_egr_rate'],
        wrongMaps: [],
        correctReasoning: 'optimisation thermique, suppression EGR pour usage intensif, marges sécurité accrues'
      }
    },
    {
      id: 'ex20_raw_block_edc17',
      type: 'raw-block',
      level: 7,
      engineType: 'diesel',
      difficulty: 3,
      mandatory: true,
      title: 'Bloc ECU brut — EDC17C64',
      description: 'Dump ECU complet. Identifiez les cartographies, leurs adresses et distinguez les vraies maps des zones checksum.',
      targetMapId: 'diesel_injection_qty',
      validationRules: { warningTolerance: 8, criticalCells: [] },
      hints: [],
      discoveryConfig: {
        correctCategory: 'injection',
        correctUnit: 'mg/c',
        falsePositives: 4,
        description: 'Dump ECU brut — identifiez les cartographies sans aide'
      }
    },
    {
      id: 'ex21_workshop_advanced_staged',
      type: 'workshop',
      level: 7,
      engineType: 'diesel',
      difficulty: 3,
      mandatory: true,
      title: 'Cas atelier avancé — Préparation Stage 2',
      description: 'Client : 320d avec kit turbo +40%. Analysez les limites hardware et proposez une stratégie complète.',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [],
      workshopCaseId: 'wc03_bmw_320d_stage2'
    },
    {
      id: 'ex22_map_to_log_mixed',
      type: 'map-to-log',
      level: 7,
      engineType: 'mixed',
      difficulty: 3,
      mandatory: true,
      title: 'Simulation complète — Multi-cartographies',
      description: 'Modifiez simultanément injection et rail pressure, analysez les interactions dans le log simulé.',
      targetMapId: 'diesel_injection_qty',
      validationRules: {
        warningTolerance: 8,
        criticalCells: [[6, 5], [6, 6], [7, 5], [7, 6], [7, 7]]
      },
      hints: []
    },
    {
      id: 'ex23_strategy_e85_conversion',
      type: 'tuning-strategy',
      level: 7,
      engineType: 'gasoline',
      difficulty: 3,
      mandatory: true,
      title: 'Stratégie conversion E85',
      description: 'Client veut passer son TSI à l\'E85. Listez les adaptations ECU nécessaires et les risques.',
      targetMapId: null,
      validationRules: { warningTolerance: 0, criticalCells: [] },
      hints: [],
      strategyConfig: {
        objective: 'Conversion E85 flex sur 1.8 TSI, homologation visée',
        constraints: ['Injecteurs stock à vérifier', 'pompe à carburant stock', 'catalyseur conservé'],
        correctMaps: ['gasoline_ignition_advance', 'gasoline_lambda_target', 'gasoline_boost_target'],
        wrongMaps: [],
        correctReasoning: 'enrichissement injection, avance adaptée E85, boost légèrement augmenté pour compenser densité énergétique'
      }
    }
  ];

  var LEVELS = [
    {
      id: 1,
      label: 'Niveau 1',
      subtitle: 'Identification des cartographies',
      engineType: 'diesel',
      mandatoryExerciseIds: ['ex01_discovery_diesel_basic', 'ex02_discovery_diesel_axes', 'ex03_fix_diesel_injection_easy', 'ex04_fix_diesel_injection_med'],
      unlockCondition: 'Niveau 1 toujours disponible',
      theoryHtml: '<h3>Qu\'est-ce qu\'une cartographie ECU ?</h3><p>Une cartographie ECU (ou "map") est une table bidimensionnelle de valeurs que le calculateur moteur utilise pour piloter un actionneur : injecteurs, turbocompresseur, bobines d\'allumage, vanne EGR...</p><p>Chaque cellule de la table correspond à un point de fonctionnement moteur défini par deux axes : généralement le <strong>régime moteur (tr/min)</strong> et la <strong>charge moteur (%)</strong>. Le calculateur interpole entre les cellules en temps réel.</p><p>Sur un diesel common rail comme l\'EA288, les cartographies clés sont : quantité d\'injection (mg/c), pression rampe (bar), début d\'injection (°v PMH) et taux EGR (%).</p>'
    },
    {
      id: 2,
      label: 'Niveau 2',
      subtitle: 'Zones de sécurité et avance allumage',
      engineType: 'gasoline',
      mandatoryExerciseIds: ['ex05_discovery_gasoline_ignition', 'ex06_fix_gasoline_ignition_easy', 'ex07_fix_gasoline_ignition_med'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 1 avec score ≥ 60',
      theoryHtml: '<h3>Les zones de sécurité sur une cartographie</h3><p>Chaque cartographie possède trois zones de validité : <strong>verte</strong> (valeurs dans les tolérances de référence), <strong>orange</strong> (écart notable mais moteur fonctionnel), <strong>rouge</strong> (zone de danger — risque de casse ou défaut).</p><p>Sur une carte d\'avance allumage essence, le danger principal est le <strong>cliquetis</strong> (auto-allumage incontrôlé). À partir de ~22° en pleine charge haute pression, le risque augmente fortement avec la température du carburant et la qualité de l\'essence.</p><p>La règle d\'or : <em>jamais plus de 28° av PMH à plus de 0.9 bar de pression collecteur</em> avec du SP98 standard sur moteur stock.</p>'
    },
    {
      id: 3,
      label: 'Niveau 3',
      subtitle: 'Corrélation logs / injection diesel',
      engineType: 'diesel',
      mandatoryExerciseIds: ['ex09_log_analyze_diesel_smoke', 'ex10_log_analyze_diesel_rail'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 2 avec score ≥ 60',
      theoryHtml: '<h3>Lire un log moteur diesel</h3><p>Un log moteur enregistre les paramètres en temps réel via l\'OBD2 ou l\'interface constructeur : RPM, charge, boost, température EGT, pression rampe, débit EGR, codes défauts actifs...</p><p>La méthode de lecture : <strong>identifier l\'anomalie temporelle</strong> (à quel régime/charge), puis remonter à la cartographie responsable. Une EGT trop haute à plein régime pointe vers la carte injection ; une oscillation de boost vers la carte wastegate.</p><p><strong>P0087</strong> (pression rampe basse) indique souvent que la quantité d\'injection demandée dépasse la capacité de la pompe à haute pression — corrélation directe injection_qty ↔ rail_pressure.</p>'
    },
    {
      id: 4,
      label: 'Niveau 4',
      subtitle: 'Simulation map→log',
      engineType: 'gasoline',
      mandatoryExerciseIds: ['ex12_log_analyze_gasoline_knock', 'ex13_map_to_log_gasoline_timing', 'ex14_map_to_log_gasoline_boost'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 3 avec score ≥ 60',
      theoryHtml: '<h3>Prédire le comportement moteur depuis la cartographie</h3><p>Un reprogrammeur expérimenté peut <em>visualiser</em> le comportement moteur en lisant une cartographie, avant même de démarrer le véhicule. C\'est cette compétence que vous allez acquérir.</p><p>Relation clé sur essence turbo : <code>Boost ↑ → Densité charge ↑ → Risque cliquetis ↑ → Avance doit ↓</code>. Si vous augmentez le boost sans réduire l\'avance, le moteur entre en cliquetis. L\'ECU le détecte et applique un retard automatique (souvent 2° par événement).</p><p>Sur le log simulé, observez le <strong>knock counter</strong> et le <strong>timing correction</strong> — ce sont les indicateurs les plus fiables de la limite de sécurité.</p>'
    },
    {
      id: 5,
      label: 'Niveau 5',
      subtitle: 'Cas atelier et stratégie client',
      engineType: 'mixed',
      mandatoryExerciseIds: ['ex15_workshop_diesel_derate', 'ex16_strategy_stage1_diesel', 'ex17_strategy_stage1_gasoline'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 4 avec score ≥ 60',
      theoryHtml: '<h3>Du diagnostic au devis : le flux client</h3><p>En conditions réelles, le client décrit des symptômes, pas des codes erreur. Votre rôle est de convertir ces symptômes en diagnostic cartographique précis : <em>quelle(s) map(s) sont en cause, dans quelle zone, avec quel effet moteur.</em></p><p>Workflow professionnel : 1) Lecture défauts OBD + freeze frame → 2) Analyse log sous charge → 3) Identification des maps impliquées → 4) Proposition de correction avec justification technique → 5) Validation post-flash sur log.</p><p>La réponse "IA" dans cet atelier est un formateur automatique — elle évalue la qualité de votre raisonnement, pas votre style rédactionnel.</p>'
    },
    {
      id: 6,
      label: 'Niveau 6',
      subtitle: 'Reprogrammation avancée multi-cartographies',
      engineType: 'mixed',
      mandatoryExerciseIds: ['ex18_workshop_gasoline_knock', 'ex19_strategy_full_delete'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 5 avec score ≥ 60',
      theoryHtml: '<h3>Interactions entre cartographies</h3><p>Les cartographies ne fonctionnent pas de façon isolée. Sur un moteur diesel, augmenter l\'injection SANS augmenter la pression rampe provoque une atomisation dégradée → mauvaise combustion → surconsommation + EGT. Il faut toujours ajuster les maps en cohérence.</p><p>Sur essence, le triplet <strong>boost / avance / lambda</strong> doit être revu ensemble lors d\'une préparation : plus de boost nécessite moins d\'avance et un enrichissement lambda (0.85-0.88) pour gérer la thermique. Toucher à un seul paramètre sans les autres crée des déséquilibres.</p><p>En niveau 6, vous gérez ces interactions — pas de filets de sécurité, pas de couleurs heatmap en mode expert.</p>'
    },
    {
      id: 7,
      label: 'Niveau 7',
      subtitle: 'Mode Expert — ECU brut',
      engineType: 'mixed',
      mandatoryExerciseIds: ['ex20_raw_block_edc17', 'ex21_workshop_advanced_staged', 'ex22_map_to_log_mixed', 'ex23_strategy_e85_conversion'],
      unlockCondition: 'Compléter tous les exercices obligatoires du Niveau 6 avec score ≥ 60',
      theoryHtml: '<h3>Travailler en mode brut — l\'approche WinOLS</h3><p>En dehors des outils de calibration simplifiés, le reprogrammeur professionnel travaille directement sur le fichier binaire ECU. WinOLS et outils similaires présentent les données en hexadécimal ou en tables brutes, sans étiquette ni unité.</p><p>Identifier une cartographie dans un dump ECU requiert : 1) Reconnaître les axes (progression régulière, valeurs répétées) → 2) Estimer l\'unité par la plage de valeurs → 3) Comparer avec des données de référence connues → 4) Vérifier la cohérence avec les maps voisines en mémoire.</p><p><strong>Pièges classiques</strong> : tables de correction, look-up tables de capteurs, zones checksum avec des valeurs qui ressemblent à des maps mais ne le sont pas.</p>'
    }
  ];

  var CONSEQUENCE_TABLE = [
    {
      category: 'injection', direction: 'too_high', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Légère opacité fumée noire en accélération',   deltaThreshold: 5  },
        { severity: 'warning',  desc: 'Hausse EGT notable (+50°C)',                    deltaThreshold: 8  },
        { severity: 'danger',   desc: 'Fumée noire dense — opacimétrie hors norme',    deltaThreshold: 12 },
        { severity: 'danger',   desc: 'EGT > 750°C — risque de casse turbo',          deltaThreshold: 15 },
        { severity: 'critical', desc: 'Cokéfaction injecteurs — colmatage probable',   deltaThreshold: 20 },
        { severity: 'critical', desc: 'Risque pistons / chemises par sur-enrichissement', deltaThreshold: 25 }
      ]
    },
    {
      category: 'injection', direction: 'too_low', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Légère perte de couple ressenti',               deltaThreshold: 4  },
        { severity: 'warning',  desc: 'Fumée blanche au démarrage froid',              deltaThreshold: 6  },
        { severity: 'danger',   desc: 'Perte puissance significative — mode dégradé possible', deltaThreshold: 10 },
        { severity: 'danger',   desc: 'Risque calage à charge élevée',                 deltaThreshold: 14 },
        { severity: 'critical', desc: 'Démarrages difficiles — injection insuffisante pour allumage', deltaThreshold: 18 }
      ]
    },
    {
      category: 'rail_pressure', direction: 'too_high', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Contraintes accrues sur injecteurs et rampe',   deltaThreshold: 100 },
        { severity: 'danger',   desc: 'Risque usure prématurée injecteurs',            deltaThreshold: 200 },
        { severity: 'danger',   desc: 'P0088 actif — limiteur pression ECU déclenché', deltaThreshold: 250 },
        { severity: 'critical', desc: 'Risque fissure rampe — pression > 2050 bar',    deltaThreshold: 300 }
      ]
    },
    {
      category: 'rail_pressure', direction: 'too_low', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Atomisation dégradée — légère fumée noire',     deltaThreshold: 80  },
        { severity: 'danger',   desc: 'P0087 actif — pression insuffisante',           deltaThreshold: 150 },
        { severity: 'danger',   desc: 'Injection incomplète — perte puissance',        deltaThreshold: 200 },
        { severity: 'critical', desc: 'Calage possible en charge — débit insuffisant', deltaThreshold: 300 }
      ]
    },
    {
      category: 'egr', direction: 'too_high', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Légère instabilité ralenti en charge partielle', deltaThreshold: 8  },
        { severity: 'warning',  desc: 'Légère surconsommation — mélange appauvri en O2', deltaThreshold: 12 },
        { severity: 'danger',   desc: 'Régime irrégulier — gaz résiduels excessifs',    deltaThreshold: 18 },
        { severity: 'danger',   desc: 'P0402 — débit EGR excessif détecté',            deltaThreshold: 22 }
      ]
    },
    {
      category: 'egr', direction: 'too_low', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Hausse émissions NOx — seuil Euro 6 risqué',    deltaThreshold: 8  },
        { severity: 'danger',   desc: 'P0401 — débit EGR insuffisant détecté',         deltaThreshold: 15 },
        { severity: 'danger',   desc: 'Contrôle technique : émissions NOx hors norme', deltaThreshold: 20 }
      ]
    },
    {
      category: 'ignition', direction: 'too_high', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Risque de cliquetis aux hauts régimes',         deltaThreshold: 2  },
        { severity: 'warning',  desc: 'ECU peut appliquer un retard préventif',        deltaThreshold: 3  },
        { severity: 'danger',   desc: 'Cliquetis sévère — retard ECU forcé (-2° par event)', deltaThreshold: 5 },
        { severity: 'danger',   desc: 'P0300 possible — ratés d\'allumage par cliquetis', deltaThreshold: 6 },
        { severity: 'critical', desc: 'Pré-allumage — risque de perforation piston',   deltaThreshold: 9  },
        { severity: 'critical', desc: 'Destruction moteur imminente si non corrigé',   deltaThreshold: 12 }
      ]
    },
    {
      category: 'ignition', direction: 'too_low', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Perte de puissance en charge partielle',        deltaThreshold: 2  },
        { severity: 'warning',  desc: 'Consommation accrue — combustion trop tardive', deltaThreshold: 3  },
        { severity: 'danger',   desc: 'Chaleur excessive en tubulure échappement',     deltaThreshold: 5  },
        { severity: 'danger',   desc: 'Perte de couple significative — avance trop retardée', deltaThreshold: 7 }
      ]
    },
    {
      category: 'boost', direction: 'too_high', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Charge accrue sur turbo — surveillance EGT',   deltaThreshold: 0.08 },
        { severity: 'danger',   desc: 'P0234 — surpression turbo détectée',           deltaThreshold: 0.15 },
        { severity: 'danger',   desc: 'Risque surrégime turbine — pales turbo',       deltaThreshold: 0.20 },
        { severity: 'critical', desc: 'Casse turbo probable si maintenu',              deltaThreshold: 0.30 }
      ]
    },
    {
      category: 'boost', direction: 'too_low', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Manque de couple mi-régime — ressenti client', deltaThreshold: 0.08 },
        { severity: 'danger',   desc: 'P0299 — sous-alimentation turbo',              deltaThreshold: 0.15 },
        { severity: 'danger',   desc: 'Puissance < stock — objectif Stage 1 non atteint', deltaThreshold: 0.20 }
      ]
    },
    {
      category: 'boost', direction: 'too_high', engineType: 'diesel',
      consequences: [
        { severity: 'warning',  desc: 'Contrainte turbo accrue — EGT en hausse',      deltaThreshold: 0.10 },
        { severity: 'danger',   desc: 'P0234 — surpression détectée',                 deltaThreshold: 0.18 },
        { severity: 'critical', desc: 'Risque casse turbo — intervention immédiate',  deltaThreshold: 0.28 }
      ]
    },
    {
      category: 'lambda', direction: 'too_low', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Consommation accrue — mélange trop riche',     deltaThreshold: 0.02 },
        { severity: 'danger',   desc: 'Catalyseur dégradé par sur-enrichissement',    deltaThreshold: 0.04 },
        { severity: 'danger',   desc: 'P0172 — mélange trop riche banque 1',         deltaThreshold: 0.06 }
      ]
    },
    {
      category: 'lambda', direction: 'too_high', engineType: 'gasoline',
      consequences: [
        { severity: 'warning',  desc: 'Légère surchauffe possible — mélange pauvre',  deltaThreshold: 0.02 },
        { severity: 'danger',   desc: 'P0171 — mélange trop pauvre',                 deltaThreshold: 0.04 },
        { severity: 'critical', desc: 'Claquements soupapes — mélange trop pauvre pleine charge', deltaThreshold: 0.06 }
      ]
    }
  ];

  var FAULT_CODES = {
    P0087: { desc: 'Pression rampe trop basse',              engineType: 'diesel',   triggerCondition: 'rail_pressure < 700 bar à charge > 60%' },
    P0088: { desc: 'Pression rampe trop haute',              engineType: 'diesel',   triggerCondition: 'rail_pressure > 2050 bar' },
    P0234: { desc: 'Surpression turbocompresseur',           engineType: 'both',     triggerCondition: 'boost > cible +0.25 bar pendant > 3 points consécutifs' },
    P0299: { desc: 'Sous-alimentation turbocompresseur',     engineType: 'both',     triggerCondition: 'boost < cible -0.2 bar pendant > 5 points consécutifs' },
    P0300: { desc: 'Ratés d\'allumage aléatoires',           engineType: 'gasoline', triggerCondition: 'knock_events > 3 sur 5 points consécutifs' },
    P0171: { desc: 'Mélange trop pauvre (banque 1)',         engineType: 'gasoline', triggerCondition: 'AFR > 14.8 pendant > 4 points consécutifs' },
    P0172: { desc: 'Mélange trop riche (banque 1)',          engineType: 'gasoline', triggerCondition: 'AFR < 12.0 pendant > 4 points consécutifs' },
    P0401: { desc: 'Débit EGR insuffisant',                  engineType: 'diesel',   triggerCondition: 'egr_actual < egr_target - 15%' },
    P0402: { desc: 'Débit EGR excessif',                     engineType: 'diesel',   triggerCondition: 'egr_actual > egr_target + 20%' }
  };

  var WORKSHOP_CASES = [
    {
      id: 'wc01_golf_tdi_derate',
      title: 'VW Golf 7 TDI 150 — Mode dégradé en charge',
      vehicle: 'VW Golf 7 2.0 TDI 150 ch (EA288, EDC17C64)',
      engineType: 'diesel',
      symptoms: [
        'Perte de puissance progressive dès 2500 tr/min sous forte charge',
        'Fumée noire visible lors des accélérations soutenues',
        'Température EGT anormalement élevée (> 720°C mesurée OBD)',
        'Code P0087 présent — gel image à 2800 tr/min, 90% charge',
        'Le véhicule se met en mode dégradé (limp mode) sur autoroute'
      ],
      mapsInvolved: ['diesel_injection_qty', 'diesel_rail_pressure'],
      expectedKeywords: ['injection', 'pression rampe', 'P0087', 'surinjection', 'EGT', 'fumée'],
      modelAnalysis: 'Le gel image P0087 à 2800 tr/min / 90% de charge indique que la pression rampe ne suit pas la demande d\'injection. La cartographie diesel_injection_qty présente des valeurs trop élevées dans les cellules haute charge (lignes 100-120%, cols 2500-3000 tr/min), demandant plus de carburant que la pompe HP ne peut alimenter. Conséquence : pression rail chute, atomisation dégradée, EGT en hausse, P0087 déclenché puis limp mode. Correction : réduire les valeurs d\'injection dans les zones incriminées et ajuster en cohérence la pression rampe cible dans la même plage de fonctionnement.',
      difficulty: 2
    },
    {
      id: 'wc02_audi_a3_knock',
      title: 'Audi A3 1.8 TSI — Cliquetis pleine charge',
      vehicle: 'Audi A3 8V 1.8 TFSI 180 ch (Bosch MED17.5.25)',
      engineType: 'gasoline',
      symptoms: [
        'Bruit métallique de cliquetis audible > 3000 tr/min en accélération',
        'L\'ECU applique un retard d\'allumage détecté OBD (-4° cumulés)',
        'P0300 présent — ratés d\'allumage aléatoires',
        'Le client a acheté le véhicule reprogrammé d\'occasion',
        'Carburant utilisé : SP95 (E10) selon le client'
      ],
      mapsInvolved: ['gasoline_ignition_advance'],
      expectedKeywords: ['avance allumage', 'cliquetis', 'retard', 'knock', 'P0300', 'SP98', 'reprogrammation'],
      modelAnalysis: 'Le tableau d\'avance gasoline_ignition_advance présente des valeurs trop élevées dans la plage 0.8-1.2 bar / 3000-5000 tr/min (cellules [7-8][8-9]). Ce réglage est probablement issu d\'une reprogrammation Stage 1 prévue pour du SP98. Le client utilisant du SP95 E10 (indice d\'octane inférieur), le moteur entre en cliquetis. L\'ECU compense par retard automatique (-4°), mais le seuil de P0300 est dépassé. Correction : ramener les cellules concernées à des valeurs compatibles SP95, ou informer le client de la nécessité de passer au SP98 si la reprogrammation doit être conservée.',
      difficulty: 2
    },
    {
      id: 'wc03_bmw_320d_stage2',
      title: 'BMW 320d — Préparation Stage 2, kit turbo +40%',
      vehicle: 'BMW 320d F30 190 ch (B47D20, Bosch EDC17C56)',
      engineType: 'diesel',
      symptoms: [
        'Client souhaite +40% de puissance — kit turbo sport déjà installé',
        'Turbo neuf capable de 2.2 bar max (vs 1.6 bar stock)',
        'Injecteurs remplacés par modèles +20% débit',
        'Radiateur intercooler double épaisseur installé',
        'Demande : stratégie de flash complète pour exploiter le hardware'
      ],
      mapsInvolved: ['diesel_injection_qty', 'diesel_rail_pressure', 'diesel_egr_rate'],
      expectedKeywords: ['injection', 'rampe', 'boost', 'turbo', 'EGR', 'thermique', 'sécurité', 'injecteurs', 'limites'],
      modelAnalysis: 'Avec ce hardware, la stratégie couvre trois cartographies principales. 1) diesel_rail_pressure : augmenter la cible haute charge jusqu\'à 2000-2050 bar max pour alimenter les nouveaux injecteurs à débit supérieur. 2) diesel_injection_qty : augmenter les valeurs de 30-35% dans la plage 2000-3500 tr/min / 80-120% charge, en respectant les limites EGT (max 750°C avec le turbo d\'origine dépassé à 2.2 bar, surveiller attentivement). 3) diesel_egr_rate : réduction significative en charge moyenne-haute pour optimiser le remplissage frais. Points critiques : marges EGT à intégrer dès le début, cohérence injection/rampe à chaque modification, test sur banc de puissance obligatoire avant livraison.',
      difficulty: 3
    }
  ];

  return {
    MAPS: MAPS,
    EXERCISES: EXERCISES,
    LEVELS: LEVELS,
    CONSEQUENCE_TABLE: CONSEQUENCE_TABLE,
    FAULT_CODES: FAULT_CODES,
    WORKSHOP_CASES: WORKSHOP_CASES
  };

})();
