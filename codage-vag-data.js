/* ═══════════════════════════════════════════
   AREPROG — VAG Coding Data v1.0
   Base de données : marques, modèles, options, packs
   ═══════════════════════════════════════════ */

window.VAG = (function() {

  const BRANDS = [
    { id: 'vw',   name: 'Volkswagen',   abbr: 'VW',   color: '#1B5E9B' },
    { id: 'audi', name: 'Audi',         abbr: 'A',    color: '#BB0A14' },
    { id: 'seat', name: 'Seat / Cupra', abbr: 'S/C',  color: '#1A1A2E' },
    { id: 'skoda',name: 'Skoda',        abbr: 'Š',    color: '#4BA82E' }
  ];

  const MODELS = [
    // ── Volkswagen ──────────────────────────────
    { id:'golf7',    brandId:'vw',    name:'Golf 7',        code:'5G/AU',   platform:'MQB',      yearMin:2012, yearMax:2019 },
    { id:'golf8',    brandId:'vw',    name:'Golf 8',        code:'CD1/5H',  platform:'MQB Evo',  yearMin:2019, yearMax:2024 },
    { id:'polo6',    brandId:'vw',    name:'Polo 6',        code:'AW',      platform:'MQB-A0',   yearMin:2017, yearMax:2024 },
    { id:'tiguan2',  brandId:'vw',    name:'Tiguan 2',      code:'AD/BW2',  platform:'MQB',      yearMin:2016, yearMax:2024 },
    { id:'troc',     brandId:'vw',    name:'T-Roc',         code:'A11/AC7', platform:'MQB',      yearMin:2017, yearMax:2024 },
    { id:'passat8',  brandId:'vw',    name:'Passat 8',      code:'3G/B8',   platform:'MQB',      yearMin:2014, yearMax:2023 },
    { id:'arteon',   brandId:'vw',    name:'Arteon',        code:'3H',      platform:'MQB',      yearMin:2017, yearMax:2024 },
    // ── Audi ────────────────────────────────────
    { id:'a3_8v',    brandId:'audi',  name:'A3 8V',         code:'8V',      platform:'MQB',      yearMin:2012, yearMax:2020 },
    { id:'a3_8y',    brandId:'audi',  name:'A3 8Y',         code:'8Y',      platform:'MQB Evo',  yearMin:2020, yearMax:2024 },
    { id:'q3_2',     brandId:'audi',  name:'Q3 (2e gen)',   code:'F3',      platform:'MQB',      yearMin:2018, yearMax:2024 },
    { id:'a4_b9',    brandId:'audi',  name:'A4 B9',         code:'B9/8W',   platform:'MLB Evo',  yearMin:2015, yearMax:2024 },
    { id:'a6_c8',    brandId:'audi',  name:'A6 C8',         code:'C8/4A',   platform:'MLB Evo',  yearMin:2018, yearMax:2024 },
    // ── Seat / Cupra ────────────────────────────
    { id:'leon_5f',  brandId:'seat',  name:'Leon 5F',       code:'5F',      platform:'MQB',      yearMin:2012, yearMax:2020 },
    { id:'leon_4',   brandId:'seat',  name:'Leon 4 (KL)',   code:'KL',      platform:'MQB Evo',  yearMin:2020, yearMax:2024 },
    { id:'formentor',brandId:'seat',  name:'Cupra Formentor',code:'KM',     platform:'MQB Evo',  yearMin:2020, yearMax:2024 },
    { id:'ateca',    brandId:'seat',  name:'Ateca',         code:'KH/5FP',  platform:'MQB',      yearMin:2016, yearMax:2024 },
    // ── Skoda ────────────────────────────────────
    { id:'octavia3', brandId:'skoda', name:'Octavia 3',     code:'5E',      platform:'MQB',      yearMin:2012, yearMax:2020 },
    { id:'octavia4', brandId:'skoda', name:'Octavia 4',     code:'NX5',     platform:'MQB Evo',  yearMin:2020, yearMax:2024 },
    { id:'karoq',    brandId:'skoda', name:'Karoq',         code:'NU7',     platform:'MQB',      yearMin:2017, yearMax:2024 },
    { id:'kodiaq',   brandId:'skoda', name:'Kodiaq',        code:'NS7',     platform:'MQB',      yearMin:2016, yearMax:2024 }
  ];

  // ─────────────────────────────────────────────────────
  //  OPTIONS (50+)
  //  compatible.models: [] = tous modèles compatibles
  // ─────────────────────────────────────────────────────
  const OPTIONS = [

    // ════════════════ CONFORT ════════════════
    {
      id:'opt_rain_close', name:'Fermeture automatique des vitres à la pluie',
      description:'Active la fermeture automatique des vitres lorsque le capteur de pluie détecte des précipitations — même lorsque vous avez quitté le véhicule.',
      techDescription:'Adaptation via canal "Rain closing" dans le module des lève-vitres (FH) ou BCM. Nécessite capteur de pluie OEM actif.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:['Capteur de pluie'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_remote_windows','opt_mirror_fold']
    },
    {
      id:'opt_mirror_fold', name:'Rétroviseurs rabattables automatiquement',
      description:'Les rétroviseurs électriques se rabattent automatiquement à la fermeture du véhicule et se déplient à l\'ouverture.',
      techDescription:'Codage dans module de confort (BCM/KI) — activation fonction "mirror folding on lock/unlock". Nécessite rétros électriques repliables.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Rétroviseurs électriques rabattables'] },
      difficulty:'facile', timeMin:15, price:49, active:true,
      upsellIds:['opt_confort_entry','opt_rain_close']
    },
    {
      id:'opt_remote_windows', name:'Ouverture / fermeture vitres via télécommande',
      description:'Maintenez le bouton de fermeture ou d\'ouverture de la télécommande pour contrôler toutes les vitres à distance.',
      techDescription:'Activation "remote window operation" dans le module FH ou BCM. Certains modèles nécessitent aussi adaptation anti-pincement.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:20, price:59, active:true,
      upsellIds:['opt_rain_close','opt_trunk_auto']
    },
    {
      id:'opt_confort_entry', name:'Clignotant de bienvenue à l\'ouverture des portes',
      description:'Les clignotants s\'allument brièvement lors du déverrouillage du véhicule — signal visuel discret et élégant.',
      techDescription:'Codage "coming home indicators" dans le module Central Electric (ZAS/BCM).',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_coming_home','opt_follow_me']
    },
    {
      id:'opt_pinch', name:'Anti-pincement vitres renforcé',
      description:'Améliore la sensibilité de la protection anti-pincement des vitres électriques — sécurité accrue pour les enfants et les animaux.',
      techDescription:'Adaptation des seuils de détection dans le module FH. Calibrage précis pour éviter les faux positifs.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_remote_windows']
    },
    {
      id:'opt_seat_heat', name:'Siège chauffant — activation automatique au démarrage',
      description:'Les sièges chauffants s\'activent automatiquement à chaque démarrage en dessous d\'une température seuil configurable.',
      techDescription:'Codage dans le module Climatronic ou BCM pour activation automatique fonction chauffage siège.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Sièges chauffants OEM'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_auto_hold']
    },
    {
      id:'opt_alarm_horn', name:'Alarme silencieuse (sans klaxon)',
      description:'Désactive le klaxon lors du déclenchement de l\'alarme — seuls les clignotants s\'activent. Idéal en milieu urbain.',
      techDescription:'Adaptation "horn on alarm" dans le module d\'alarme (SAKG) ou BCM. Activation/désactivation du signal sonore.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Alarme OEM'] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_confort_entry']
    },
    {
      id:'opt_belt_beep', name:'Désactivation bip de ceinture',
      description:'Supprime le signal sonore d\'avertissement de ceinture non bouclée — utile sur circuit ou terrain privé.',
      techDescription:'Adaptation dans le module d\'instrumentation (KI/KOMBI). Désactivation du code belted reminder.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_speed_beep_off']
    },
    {
      id:'opt_trunk_auto', name:'Fermeture automatique du coffre électrique',
      description:'Le hayon électrique se ferme automatiquement à l\'approche du conducteur (si équipé détecteur de pied).',
      techDescription:'Activation dans module Heckklappensystem (HKL). Nécessite hayon électrique et capteur piéton.',
      category:'confort',
      compatible:{ models:['golf8','tiguan2','troc','arteon','a3_8y','q3_2','a4_b9','a6_c8','leon_4','formentor','octavia4','kodiaq'], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2017, yearMax:2024, requiresEquipment:['Hayon électrique','Capteur de pied'] },
      difficulty:'moyen', timeMin:25, price:39, active:true,
      upsellIds:['opt_remote_windows']
    },
    {
      id:'opt_door_soft', name:'Fermeture douce portes assistée',
      description:'Améliore le retour haptique et sonore lors de la fermeture des portes — confort premium.',
      techDescription:'Codage dans module de porte (TÜRSTEUERGERÄT). Activation de la résistance mécanique douce.',
      category:'confort',
      compatible:{ models:['a4_b9','a6_c8'], platforms:['MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Portes soft-close OEM'] },
      difficulty:'moyen', timeMin:20, price:29, active:true,
      upsellIds:['opt_mirror_fold']
    },
    {
      id:'opt_auto_hold', name:'Auto Hold — activation permanente',
      description:'L\'Auto Hold (maintien automatique des freins à l\'arrêt) reste activé par défaut à chaque démarrage, sans avoir à l\'activer manuellement.',
      techDescription:'Adaptation dans le module de freinage (ABS/ESC). Mémorisation état Auto Hold = ON au démarrage.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Auto Hold OEM'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_startstop_off']
    },
    {
      id:'opt_wiper_park', name:'Essuie-glaces en position conducteur',
      description:'Les essuie-glaces se garent côté conducteur plutôt que côté passager — améliore la visibilité lors des arrêts.',
      techDescription:'Adaptation "wiper park position" dans module des essuie-glaces (WW). Inversion de la position de repos.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_rain_close']
    },

    // ════════════════ ECLAIRAGE ════════════════
    {
      id:'opt_us_lights', name:'Activation feux US (clignotants latéraux jaunes)',
      description:'Transforme les répétiteurs de clignotants latéraux en feux de position orange permanents — look américain sportif.',
      techDescription:'Codage dans module Central Electric (ZAS) ou BCM. Activation "US turn signal" mode.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_coming_home','opt_drl']
    },
    {
      id:'opt_coming_home', name:'Coming / Leaving Home personnalisé',
      description:'Configurez la durée et l\'intensité des phares qui s\'allument à l\'approche ou au départ du véhicule.',
      techDescription:'Adaptation "coming home / leaving home duration" dans module LM (gestion lumière) ou KESSY.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Phares automatiques ou Bi-Xenon/LED'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_follow_me','opt_drl']
    },
    {
      id:'opt_drl', name:'DRL personnalisés — feux diurnes sur mesure',
      description:'Modifiez le comportement des feux de jour : intensité, couleur LED (sur modèles compatibles), désactivation de moitié au clignotant.',
      techDescription:'Adaptation dans module LM ou adaptation SWFL LED. Codage des byte DRL dans module phares avant.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2014, yearMax:2024, requiresEquipment:['DRL LED OEM'] },
      difficulty:'moyen', timeMin:20, price:49, active:true,
      upsellIds:['opt_coming_home','opt_ambient']
    },
    {
      id:'opt_corner', name:'Feux de virage statiques (cornering lights)',
      description:'Active les feux de virage dans les phares — ils s\'allument lors des manoeuvres basse vitesse pour éclairer les angles.',
      techDescription:'Codage dans module LM. Activation statisches Kurvenlichtsystem. Nécessite phares avec ampoule cornering.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['Phares bi-xénon ou Full LED'] },
      difficulty:'moyen', timeMin:20, price:59, active:true,
      upsellIds:['opt_drl','opt_coming_home']
    },
    {
      id:'opt_position', name:'Personnalisation feux de position',
      description:'Modifiez le comportement des feux de position — activation automatique au démarrage, intensité réduite en journée.',
      techDescription:'Codage "Standlicht" et adaptation intensité dans module LM (Lichtmanagement).',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_us_lights','opt_drl']
    },
    {
      id:'opt_courtesy', name:'Eclairage de courtoisie prolongé',
      description:'L\'éclairage intérieur reste allumé plus longtemps après la fermeture des portes — confort d\'entrée/sortie.',
      techDescription:'Adaptation durée "interior light fade out" dans module BCM/KI.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_ambient','opt_follow_me']
    },
    {
      id:'opt_follow_me', name:'Follow Me Home prolongé',
      description:'Prolongez la durée pendant laquelle les phares restent allumés après avoir quitté le véhicule.',
      techDescription:'Adaptation "Follow Me Home" timer dans module LM. Valeur configurable de 0 à 120 secondes.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_coming_home']
    },
    {
      id:'opt_brake_blink', name:'Feux stop clignotants en freinage d\'urgence',
      description:'En cas de freinage brusque, les feux stop clignotent rapidement pour alerter les véhicules suiveurs — sécurité active.',
      techDescription:'Activation "Emergency braking flashing" dans module ABS/ESC. Fréquence de clignotement paramétrable.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:39, active:true,
      upsellIds:['opt_hazard_brake','opt_front_assist']
    },
    {
      id:'opt_ambient', name:'Ambiance intérieure étendue',
      description:'Activez et personnalisez l\'éclairage d\'ambiance intérieur — couleurs, zones et intensité selon vos préférences.',
      techDescription:'Codage dans module KI ou MMI/MIB selon véhicule. Activation zones supplémentaires dans module de confort.',
      category:'eclairage',
      compatible:{ models:['golf8','tiguan2','arteon','a3_8y','a4_b9','a6_c8','leon_4','formentor','octavia4'], platforms:['MQB Evo','MLB Evo'], yearMin:2017, yearMax:2024, requiresEquipment:['Ambiance LED OEM'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_drl','opt_courtesy']
    },
    {
      id:'opt_led_logo', name:'Logo lumineux au démarrage',
      description:'Active l\'animation lumineuse du logo de marque sur les phares LED Matrix lors du démarrage.',
      techDescription:'Activation "welcome light show" dans module LM. Spécifique aux phares IQ.Light ou LED Matrix.',
      category:'eclairage',
      compatible:{ models:['golf8','arteon','a3_8y','a4_b9','a6_c8','formentor'], platforms:['MQB Evo','MLB Evo'], yearMin:2018, yearMax:2024, requiresEquipment:['Phares IQ.Light ou Matrix LED'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_drl']
    },
    {
      id:'opt_hazard_brake', name:'Feux de détresse au freinage fort',
      description:'Les warnings s\'activent automatiquement lors d\'un freinage fort ou d\'un ABS — signal d\'alerte maximal.',
      techDescription:'Activation "hazard warning on heavy braking" dans module ABS/ESC. Seuil de déclenchement paramétrable.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:29, active:true,
      upsellIds:['opt_brake_blink']
    },
    {
      id:'opt_rear_fog_off', name:'Désactivation antibrouillard arrière automatique',
      description:'Supprime l\'activation automatique du brouillard arrière dans certaines conditions — évite l\'éblouissement des suiveurs.',
      techDescription:'Codage "rear fog light" dans module BCM. Désactivation de la logique automatique.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_position']
    },

    // ════════════════ MULTIMEDIA ════════════════
    {
      id:'opt_carplay_wireless', name:'Apple CarPlay sans fil',
      description:'Passez de CarPlay filaire à CarPlay sans fil — connexion automatique dès que vous montez en voiture.',
      techDescription:'Activation "wireless CarPlay" dans module MIB3 ou MMI. Nécessite MIB3/MMI Navigation Plus avec firmware compatible.',
      category:'multimedia',
      compatible:{ models:['golf8','a3_8y','leon_4','formentor','octavia4'], platforms:['MQB Evo','MLB Evo'], yearMin:2020, yearMax:2024, requiresEquipment:['CarPlay filaire OEM','MIB3 ou MMI 3+'] },
      difficulty:'moyen', timeMin:25, price:79, active:true,
      upsellIds:['opt_android_wireless','opt_rear_camera']
    },
    {
      id:'opt_android_wireless', name:'Android Auto sans fil',
      description:'Activez Android Auto en mode sans fil — fini le câble USB, connexion automatique à chaque trajet.',
      techDescription:'Activation "wireless Android Auto" dans module MIB3. Nécessite firmware MIB3 compatible et smartphone Android 11+.',
      category:'multimedia',
      compatible:{ models:['golf8','a3_8y','leon_4','formentor','octavia4'], platforms:['MQB Evo','MLB Evo'], yearMin:2020, yearMax:2024, requiresEquipment:['Android Auto filaire OEM','MIB3'] },
      difficulty:'moyen', timeMin:25, price:79, active:true,
      upsellIds:['opt_carplay_wireless','opt_screen_mirror']
    },
    {
      id:'opt_hidden_menu', name:'Menu caché / Service Menu MIB',
      description:'Accédez aux paramètres cachés de l\'autoradio MIB pour diagnostics, calibration et réglages avancés.',
      techDescription:'Activation du menu service via combinaison de touches ou codage dans MIB. Canal "Service-Menu" dans adaptation.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2013, yearMax:2024, requiresEquipment:['MIB / Discover Media / Discover Pro'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_dev_mode','opt_boot_logo']
    },
    {
      id:'opt_boot_logo', name:'Logo personnalisé au démarrage de l\'autoradio',
      description:'Modifiez le logo de démarrage de votre autoradio — marque, image personnalisée ou logo AREPROG.',
      techDescription:'Injection de fichier .png via VCDS ou ODIS dans le module MIB. Fichier 800x480 max.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2013, yearMax:2022, requiresEquipment:['Discover Media 2+ ou Discover Pro'] },
      difficulty:'moyen', timeMin:20, price:29, active:true,
      upsellIds:['opt_hidden_menu']
    },
    {
      id:'opt_video_motion', name:'Vidéo en mouvement (TV/DVD en roulant)',
      description:'Désactive le blocage vidéo en mouvement — visualisez des contenus multimédias même pendant la conduite.',
      techDescription:'Adaptation "Video in motion" dans module MIB ou MMI. Désactivation du verrou vitesse GPS.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Autoradio avec entrée vidéo'] },
      difficulty:'moyen', timeMin:20, price:89, active:true,
      upsellIds:['opt_screen_mirror']
    },
    {
      id:'opt_temp_display', name:'Température extérieure toujours visible',
      description:'Affichez en permanence la température extérieure dans l\'instrumentation, même si la climatisation est désactivée.',
      techDescription:'Adaptation affichage temperature dans module KI/KOMBI. Activation du champ de donnée dans DID.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Sonde température extérieure'] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_traffic_sign']
    },
    {
      id:'opt_dev_mode', name:'Mode développeur MIB activé',
      description:'Active le mode développeur de l\'autoradio MIB pour accéder aux logs, diagnostics avancés et paramètres experts.',
      techDescription:'Activation "Developer Mode" dans module MIB via VCDS. Accès aux menus techniques cachés.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['MIB2+ ou MIB3'] },
      difficulty:'avance', timeMin:30, price:49, active:true,
      upsellIds:['opt_hidden_menu']
    },
    {
      id:'opt_speed_beep_off', name:'Désactivation bip vitesse excessive',
      description:'Supprime le signal sonore d\'avertissement de dépassement de vitesse configurable.',
      techDescription:'Adaptation dans module KI. Désactivation du "speed warning sound" ou modification du seuil.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_belt_beep']
    },
    {
      id:'opt_gps_speed', name:'Correction vitesse affichage GPS',
      description:'Synchronise la vitesse affichée sur l\'autoradio GPS avec la vitesse réelle GPS — plus précis que le compteur kilométrique.',
      techDescription:'Adaptation dans module MIB/GPS. Activation "GPS speed display" et correction offset vitesse.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['GPS / Navigation OEM'] },
      difficulty:'moyen', timeMin:20, price:29, active:true,
      upsellIds:['opt_traffic_sign']
    },
    {
      id:'opt_screen_mirror', name:'Mirroring écran activé',
      description:'Active la projection de l\'écran de votre smartphone sur l\'autoradio — compatible Android et iOS selon modèle.',
      techDescription:'Activation Smartlink/MirrorLink dans module MIB. Nécessite firmware compatible et application smartphone.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Autoradio MIB2+ avec connectivité'] },
      difficulty:'moyen', timeMin:20, price:69, active:true,
      upsellIds:['opt_carplay_wireless','opt_android_wireless']
    },
    {
      id:'opt_traffic_sign', name:'Reconnaissance des panneaux de signalisation',
      description:'Active la reconnaissance automatique des panneaux de vitesse et de limitation — affichage dans le combiné d\'instrumentation.',
      techDescription:'Activation "Traffic Sign Recognition" dans module de caméra frontale (FSA). Nécessite caméra frontale OEM.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Caméra frontale OEM'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_lane_config','opt_front_assist']
    },
    {
      id:'opt_rear_camera', name:'Caméra de recul — amélioration des guidelines',
      description:'Améliorez les lignes de guidage dynamiques de la caméra de recul — calibrage et personnalisation des trajectoires.',
      techDescription:'Calibrage et adaptation dans module RVC ou MIB. Ajustement des lignes dynamiques et statiques.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['Caméra de recul OEM'] },
      difficulty:'moyen', timeMin:25, price:59, active:true,
      upsellIds:['opt_park_assist','opt_carplay_wireless']
    },

    // ════════════════ ASSISTANCE ════════════════
    {
      id:'opt_lane_config', name:'Configuration Lane Assist (aide au maintien de voie)',
      description:'Ajustez la sensibilité et le comportement du Lane Assist — réduction des interventions intempestives, personnalisation du retour haptique.',
      techDescription:'Adaptation dans module Lane Assist (ESP/ESC ou module dédié). Paramètres de correction et seuil d\'intervention.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Lane Assist OEM'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_acc_config','opt_traffic_jam']
    },
    {
      id:'opt_acc_config', name:'Options ACC — régulateur de vitesse adaptatif',
      description:'Configurez les paramètres du régulateur adaptatif : distance minimale, comportement en ville, réponse à l\'accélération.',
      techDescription:'Adaptation dans module ACC (radar frontal). Paramètres de distance, vitesse minimale et profil de conduite.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['ACC OEM'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_traffic_jam','opt_lane_config']
    },
    {
      id:'opt_park_assist', name:'Activation Park Assist étendu',
      description:'Activez les modes de stationnement automatique supplémentaires — stationnement parallèle et perpendiculaire complet.',
      techDescription:'Adaptation dans module Einparkhilfe (EPS/ParkAssist). Activation des modes de manoeuvre supplémentaires.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Park Assist OEM','Capteurs PDC avant/arrière'] },
      difficulty:'moyen', timeMin:25, price:59, active:true,
      upsellIds:['opt_rear_camera','opt_blind_off']
    },
    {
      id:'opt_blind_off', name:'Désactivation avertissement angle mort',
      description:'Désactivez l\'avertissement de l\'assistant d\'angle mort — pour les conducteurs expérimentés qui le trouvent intrusif.',
      techDescription:'Adaptation "Side Assist" dans module radar latéral (SRA). Désactivation ou modification du seuil d\'alerte.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Side Assist OEM'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_park_assist']
    },
    {
      id:'opt_front_assist', name:'Sensibilité Front Assist (avertissement de collision)',
      description:'Modifiez la sensibilité du système de prévention de collision frontale — moins d\'alertes inutiles en conduite sportive.',
      techDescription:'Adaptation seuil d\'intervention dans module radar frontal (Front Assist / ACC). Paramètre "warning distance".',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2014, yearMax:2024, requiresEquipment:['Front Assist OEM'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_aeb','opt_acc_config']
    },
    {
      id:'opt_emergency_assist', name:'Configuration Emergency Assist',
      description:'Configurez le comportement de l\'Emergency Assist — le système qui freine d\'urgence si le conducteur est inconscient.',
      techDescription:'Adaptation dans module Emergency Assist (EA). Seuils de détection et profil de freinage paramétrable.',
      category:'assistance',
      compatible:{ models:['golf8','a3_8y','leon_4','formentor','octavia4','a4_b9','a6_c8'], platforms:['MQB Evo','MLB Evo'], yearMin:2019, yearMax:2024, requiresEquipment:['Emergency Assist OEM'] },
      difficulty:'avance', timeMin:30, price:39, active:true,
      upsellIds:['opt_front_assist']
    },
    {
      id:'opt_traffic_jam', name:'Activation Traffic Jam Assist',
      description:'Active l\'assistant embouteillages — le véhicule suit automatiquement le véhicule précédent à basse vitesse.',
      techDescription:'Activation dans module ACC + Lane Assist. Nécessite ACC + Lane Assist opérationnels et firmware compatible.',
      category:'assistance',
      compatible:{ models:['golf8','a3_8y','a4_b9','a6_c8','leon_4','formentor','octavia4'], platforms:['MQB Evo','MLB Evo'], yearMin:2019, yearMax:2024, requiresEquipment:['ACC OEM','Lane Assist OEM'] },
      difficulty:'avance', timeMin:30, price:49, active:true,
      upsellIds:['opt_acc_config','opt_lane_config']
    },
    {
      id:'opt_aeb', name:'Configuration AEB (freinage d\'urgence autonome)',
      description:'Ajustez les paramètres du système de freinage d\'urgence autonome — seuil de déclenchement et intensité de freinage.',
      techDescription:'Adaptation dans module AEB (Front Assist avancé). Paramètre de sensibilité et profil freinage d\'urgence.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['AEB / Front Assist Plus OEM'] },
      difficulty:'avance', timeMin:30, price:39, active:true,
      upsellIds:['opt_front_assist','opt_emergency_assist']
    },

    // ════════════════ PERFORMANCE ════════════════
    {
      id:'opt_startstop_off', name:'Désactivation permanente du Start/Stop',
      description:'Le système Start/Stop reste désactivé par défaut à chaque démarrage — plus besoin d\'appuyer sur le bouton manuellement.',
      techDescription:'Adaptation dans module ECM ou BCM. Mémorisation état Start/Stop = OFF au cycle d\'allumage.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['Start/Stop OEM'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_auto_hold','opt_sport_mode']
    },
    {
      id:'opt_xds', name:'Activation XDS — différentiel électronique étendu',
      description:'Active ou optimise le XDS (Cross Differential System) — améliore la tenue en courbe en freinant légèrement la roue intérieure.',
      techDescription:'Codage dans module ABS/ESC. Activation canal XDS et XDS+ selon version. Amélioration sous-virage en courbe.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'moyen', timeMin:20, price:49, active:true,
      upsellIds:['opt_esc_sport','opt_throttle']
    },
    {
      id:'opt_soundaktor_off', name:'Soundaktor désactivé — silence moteur complet',
      description:'Désactive le haut-parleur Soundaktor qui simule le son moteur dans l\'habitacle — conduite plus silencieuse.',
      techDescription:'Adaptation valeur Soundaktor = 0% dans module moteur (ECM) ou module son. Désactivation complète de l\'actuateur.',
      category:'performance',
      compatible:{ models:['golf7','golf8','polo6','a3_8v','a3_8y','leon_5f','leon_4','octavia3','octavia4'], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:['Soundaktor OEM'] },
      difficulty:'facile', timeMin:10, price:39, active:true,
      upsellIds:['opt_soundaktor_max']
    },
    {
      id:'opt_soundaktor_max', name:'Soundaktor maximum — son moteur sportif',
      description:'Amplifiez le son moteur Soundaktor dans l\'habitacle — sensation sportive accrue, son plus présent en accélération.',
      techDescription:'Adaptation valeur Soundaktor = 100% ou valeur max dans module moteur. Profil sport.',
      category:'performance',
      compatible:{ models:['golf7','golf8','polo6','a3_8v','a3_8y','leon_5f','leon_4','octavia3','octavia4'], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2012, yearMax:2024, requiresEquipment:['Soundaktor OEM'] },
      difficulty:'facile', timeMin:10, price:39, active:true,
      upsellIds:['opt_soundaktor_off','opt_exhaust_flap']
    },
    {
      id:'opt_launch', name:'Activation Launch Control',
      description:'Activez le Launch Control sur votre boîte automatique DSG — départ accéléré optimisé avec gestion du patinage.',
      techDescription:'Activation "Launch Control" dans module TCU (DSG/S-tronic). Paramétrage régime moteur et point de patinage.',
      category:'performance',
      compatible:{ models:['golf7','golf8','a3_8v','a3_8y','leon_5f','leon_4','formentor'], platforms:['MQB','MQB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['Boîte DSG / S-tronic','Moteur TSI/TFSI 150ch+'] },
      difficulty:'avance', timeMin:30, price:59, active:true,
      upsellIds:['opt_xds','opt_throttle']
    },
    {
      id:'opt_throttle', name:'Réponse accélérateur améliorée',
      description:'Réduit le temps de réponse entre la pression sur l\'accélérateur et la montée en régime — conduite plus vive et réactive.',
      techDescription:'Adaptation courbe d\'accélérateur dans module moteur (ECM). Suppression de l\'amortissement électronique en mode Normal.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'moyen', timeMin:20, price:49, active:true,
      upsellIds:['opt_sport_mode','opt_xds']
    },
    {
      id:'opt_sport_mode', name:'Mode Sport mémorisé au démarrage',
      description:'Le profil de conduite Sport est automatiquement sélectionné à chaque démarrage — direction, moteur et boîte en mode dynamique.',
      techDescription:'Adaptation "profile memory" dans module BCM ou KI. Mémorisation du profil sélectionné entre cycles d\'allumage.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2014, yearMax:2024, requiresEquipment:['Driving Profile OEM'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_startstop_off','opt_throttle']
    },
    {
      id:'opt_esc_sport', name:'ESC mode Sport étendu',
      description:'Élargit le seuil d\'intervention de l\'ESC en mode Sport — plus de liberté dans les virages sans désactiver complètement la sécurité.',
      techDescription:'Adaptation dans module ABS/ESC. Modification seuil de tolérance glissement avant intervention ESC en mode Sport.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:[] },
      difficulty:'avance', timeMin:25, price:49, active:true,
      upsellIds:['opt_xds','opt_launch']
    },
    {
      id:'opt_exhaust_flap', name:'Contrôle clapet d\'échappement',
      description:'Gérez le clapet d\'échappement indépendamment du mode de conduite — ouverture permanente pour un son plus libre.',
      techDescription:'Adaptation dans module moteur ou module clapet échappement. Activation/désactivation du contrôle automatique.',
      category:'performance',
      compatible:{ models:['golf7','golf8','a3_8v','a3_8y','a4_b9','leon_5f','leon_4','formentor'], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2013, yearMax:2024, requiresEquipment:['Clapet d\'échappement actif OEM'] },
      difficulty:'moyen', timeMin:20, price:49, active:true,
      upsellIds:['opt_soundaktor_max','opt_sport_mode']
    },
    {
      id:'opt_gearbox_sport', name:'Boîte DSG — mode sport étendu',
      description:'Modifie le comportement de la boîte DSG : montées en régime plus tardives, rétrogradages plus rapides, meilleur ressenti sportif.',
      techDescription:'Adaptation dans module TCU (DSG). Paramètres de passage de vitesse, points de coupure et agressivité en mode Sport.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0'], yearMin:2013, yearMax:2024, requiresEquipment:['Boîte DSG / S-tronic OEM'] },
      difficulty:'avance', timeMin:30, price:49, active:true,
      upsellIds:['opt_launch','opt_sport_mode']
    },
    {
      id:'opt_overboost', name:'Surpuissance temporaire — Overboost',
      description:'Active la fonction Overboost qui libère brièvement une puissance supplémentaire en accélération franche — décuplé en mode Sport.',
      techDescription:'Activation canal Overboost dans module moteur (ECM). Libération temporaire pression turbo max. selon cartographie.',
      category:'performance',
      compatible:{ models:['golf7','golf8','a3_8v','a3_8y','leon_5f','leon_4','formentor'], platforms:['MQB','MQB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Moteur TSI/TFSI avec turbo OEM'] },
      difficulty:'avance', timeMin:30, price:59, active:true,
      upsellIds:['opt_throttle','opt_launch']
    }

  ]; // end OPTIONS

  // ─────────────────────────────────────────────────────
  //  PACKS — réductions automatiques
  // ─────────────────────────────────────────────────────
  const PACKS = [
    {
      id:'pack_confort',
      name:'Pack Confort',
      description:'Les 4 options confort les plus demandées — rétroviseurs rabattables, vitres télécommande, fermeture pluie, Auto Hold.',
      optionIds:['opt_mirror_fold','opt_remote_windows','opt_rain_close','opt_auto_hold'],
      discount:0.15,
      color:'var(--blue)'
    },
    {
      id:'pack_lumiere',
      name:'Pack Lumière',
      description:'Pack éclairage complet — Coming Home, DRL personnalisés, feux de virage, ambiance intérieure.',
      optionIds:['opt_coming_home','opt_drl','opt_corner','opt_ambient'],
      discount:0.15,
      color:'var(--amber)'
    },
    {
      id:'pack_sport',
      name:'Pack Sport',
      description:'5 options performance — Start/Stop off, Mode Sport mémorisé, Soundaktor max, XDS activé, accélérateur réactif.',
      optionIds:['opt_startstop_off','opt_sport_mode','opt_soundaktor_max','opt_xds','opt_throttle'],
      discount:0.20,
      color:'var(--green)'
    }
  ];

  // ─────────────────────────────────────────────────────
  //  CATÉGORIES avec labels et icônes SVG
  // ─────────────────────────────────────────────────────
  const CATEGORIES = [
    { id:'all',         label:'Toutes',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { id:'confort',     label:'Confort',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { id:'eclairage',   label:'Éclairage',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>' },
    { id:'multimedia',  label:'Multimédia',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' },
    { id:'assistance',  label:'Assistance',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
    { id:'performance', label:'Performance',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' }
  ];

  return { BRANDS, MODELS, OPTIONS, PACKS, CATEGORIES };

})();
