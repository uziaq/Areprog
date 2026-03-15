/* ═══════════════════════════════════════════════════════
   AREPROG — products.js
   Fichier de données central pour la boutique.
   Modifiez ce fichier pour gérer vos produits.
   Chaque produit est automatiquement affiché dans :
     → boutique.html (carte dans la grille)
     → produit.html?id=SLUG (fiche produit complète)
   ═══════════════════════════════════════════════════════ */

var AREPROG_PRODUCTS = [

  /* ──────────────── PRESTATIONS ──────────────── */

  {
    id: "stage1",
    slug: "stage1",
    category: "prestation",
    name: "Stage 1",
    tagline: "Libérez le potentiel caché de votre moteur",
    badge: "Populaire",
    badgeStyle: "popular",
    icon: "⚡",
    price: 300,
    priceLabel: "à partir de",
    priceUnit: "Devis confirmé sous 24h",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_STAGE1",
    featured: true,
    variants: [
      { label: "Diesel", price: 300 },
      { label: "Essence", price: 320 }
    ],
    shortDesc: "Optimisation complète de la cartographie moteur sans modification mécanique. Gains garantis en puissance et couple.",
    fullDesc: "La reprogrammation Stage 1 consiste à modifier les paramètres du calculateur moteur (ECU) pour optimiser la courbe de puissance, le couple et la consommation dans les limites mécaniques d'origine. Sans aucune pièce à changer — uniquement logiciel.",
    benefits: [
      { icon: "⚡", label: "+15 à +30% de puissance", desc: "Gains mesurables sur banc de puissance" },
      { icon: "🔩", label: "+20 à +40% de couple", desc: "Reprise et souplesse moteur améliorées" },
      { icon: "♻️", label: "100% réversible", desc: "Fichier d'origine conservé, retour à tout moment" },
      { icon: "🛡️", label: "Garantie 2 ans", desc: "Sur la prestation et la cartographie" }
    ],
    features: [
      "+15 à +30% de puissance",
      "Garantie 2 ans — 100% réversible",
      "Diagnostic inclus avant intervention"
    ],
    process: [
      { step: "01", title: "Diagnostic", desc: "Lecture des défauts moteur, contrôle de l'état général du véhicule avant intervention." },
      { step: "02", title: "Lecture ECU", desc: "Extraction de la cartographie d'origine via OBD ou en Boot mode si nécessaire." },
      { step: "03", title: "Flashage", desc: "Écriture du nouveau fichier optimisé directement dans le calculateur." },
      { step: "04", title: "Validation", desc: "Test sur route avec datalogger. Contrôle de tous les paramètres en charge." }
    ],
    faq: [
      { q: "Est-ce que le Stage 1 risque d'endommager mon moteur ?", a: "Un Stage 1 correctement réalisé reste dans les tolérances mécaniques d'origine. Les constructeurs dimensionnent leurs moteurs avec une marge significative. On travaille dans cet espace. Diagnostic complet avant chaque intervention." },
      { q: "Ma garantie constructeur est-elle affectée ?", a: "La reprogrammation peut être détectée lors d'un passage en concession. Notre intervention étant 100% réversible, il suffit de repasser au fichier d'origine avant. On conserve votre stock et le remet à tout moment." },
      { q: "Les gains annoncés sont-ils garantis ?", a: "Les pourcentages sont des moyennes constatées. Les gains réels dépendent de l'état du moteur et du carburant. Ce qui est garanti : une amélioration mesurable. Si le résultat ne convient pas, on ajuste ou on revient à l'origine." },
      { q: "Combien de temps dure l'intervention ?", a: "Entre 45 min et 1h30 : 15-20 min de diagnostic, 20-45 min de flashage, 15-20 min de validation. Certains calculateurs nécessitent jusqu'à 2h30." }
    ],
    relatedIds: ["stage2", "pack-s1-egr", "pack-triple"],
    seoTitle: "Stage 1 — Reprogrammation moteur AREPROG",
    seoDesc: "Reprogrammation moteur Stage 1 à domicile. +15 à +30% de puissance, garantie 2 ans, 100% réversible. Devis gratuit sous 24h."
  },

  {
    id: "stage2",
    slug: "stage2",
    category: "prestation",
    name: "Stage 2",
    tagline: "Performance extrême pour les passionnés",
    badge: null,
    icon: "🔥",
    price: 600,
    priceLabel: "à partir de",
    priceUnit: "Sur devis selon véhicule",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_STAGE2",
    featured: false,
    shortDesc: "Haute performance avec modifications mécaniques. Pour les passionnés qui veulent repousser les limites de leur moteur.",
    fullDesc: "Le Stage 2 pousse la reprogrammation au niveau supérieur en combinant cartographie avancée et modifications mécaniques (admission sport, échappement renforcé, intercooler amélioré). Résultats spectaculaires, préparation sur-mesure.",
    benefits: [
      { icon: "🚀", label: "+30 à +50% de puissance", desc: "Gains importants combinés aux modifs mécaniques" },
      { icon: "⚙️", label: "Sur-mesure", desc: "Cartographie adaptée à vos modifications spécifiques" },
      { icon: "🏁", label: "Usage piste possible", desc: "Cartographies spéciales circuit disponibles" },
      { icon: "🛡️", label: "Garantie 2 ans", desc: "Sur la prestation cartographie" }
    ],
    features: [
      "+30 à +50% de puissance",
      "Modifications mécaniques incluses",
      "Cartographie personnalisée"
    ],
    process: [
      { step: "01", title: "Bilan mécanique", desc: "Évaluation complète du véhicule et des modifications existantes." },
      { step: "02", title: "Devis sur-mesure", desc: "Proposition de modifications mécaniques et tarif personnalisé." },
      { step: "03", title: "Modifications", desc: "Installation des pièces de performance (admission, échappement, etc.)." },
      { step: "04", title: "Cartographie & banc", desc: "Mise au point de la cartographie, validation sur banc et route." }
    ],
    faq: [
      { q: "Quelles modifications mécaniques sont nécessaires pour un Stage 2 ?", a: "Selon le véhicule : admission sport, downpipe/décata, intercooler amélioré, durites renforcées. On établit la liste précise lors du devis." },
      { q: "Peut-on passer du Stage 1 au Stage 2 ?", a: "Oui, c'est même la progression recommandée. Un tarif préférentiel est appliqué si vous avez déjà un Stage 1 AREPROG." },
      { q: "Le Stage 2 est-il utilisable au quotidien ?", a: "Oui, à condition que les modifications mécaniques soient adaptées à un usage route. On propose des cartographies optimisées pour la route ou pour la piste selon votre usage." }
    ],
    relatedIds: ["stage1", "pack-triple"],
    seoTitle: "Stage 2 — Reprogrammation haute performance | AREPROG",
    seoDesc: "Reprogrammation Stage 2 avec modifications mécaniques. +30 à +50% de puissance. Préparation sur-mesure à domicile."
  },

  {
    id: "e85",
    slug: "e85",
    category: "prestation",
    name: "Conversion E85",
    tagline: "Jusqu'à 50% d'économies sur le plein",
    badge: "Éco",
    badgeStyle: "eco",
    icon: "🌿",
    price: 350,
    priceLabel: "à partir de",
    priceUnit: "Selon motorisation",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_E85",
    featured: false,
    shortDesc: "Convertissez votre essence turbo au bioéthanol E85. Économisez jusqu'à 50% sur le plein avec un carburant écologique.",
    fullDesc: "La conversion E85 permet à votre moteur essence turbo de fonctionner au bioéthanol. Indice d'octane plus élevé (102 RON), meilleure résistance à la détonation — la cartographie est reprogrammée pour exploiter ces propriétés. Résultat : moins cher, plus propre, parfois plus puissant.",
    benefits: [
      { icon: "💶", label: "Économies jusqu'à 50%", desc: "L'E85 coûte environ moitié moins que le SP95/98" },
      { icon: "🌱", label: "Carburant écologique", desc: "Bioéthanol produit à partir de cultures locales" },
      { icon: "⚡", label: "Performances préservées", desc: "ION 102 RON — meilleure résistance à la détonation" },
      { icon: "🔄", label: "Flex-fuel possible", desc: "Possibilité de rouler en mixte E85/SP selon les stations" }
    ],
    features: [
      "Compatible essence turbo",
      "Retour sur investissement en quelques mois",
      "Homologation possible"
    ],
    process: [
      { step: "01", title: "Vérification compatibilité", desc: "Contrôle injecteurs, pompe à carburant et circuit — certains véhicules nécessitent une mise à niveau." },
      { step: "02", title: "Cartographie E85", desc: "Réécriture complète des tables d'injection, allumage et gestion carburant." },
      { step: "03", title: "Calibration", desc: "Ajustements fins selon l'état du moteur et les températures de fonctionnement." },
      { step: "04", title: "Validation", desc: "Test au bioéthanol sur route, contrôle des richesses et températures." }
    ],
    faq: [
      { q: "Mon véhicule est-il compatible E85 ?", a: "La plupart des moteurs essence turbo produits après 2000 sont compatibles avec un kit ou une simple reprogrammation. On vérifie gratuitement avant toute intervention." },
      { q: "Puis-je continuer à mettre du SP95/98 ?", a: "Oui, selon la version : conversion pure E85 ou flex-fuel (compatible les deux). La version flex-fuel est recommandée pour les zones où l'E85 est moins disponible." },
      { q: "Quel retour sur investissement ?", a: "Avec une consommation de 8L/100 et 15 000 km/an, le ROI est souvent inférieur à 12 mois selon les prix à la pompe." }
    ],
    relatedIds: ["stage1", "conso"],
    seoTitle: "Conversion E85 — Bioéthanol à domicile | AREPROG",
    seoDesc: "Conversion E85 à domicile — jusqu'à 50% d'économies sur le plein. Compatible essence turbo. Devis gratuit sous 24h."
  },

  {
    id: "conso",
    slug: "conso",
    category: "prestation",
    name: "Optim. Consommation",
    tagline: "Moins à la pompe, sans compromis",
    badge: null,
    icon: "⛽",
    price: 250,
    priceLabel: "à partir de",
    priceUnit: "Devis confirmé sous 24h",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_CONSO",
    featured: false,
    variants: [
      { label: "Diesel", price: 250 },
      { label: "Essence", price: 270 }
    ],
    shortDesc: "Reprogrammation orientée économie de carburant. Amélioration du rendement thermique et du couple bas régime.",
    fullDesc: "La reprogrammation consommation agit sur les courbes d'injection, le point d'allumage et la gestion de la suralimentation pour maximiser le rendement thermique. Idéal pour les grands rouleurs, autoroute et zones péri-urbaines.",
    benefits: [
      { icon: "📉", label: "-8 à -15% de consommation", desc: "Gain moyen constaté sur trajets mixtes" },
      { icon: "🛣️", label: "Idéal grande route", desc: "Couple bas régime optimisé pour l'autoroute" },
      { icon: "💶", label: "ROI rapide", desc: "Amortissement en quelques milliers de km" },
      { icon: "🔄", label: "Cumulable", desc: "Compatible avec conversion E85 ou Stage 1" }
    ],
    features: [
      "-8 à -15% de consommation",
      "Idéal grande route / autoroute",
      "Cumulable avec d'autres prestations"
    ],
    process: [
      { step: "01", title: "Analyse profil", desc: "Évaluation de votre usage (trajet type, km/an) pour orienter la cartographie." },
      { step: "02", title: "Lecture ECU", desc: "Extraction de la cartographie d'origine." },
      { step: "03", title: "Optimisation", desc: "Réécriture des tables injection et allumage orientées rendement." },
      { step: "04", title: "Validation route", desc: "Test sur votre trajet habituel avec mesure de consommation réelle." }
    ],
    faq: [
      { q: "Peut-on combiner optimisation conso et Stage 1 ?", a: "Oui — on peut trouver un équilibre entre performance et économie. Certains clients optent pour une cartographie intermédiaire dite 'éco-sport'." },
      { q: "Les gains sont-ils garantis ?", a: "-8 à -15% est une moyenne. Les résultats réels dépendent du style de conduite et des trajets. Garantie de résultat mesurable." }
    ],
    relatedIds: ["stage1", "e85"],
    seoTitle: "Optimisation consommation moteur | AREPROG",
    seoDesc: "Reprogrammation moteur orientée économie carburant. -8 à -15% de consommation. Diesel & essence. À domicile."
  },

  {
    id: "egr",
    slug: "egr",
    category: "prestation",
    name: "Désactivation EGR",
    tagline: "Préservez la longévité de votre moteur",
    badge: null,
    icon: "🔧",
    price: 150,
    priceLabel: null,
    priceUnit: "Tarif fixe",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_EGR",
    featured: false,
    shortDesc: "Suppression logicielle de la vanne EGR. Prévient l'encrassement du moteur et préserve sa longévité.",
    fullDesc: "La vanne EGR (Exhaust Gas Recirculation) réintroduit des gaz d'échappement dans l'admission pour réduire les émissions. À long terme, elle encrasse l'admission, le turbo et les injecteurs. Sa désactivation logicielle supprime ce cycle sans modification physique.",
    benefits: [
      { icon: "🧹", label: "Admission propre", desc: "Plus de dépôts de suie dans le collecteur d'admission" },
      { icon: "⏳", label: "Longévité moteur", desc: "Turbo et injecteurs protégés de l'encrassement" },
      { icon: "💻", label: "100% logiciel", desc: "Aucune modification physique — réversible" },
      { icon: "🚗", label: "Diesel & essence", desc: "Compatible la majorité des motorisations turbo" }
    ],
    features: [
      "100% logiciel — réversible",
      "Diesel & essence turbo",
      "Suppression du code défaut EGR"
    ],
    process: [
      { step: "01", title: "Diagnostic", desc: "Lecture de l'état de la vanne EGR, vérification de l'absence de panne mécanique active." },
      { step: "02", title: "Lecture ECU", desc: "Extraction de la cartographie d'origine." },
      { step: "03", title: "Désactivation", desc: "Suppression logicielle de la boucle EGR dans le calculateur." },
      { step: "04", title: "Validation", desc: "Effacement des codes défauts et vérification de l'absence de voyants." }
    ],
    faq: [
      { q: "La désactivation EGR est-elle détectable au contrôle technique ?", a: "Non — le contrôle technique français mesure les émissions à l'échappement, pas la présence de la vanne EGR. La désactivation logicielle n'impacte pas les valeurs mesurées." },
      { q: "Faut-il aussi désactiver physiquement la vanne ?", a: "Non, la désactivation logicielle suffit et est préférable. La vanne reste en place mais est ignorée par le calculateur." },
      { q: "Peut-on combiner EGR + FAP OFF ?", a: "Oui, et c'est fréquent. On propose un tarif pack pour les deux opérations lors de la même intervention." }
    ],
    relatedIds: ["fap", "adblue", "pack-s1-egr"],
    seoTitle: "Désactivation EGR logicielle | AREPROG",
    seoDesc: "Désactivation EGR logicielle à domicile. 100% réversible, diesel & essence turbo. Préserve la longévité du moteur."
  },

  {
    id: "fap",
    slug: "fap",
    category: "prestation",
    name: "Désactivation FAP",
    tagline: "Fini les régénérations intempestives",
    badge: null,
    icon: "🔧",
    price: 200,
    priceLabel: null,
    priceUnit: "Tarif fixe",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_FAP",
    featured: false,
    shortDesc: "Suppression logicielle du filtre à particules. Évitez les régénérations coûteuses et les pannes récurrentes.",
    fullDesc: "Le filtre à particules (FAP/DPF) piège les particules fines des moteurs diesel. Avec le temps ou sur trajets courts, il se colmate et génère des régénérations forcées, des surconsommations ou des pannes. La suppression logicielle désactive la gestion FAP dans l'ECU.",
    benefits: [
      { icon: "🚫", label: "Fin des régénérations", desc: "Plus de phases de nettoyage forcées et de surconsommation associée" },
      { icon: "🔧", label: "Pas de panne FAP", desc: "Suppression de la source première de pannes diesel" },
      { icon: "💡", label: "Voyant supprimé", desc: "Plus de témoin FAP allumé" },
      { icon: "🩺", label: "Diagnostic inclus", desc: "Vérification de l'état général avant intervention" }
    ],
    features: [
      "Diesel — voyant FAP supprimé",
      "Diagnostic préalable inclus",
      "Suppression des codes défauts"
    ],
    process: [
      { step: "01", title: "Diagnostic FAP", desc: "Lecture du taux de colmatage, contrôle des capteurs de pression différentielle." },
      { step: "02", title: "Lecture ECU", desc: "Extraction de la cartographie d'origine." },
      { step: "03", title: "Suppression", desc: "Désactivation de la gestion FAP, cartographie injection adaptée." },
      { step: "04", title: "Validation", desc: "Effacement des codes défauts, vérification tableau de bord." }
    ],
    faq: [
      { q: "La suppression FAP est-elle détectable au contrôle technique ?", a: "Le contrôle technique mesure l'opacité des fumées. Un FAP supprimé sur un moteur bien entretenu passe généralement sans problème. Nous conseillons de vérifier avant contrôle." },
      { q: "Faut-il retirer physiquement le FAP ?", a: "Non obligatoire pour la partie logicielle. Certains clients retirent ensuite physiquement le filtre — nous pouvons vous conseiller sur les options." },
      { q: "Quelle différence entre FAP et AdBlue ?", a: "Le FAP filtre les particules solides. L'AdBlue (SCR) traite les oxydes d'azote (NOx) via injection d'urée. Ce sont deux systèmes distincts — on peut désactiver l'un ou les deux." }
    ],
    relatedIds: ["egr", "adblue", "pack-s1-fap"],
    seoTitle: "Désactivation FAP logicielle | AREPROG",
    seoDesc: "Désactivation FAP/DPF logicielle à domicile — moteurs diesel. Fini les régénérations. Voyant supprimé. Diagnostic inclus."
  },

  {
    id: "adblue",
    slug: "adblue",
    category: "prestation",
    name: "Désactivation AdBlue",
    tagline: "Supprimez les alertes et blocages moteur",
    badge: null,
    icon: "🔧",
    price: 250,
    priceLabel: null,
    priceUnit: "Tarif fixe",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_ADBLUE",
    featured: false,
    shortDesc: "Suppression logicielle du système SCR/AdBlue. Fin des alertes de niveau et des risques de blocage moteur Diesel Euro 6.",
    fullDesc: "Le système AdBlue (SCR — Selective Catalytic Reduction) injecte une solution d'urée dans les gaz d'échappement pour réduire les NOx. Les pannes de pompe, capteurs ou gicleurs peuvent provoquer des blocages moteur progressifs. La désactivation logicielle supprime entièrement ce système.",
    benefits: [
      { icon: "🚨", label: "Fin des alertes AdBlue", desc: "Plus de messages d'alerte niveau ou qualité" },
      { icon: "🔒", label: "Plus de risque de blocage", desc: "Le blocage moteur progressif lié à l'AdBlue est supprimé" },
      { icon: "💶", label: "Économies entretien", desc: "Plus de remplissage ni de réparation système SCR" },
      { icon: "💻", label: "100% logiciel", desc: "Aucune modification physique — réversible" }
    ],
    features: [
      "Diesel Euro 6",
      "Suppression alerte + risque de blocage",
      "Compatible SUV, utilitaires, VL"
    ],
    process: [
      { step: "01", title: "Diagnostic SCR", desc: "Lecture des défauts liés au système AdBlue, évaluation de l'état du module." },
      { step: "02", title: "Lecture ECU", desc: "Extraction de la cartographie." },
      { step: "03", title: "Suppression SCR", desc: "Désactivation complète du système SCR/AdBlue dans l'ECU." },
      { step: "04", title: "Validation", desc: "Effacement codes défauts, confirmation de l'absence de messages d'alerte." }
    ],
    faq: [
      { q: "Mon moteur risque-t-il d'être bridé après la suppression AdBlue ?", a: "Non — après la désactivation, la limitation progressive liée au système AdBlue est supprimée. Le moteur fonctionne à pleine puissance en permanence." },
      { q: "Est-ce compatible avec la désactivation FAP ou EGR ?", a: "Oui, les trois systèmes sont indépendants. On peut tout traiter lors de la même intervention avec un tarif pack." }
    ],
    relatedIds: ["egr", "fap", "pack-triple"],
    seoTitle: "Désactivation AdBlue logicielle | AREPROG",
    seoDesc: "Suppression SCR/AdBlue logicielle à domicile — Diesel Euro 6. Fin des alertes et blocages moteur. 100% réversible."
  },

  /* ──────────────── PACKS ──────────────── */

  {
    id: "pack-s1-egr",
    slug: "pack-s1-egr",
    category: "pack",
    name: "Pack Stage 1 + EGR",
    tagline: "Performance et longévité en une intervention",
    badge: "Pack",
    badgeStyle: "pack",
    icon: "📦",
    price: 400,
    priceLabel: null,
    priceUnit: "Au lieu de 450€",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_PACK_EGR",
    featured: false,
    variants: [
      { label: "Diesel", price: 400 },
      { label: "Essence", price: 420 }
    ],
    saving: "Économisez 50€ vs séparément",
    includes: ["Stage 1", "EGR OFF"],
    shortDesc: "Gain de performances + protection longévité moteur. Intervention unique, tarif réduit.",
    fullDesc: "Ce pack combine la reprogrammation Stage 1 (gain puissance/couple) avec la désactivation EGR (protection moteur). Une seule venue de notre technicien à votre domicile pour deux prestations complémentaires à prix réduit.",
    benefits: [
      { icon: "⚡", label: "Stage 1 inclus", desc: "+15 à +30% de puissance et couple" },
      { icon: "🧹", label: "EGR OFF inclus", desc: "Admission propre, longévité moteur préservée" },
      { icon: "💶", label: "50€ économisés", desc: "Par rapport aux deux prestations séparées" },
      { icon: "🚗", label: "1 seule venue", desc: "Technicien à domicile, tout en une fois" }
    ],
    features: [
      "Stage 1 + Désactivation EGR",
      "50€ d'économie vs séparément",
      "1 intervention à domicile"
    ],
    faq: [
      { q: "Les deux prestations sont-elles réalisées lors de la même venue ?", a: "Oui, c'est l'intérêt du pack. Un seul déplacement, deux fichiers écrits lors de la même session." },
      { q: "Peut-on ajouter la désactivation FAP au pack ?", a: "Oui, nous proposons aussi le pack Triple (Stage 1 + EGR + FAP) avec 100€ d'économie." }
    ],
    relatedIds: ["stage1", "egr", "pack-triple"],
    seoTitle: "Pack Stage 1 + EGR OFF | AREPROG",
    seoDesc: "Pack Stage 1 + désactivation EGR à domicile. 50€ économisés, 1 seule intervention. Diesel & essence turbo."
  },

  {
    id: "pack-s1-fap",
    slug: "pack-s1-fap",
    category: "pack",
    name: "Pack Stage 1 + FAP",
    tagline: "Boostez votre diesel et éliminez les pannes FAP",
    badge: "Pack",
    badgeStyle: "pack",
    icon: "📦",
    price: 440,
    priceLabel: null,
    priceUnit: "Au lieu de 500€",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_PACK_FAP",
    featured: false,
    saving: "Économisez 60€ vs séparément",
    includes: ["Stage 1", "FAP OFF"],
    shortDesc: "Performances + fiabilité. Supprimez les régénérations tout en boostant votre diesel.",
    fullDesc: "Le combo idéal pour les diesels. Stage 1 pour les performances, suppression FAP pour éliminer les régénérations forcées et leurs surconsommations. Diesel uniquement, une seule intervention.",
    benefits: [
      { icon: "⚡", label: "Stage 1 inclus", desc: "+15 à +30% de puissance" },
      { icon: "🚫", label: "FAP OFF inclus", desc: "Fin des régénérations et pannes FAP" },
      { icon: "💶", label: "60€ économisés", desc: "Par rapport aux deux prestations séparées" },
      { icon: "🚗", label: "Diesel uniquement", desc: "Optimisé pour moteurs diesel turbo" }
    ],
    features: [
      "Stage 1 + Désactivation FAP",
      "60€ d'économie vs séparément",
      "Diesel uniquement"
    ],
    faq: [
      { q: "Ce pack est-il réservé aux diesels ?", a: "Oui, la suppression FAP ne concerne que les moteurs diesel. Pour l'essence, on recommande le pack Stage 1 + EGR." }
    ],
    relatedIds: ["stage1", "fap", "pack-triple"],
    seoTitle: "Pack Stage 1 + FAP OFF | AREPROG",
    seoDesc: "Pack Stage 1 + désactivation FAP pour diesel. 60€ économisés, une seule intervention à domicile."
  },

  {
    id: "pack-triple",
    slug: "pack-triple",
    category: "pack",
    name: "Pack Stage 1 + EGR + FAP",
    tagline: "Le pack complet — le meilleur rapport qualité/prix",
    badge: "Best value",
    badgeStyle: "pack",
    icon: "⭐",
    price: 550,
    priceLabel: null,
    priceUnit: "Au lieu de 650€",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_PACK_TRIPLE",
    featured: true,
    saving: "Économisez 100€ vs séparément",
    includes: ["Stage 1", "EGR OFF", "FAP OFF"],
    shortDesc: "Performances + longévité + zéro entretien FAP. Tout en une seule intervention à domicile.",
    fullDesc: "Le pack ultime pour votre diesel : Stage 1 pour les performances, EGR OFF pour protéger l'admission, FAP OFF pour éliminer les régénérations. 100€ d'économie, un seul déplacement de notre technicien.",
    benefits: [
      { icon: "⚡", label: "Stage 1 inclus", desc: "+15 à +30% de puissance et couple" },
      { icon: "🧹", label: "EGR OFF inclus", desc: "Admission propre, moteur protégé" },
      { icon: "🚫", label: "FAP OFF inclus", desc: "Fin définitive des régénérations forcées" },
      { icon: "💶", label: "100€ économisés", desc: "Meilleur rapport qualité/prix du catalogue" }
    ],
    features: [
      "Stage 1 + EGR OFF + FAP OFF",
      "100€ d'économie vs séparément",
      "Diesel uniquement — 1 intervention"
    ],
    faq: [
      { q: "Peut-on ajouter AdBlue OFF à ce pack ?", a: "Oui, moyennant un supplément. Contactez-nous pour un devis personnalisé incluant AdBlue." },
      { q: "Ce pack est-il disponible pour l'essence ?", a: "Partiellement — Stage 1 + EGR est disponible en essence. Le FAP OFF concerne uniquement le diesel." }
    ],
    relatedIds: ["stage1", "egr", "fap", "adblue"],
    seoTitle: "Pack Stage 1 + EGR + FAP — Best value | AREPROG",
    seoDesc: "Pack complet Stage 1 + EGR OFF + FAP OFF diesel. 100€ économisés, une seule intervention. Meilleur rapport qualité/prix."
  },

  /* ──────────────── PRODUITS PHYSIQUES ──────────────── */

  {
    id: "cable-obd2",
    slug: "cable-obd2",
    category: "produit",
    name: "Câble OBD2 Pro",
    tagline: "Diagnostiquez votre véhicule en autonomie",
    badge: "Expédition",
    badgeStyle: "physique",
    icon: "🔌",
    price: 45,
    priceLabel: null,
    priceUnit: "Livraison incluse",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_CABLE",
    featured: false,
    shortDesc: "Câble diagnostic OBD2 universel compatible tous protocoles. Lecture et effacement de codes défauts en totale autonomie.",
    fullDesc: "Le câble OBD2 Pro AREPROG est compatible avec tous les protocoles OBD2 standard (CAN, ISO, KWP, J1850). Câble USB renforcé de 1,8m, compatible avec les logiciels VCDS, EOBD Facile, Forscan et la majorité des applications Android/iOS.",
    benefits: [
      { icon: "🔌", label: "Universel OBD2", desc: "Compatible tous protocoles : CAN, ISO, KWP, J1850" },
      { icon: "📱", label: "Multi-plateforme", desc: "PC, Android, iOS — compatible tous logiciels OBD" },
      { icon: "📦", label: "Expédié sous 48h", desc: "Livraison colissimo incluse dans le prix" },
      { icon: "🛡️", label: "Câble renforcé", desc: "1,8m, connecteurs en métal brossé" }
    ],
    features: [
      "Compatible OBD2 universel",
      "Câble 1.8m renforcé",
      "Expédié sous 48h — livraison incluse"
    ],
    faq: [
      { q: "Avec quels logiciels est-il compatible ?", a: "VCDS Lite, EOBD Facile, Forscan, Torque (Android), OBD Fusion (iOS) et la majorité des applications OBD du marché." },
      { q: "Est-il compatible avec les véhicules récents ?", a: "Oui, tous les véhicules produits après 2004 (Europe) et 1996 (USA) sont équipés du port OBD2 standard." }
    ],
    relatedIds: ["vag-com", "odis"],
    seoTitle: "Câble OBD2 Pro — Diagnostic universel | AREPROG",
    seoDesc: "Câble OBD2 Pro universel — lecture et effacement de codes défauts. Compatible tous véhicules. Livraison incluse."
  },

  {
    id: "vag-com",
    slug: "vag-com",
    category: "produit",
    name: "Interface VAG-COM",
    tagline: "Le diagnostic constructeur pour le Groupe VAG",
    badge: "Pro",
    badgeStyle: "popular",
    icon: "💾",
    price: 149,
    priceLabel: null,
    priceUnit: "Expédié sous 48h",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_VAGCOM",
    featured: true,
    shortDesc: "Interface de diagnostic avancée pour véhicules du Groupe VAG. Accès aux modules cachés, codages et adaptations.",
    fullDesc: "L'interface VAG-COM donne accès à tous les modules électroniques des véhicules Volkswagen, Audi, Seat, Skoda et Porsche (Groupe VAG). Lecture/effacement codes défauts, codages avancés, adaptations, visualisation des mesures en temps réel.",
    benefits: [
      { icon: "🎯", label: "Groupe VAG complet", desc: "VW, Audi, Seat, Skoda, Porsche — tous modules" },
      { icon: "💻", label: "Logiciel inclus", desc: "VCDS compatible inclus dans le pack" },
      { icon: "🔄", label: "Mises à jour gratuites", desc: "Accès aux mises à jour logiciel sans surcoût" },
      { icon: "📦", label: "Expédié sous 48h", desc: "Avec câble USB, documentation et accès logiciel" }
    ],
    features: [
      "Groupe VAG complet (VW, Audi, Seat, Skoda)",
      "Logiciel + mises à jour inclus",
      "Accès à tous les modules"
    ],
    faq: [
      { q: "Fonctionne-t-il sur les véhicules récents ?", a: "Oui, compatible jusqu'aux véhicules 2025 avec les dernières mises à jour logiciel." },
      { q: "Peut-on coder des options avec cet outil ?", a: "Oui — activation de fonctions cachées (DRL, affichage huile, etc.) selon le véhicule." }
    ],
    relatedIds: ["cable-obd2", "odis"],
    seoTitle: "Interface VAG-COM — Diagnostic Groupe VAG | AREPROG",
    seoDesc: "Interface VAG-COM diagnostic avancé Groupe VAG. VW, Audi, Seat, Skoda. Codages, adaptations, logiciel inclus."
  },

  /* ──────────────── BONS CADEAUX ──────────────── */

  {
    id: "gift-100",
    slug: "gift-100",
    category: "cadeau",
    name: "Bon cadeau 100€",
    tagline: "Offrez une expérience AREPROG",
    badge: "Cadeau",
    badgeStyle: "gift",
    icon: "🎁",
    price: 100,
    priceLabel: null,
    priceUnit: "Valable 1 an",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_GIFT100",
    featured: false,
    shortDesc: "Bon cadeau 100€ valable sur l'ensemble des prestations AREPROG. Idéal en contribution.",
    fullDesc: "Le bon cadeau AREPROG est valable 1 an sur l'ensemble du catalogue de prestations (Stage 1, E85, désactivations, etc.). Après achat, vous recevez le bon par email avec un code unique à transmettre au bénéficiaire.",
    benefits: [
      { icon: "🎁", label: "Cadeau original", desc: "Pour les passionnés qui ont déjà tout" },
      { icon: "📧", label: "Envoi par email", desc: "Bon reçu immédiatement après paiement" },
      { icon: "📅", label: "Valable 1 an", desc: "Le temps de planifier l'intervention" },
      { icon: "🔄", label: "Sur tout le catalogue", desc: "Utilisable sur toutes les prestations" }
    ],
    features: ["Valable sur toutes les prestations", "Envoi par email sous 24h", "Valable 1 an"],
    faq: [
      { q: "Comment le bénéficiaire utilise-t-il le bon ?", a: "Il contacte AREPROG avec le code reçu par email. Le montant est déduit du devis de sa prestation." },
      { q: "Le bon est-il cumulable ?", a: "Oui, plusieurs bons peuvent être cumulés sur une même prestation." }
    ],
    relatedIds: ["gift-200", "gift-300"],
    seoTitle: "Bon cadeau 100€ AREPROG",
    seoDesc: "Bon cadeau 100€ valable sur les prestations de reprogrammation moteur AREPROG. Envoi par email, valable 1 an."
  },

  {
    id: "gift-200",
    slug: "gift-200",
    category: "cadeau",
    name: "Bon cadeau 200€",
    tagline: "Le cadeau idéal pour un passionné",
    badge: "Le + offert",
    badgeStyle: "gift",
    icon: "🎁",
    price: 200,
    priceLabel: null,
    priceUnit: "Valable 1 an",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_GIFT200",
    featured: true,
    shortDesc: "Bon cadeau 200€ — couvre un Stage 1 sur la plupart des véhicules. Le cadeau idéal pour un passionné.",
    fullDesc: "200€ couvrent un Stage 1 complet sur de nombreuses motorisations diesel et essence. Le cadeau parfait pour offrir une vraie expérience de performance automobile. Bon reçu par email, valable 1 an sur tout le catalogue.",
    benefits: [
      { icon: "🎁", label: "Couvre un Stage 1", desc: "Sur la majorité des véhicules diesel/essence" },
      { icon: "📧", label: "Envoi par email", desc: "Bon reçu immédiatement après paiement" },
      { icon: "📅", label: "Valable 1 an", desc: "Le temps de planifier l'intervention" },
      { icon: "⭐", label: "Le plus offert", desc: "Notre bon cadeau le plus populaire" }
    ],
    features: ["Couvre la majorité des Stage 1", "Envoi par email sous 24h", "Valable 1 an"],
    faq: [
      { q: "200€ couvrent-ils toujours un Stage 1 complet ?", a: "Sur la majorité des véhicules, oui. Pour les motorisations spécifiques (exotiques, très grosses cylindrées), un complément peut être demandé." }
    ],
    relatedIds: ["gift-100", "gift-300", "stage1"],
    seoTitle: "Bon cadeau 200€ AREPROG — Idéal Stage 1",
    seoDesc: "Bon cadeau 200€ AREPROG — couvre un Stage 1 complet. Envoi email immédiat, valable 1 an sur tout le catalogue."
  },

  {
    id: "gift-300",
    slug: "gift-300",
    category: "cadeau",
    name: "Bon cadeau 300€",
    tagline: "Le grand cadeau pour les vrais passionnés",
    badge: "Cadeau",
    badgeStyle: "gift",
    icon: "🎁",
    price: 300,
    priceLabel: null,
    priceUnit: "Valable 1 an",
    stripeLink: "https://buy.stripe.com/VOTRE_LIEN_GIFT300",
    featured: false,
    shortDesc: "Bon cadeau 300€ — Stage 1 complet avec options incluses. Le grand cadeau pour les vrais passionnés.",
    fullDesc: "Le bon cadeau le plus généreux — 300€ couvrent un Stage 1 complet avec options (diagnostic avancé, cartographie spécifique) ou une prestation combinée (Stage 1 + EGR ou FAP). Valable 1 an, envoyé par email.",
    benefits: [
      { icon: "🎁", label: "Stage 1 + options", desc: "Couvre un Stage 1 complet avec options" },
      { icon: "📧", label: "Envoi par email", desc: "Bon reçu immédiatement après paiement" },
      { icon: "📅", label: "Valable 1 an", desc: "Pour prendre le temps de bien planifier" },
      { icon: "🔄", label: "Flexible", desc: "Utilisable sur n'importe quelle prestation" }
    ],
    features: ["Stage 1 complet avec options", "Envoi par email sous 24h", "Valable 1 an"],
    faq: [
      { q: "Ce bon peut-il couvrir un pack ?", a: "Oui, il peut contribuer à un pack — la différence est réglée directement avec le technicien." }
    ],
    relatedIds: ["gift-100", "gift-200", "pack-s1-egr"],
    seoTitle: "Bon cadeau 300€ AREPROG",
    seoDesc: "Bon cadeau 300€ — Stage 1 complet avec options. Le grand cadeau pour les passionnés. Envoi email, valable 1 an."
  }

];

/* ════════════════════════════════════════
   Helpers — utilisés par boutique.html et produit.html
   ════════════════════════════════════════ */

function getProductById(id) {
  return AREPROG_PRODUCTS.find(p => p.id === id) || null;
}

function getProductsByCategory(cat) {
  return AREPROG_PRODUCTS.filter(p => p.category === cat);
}

function getRelatedProducts(product, limit = 3) {
  if (!product.relatedIds) return [];
  return product.relatedIds
    .map(id => getProductById(id))
    .filter(Boolean)
    .slice(0, limit);
}

// Catégories ordonnées pour l'affichage boutique
var SHOP_CATEGORIES = [
  { id: "prestation", label: "Prestations" },
  { id: "pack",       label: "Packs combinés" },
  { id: "produit",    label: "Produits physiques" },
  { id: "cadeau",     label: "Bons cadeaux" }
];
