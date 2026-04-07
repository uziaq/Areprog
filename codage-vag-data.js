/* ═══════════════════════════════════════════
   AREPROG — VAG Coding Data v2.0
   Base de données : marques, modèles, options, packs
   Structure URL : /marque/modele
   ═══════════════════════════════════════════ */

window.VAG = (function() {

  const BRANDS = [
    { id:'vw',    name:'Volkswagen',   abbr:'VW',  color:'#1B5E9B', slug:'volkswagen' },
    { id:'audi',  name:'Audi',         abbr:'A',   color:'#BB0A14', slug:'audi' },
    { id:'seat',  name:'Seat',         abbr:'S',   color:'#FA0028', slug:'seat' },
    { id:'cupra', name:'Cupra',        abbr:'C',   color:'#C6A84B', slug:'cupra' },
    { id:'skoda', name:'Skoda',        abbr:'\u0160', color:'#4BA82E', slug:'skoda' }
  ];

  const MODELS = [

    // ══════════════════ VOLKSWAGEN ══════════════════
    { id:'golf6',         brandId:'vw',    name:'Golf 6',              code:'5K/AJ',    platform:'PQ35',     yearMin:2008, yearMax:2012, slug:'golf-6' },
    { id:'golf7',         brandId:'vw',    name:'Golf 7',              code:'5G/AU',    platform:'MQB',      yearMin:2012, yearMax:2019, slug:'golf-7' },
    { id:'golf7_facelift',brandId:'vw',    name:'Golf 7.5 (facelift)', code:'5G/AU',    platform:'MQB',      yearMin:2017, yearMax:2019, slug:'golf-7-facelift' },
    { id:'golf8',         brandId:'vw',    name:'Golf 8',              code:'CD1/5H',   platform:'MQB Evo',  yearMin:2019, yearMax:2024, slug:'golf-8' },
    { id:'golf8_gte',     brandId:'vw',    name:'Golf 8 GTE',          code:'CD1',      platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'golf-8-gte' },
    { id:'golf_variant7', brandId:'vw',    name:'Golf Variant 7',      code:'5G/BA2',   platform:'MQB',      yearMin:2013, yearMax:2020, slug:'golf-variant-7' },
    { id:'golf_variant8', brandId:'vw',    name:'Golf Variant 8',      code:'CD/BF',    platform:'MQB Evo',  yearMin:2021, yearMax:2024, slug:'golf-variant-8' },
    { id:'golf_gti7',     brandId:'vw',    name:'Golf GTI 7',          code:'5G',       platform:'MQB',      yearMin:2013, yearMax:2019, slug:'golf-gti-7' },
    { id:'golf_gti8',     brandId:'vw',    name:'Golf GTI 8',          code:'CD1',      platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'golf-gti-8' },
    { id:'golf_r7',       brandId:'vw',    name:'Golf R 7',            code:'5G',       platform:'MQB',      yearMin:2013, yearMax:2019, slug:'golf-r-7' },
    { id:'golf_r8',       brandId:'vw',    name:'Golf R 8',            code:'CD1',      platform:'MQB Evo',  yearMin:2021, yearMax:2024, slug:'golf-r-8' },
    { id:'polo5',         brandId:'vw',    name:'Polo 5',              code:'6R/6C',    platform:'PQ25',     yearMin:2009, yearMax:2017, slug:'polo-5' },
    { id:'polo6',         brandId:'vw',    name:'Polo 6',              code:'AW',       platform:'MQB-A0',   yearMin:2017, yearMax:2024, slug:'polo-6' },
    { id:'polo_gti6',     brandId:'vw',    name:'Polo GTI 6',          code:'AW',       platform:'MQB-A0',   yearMin:2018, yearMax:2024, slug:'polo-gti-6' },
    { id:'t_cross',       brandId:'vw',    name:'T-Cross',             code:'C11/BF2',  platform:'MQB-A0',   yearMin:2018, yearMax:2024, slug:'t-cross' },
    { id:'taigo',         brandId:'vw',    name:'Taigo',               code:'CS2',      platform:'MQB-A0',   yearMin:2021, yearMax:2024, slug:'taigo' },
    { id:'troc',          brandId:'vw',    name:'T-Roc',               code:'A11/AC7',  platform:'MQB',      yearMin:2017, yearMax:2024, slug:'t-roc' },
    { id:'troc_r',        brandId:'vw',    name:'T-Roc R',             code:'A11',      platform:'MQB',      yearMin:2019, yearMax:2024, slug:'t-roc-r' },
    { id:'tiguan1',       brandId:'vw',    name:'Tiguan 1',            code:'5N',       platform:'PQ35',     yearMin:2007, yearMax:2016, slug:'tiguan-1' },
    { id:'tiguan2',       brandId:'vw',    name:'Tiguan 2',            code:'AD/BW2',   platform:'MQB',      yearMin:2016, yearMax:2024, slug:'tiguan-2' },
    { id:'tiguan_allspace',brandId:'vw',   name:'Tiguan Allspace',     code:'BW2',      platform:'MQB',      yearMin:2017, yearMax:2024, slug:'tiguan-allspace' },
    { id:'touran2',       brandId:'vw',    name:'Touran 2',            code:'5T',       platform:'MQB',      yearMin:2015, yearMax:2024, slug:'touran-2' },
    { id:'passat7',       brandId:'vw',    name:'Passat 7 (B7)',       code:'36',       platform:'PQ46',     yearMin:2010, yearMax:2014, slug:'passat-7' },
    { id:'passat8',       brandId:'vw',    name:'Passat 8 (B8)',       code:'3G/B8',    platform:'MQB',      yearMin:2014, yearMax:2023, slug:'passat-8' },
    { id:'arteon',        brandId:'vw',    name:'Arteon',              code:'3H',       platform:'MQB',      yearMin:2017, yearMax:2024, slug:'arteon' },
    { id:'scirocco',      brandId:'vw',    name:'Scirocco',            code:'13E',      platform:'PQ35',     yearMin:2008, yearMax:2017, slug:'scirocco' },
    { id:'caddy5',        brandId:'vw',    name:'Caddy 5',             code:'SB',       platform:'MQB',      yearMin:2020, yearMax:2024, slug:'caddy-5' },
    { id:'multivan_t7',   brandId:'vw',    name:'Multivan T7',         code:'SH',       platform:'MQB Evo',  yearMin:2021, yearMax:2024, slug:'multivan-t7' },
    { id:'touareg3',      brandId:'vw',    name:'Touareg 3 (CR7)',     code:'CR7',      platform:'MLB Evo',  yearMin:2018, yearMax:2024, slug:'touareg-3' },
    { id:'id3',           brandId:'vw',    name:'ID.3',                code:'E11',      platform:'MEB',      yearMin:2019, yearMax:2024, slug:'id3' },
    { id:'id4',           brandId:'vw',    name:'ID.4',                code:'E21',      platform:'MEB',      yearMin:2020, yearMax:2024, slug:'id4' },
    { id:'id5',           brandId:'vw',    name:'ID.5',                code:'E39',      platform:'MEB',      yearMin:2021, yearMax:2024, slug:'id5' },
    { id:'id_buzz',       brandId:'vw',    name:'ID. Buzz',            code:'EB',       platform:'MEB',      yearMin:2022, yearMax:2024, slug:'id-buzz' },
    { id:'golf5',         brandId:'vw',    name:'Golf 5',              code:'1K',       platform:'PQ35',     yearMin:2003, yearMax:2009, slug:'golf-5' },
    { id:'up',            brandId:'vw',    name:'Up!',                 code:'AA',       platform:'PQ25',     yearMin:2011, yearMax:2023, slug:'up' },
    { id:'jetta6',        brandId:'vw',    name:'Jetta 6',             code:'162/5C',   platform:'MQB',      yearMin:2011, yearMax:2018, slug:'jetta-6' },
    { id:'sharan2',       brandId:'vw',    name:'Sharan 2',            code:'7N',       platform:'PQ46',     yearMin:2010, yearMax:2022, slug:'sharan-2' },
    { id:'touran1',       brandId:'vw',    name:'Touran 1',            code:'1T',       platform:'PQ35',     yearMin:2003, yearMax:2015, slug:'touran-1' },
    { id:'beetle',        brandId:'vw',    name:'Beetle (5C)',         code:'5C',       platform:'PQ35',     yearMin:2011, yearMax:2019, slug:'beetle' },
    { id:'golf_sportsvan',brandId:'vw',    name:'Golf Sportsvan',      code:'AM1',      platform:'MQB',      yearMin:2014, yearMax:2019, slug:'golf-sportsvan' },
    { id:'amarok',        brandId:'vw',    name:'Amarok (2H)',         code:'2H',       platform:'PQ46',     yearMin:2010, yearMax:2022, slug:'amarok' },

    // ══════════════════ AUDI ══════════════════
    { id:'a1_8x',         brandId:'audi',  name:'A1 (8X)',             code:'8X',       platform:'PQ25',     yearMin:2010, yearMax:2018, slug:'a1-8x' },
    { id:'a1_gb',         brandId:'audi',  name:'A1 (GB)',             code:'GB',       platform:'MQB-A0',   yearMin:2018, yearMax:2024, slug:'a1-gb' },
    { id:'a3_8v',         brandId:'audi',  name:'A3 8V',               code:'8V',       platform:'MQB',      yearMin:2012, yearMax:2020, slug:'a3-8v' },
    { id:'a3_8y',         brandId:'audi',  name:'A3 8Y',               code:'8Y',       platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'a3-8y' },
    { id:'s3_8v',         brandId:'audi',  name:'S3 (8V)',             code:'8V',       platform:'MQB',      yearMin:2013, yearMax:2020, slug:'s3-8v' },
    { id:'s3_8y',         brandId:'audi',  name:'S3 (8Y)',             code:'8Y',       platform:'MQB Evo',  yearMin:2021, yearMax:2024, slug:'s3-8y' },
    { id:'rs3_8v',        brandId:'audi',  name:'RS3 (8V)',            code:'8V',       platform:'MQB',      yearMin:2015, yearMax:2020, slug:'rs3-8v' },
    { id:'rs3_8y',        brandId:'audi',  name:'RS3 (8Y)',            code:'8Y',       platform:'MQB Evo',  yearMin:2021, yearMax:2024, slug:'rs3-8y' },
    { id:'tt_8s',         brandId:'audi',  name:'TT (8S)',             code:'8S/FV',    platform:'MQB',      yearMin:2014, yearMax:2023, slug:'tt-8s' },
    { id:'q2_ga',         brandId:'audi',  name:'Q2 (GA)',             code:'GA',       platform:'MQB',      yearMin:2016, yearMax:2024, slug:'q2-ga' },
    { id:'q3_1',          brandId:'audi',  name:'Q3 1e gen (8U)',      code:'8U',       platform:'PQ35',     yearMin:2011, yearMax:2018, slug:'q3-8u' },
    { id:'q3_2',          brandId:'audi',  name:'Q3 2e gen (F3)',      code:'F3',       platform:'MQB',      yearMin:2018, yearMax:2024, slug:'q3-f3' },
    { id:'a4_b9',         brandId:'audi',  name:'A4 (B9)',             code:'B9/8W',    platform:'MLB Evo',  yearMin:2015, yearMax:2024, slug:'a4-b9' },
    { id:'a5_f5',         brandId:'audi',  name:'A5 (F5)',             code:'F5/8W',    platform:'MLB Evo',  yearMin:2016, yearMax:2024, slug:'a5-f5' },
    { id:'q5_fy',         brandId:'audi',  name:'Q5 (FY)',             code:'FY/80A',   platform:'MLB Evo',  yearMin:2017, yearMax:2024, slug:'q5-fy' },
    { id:'a6_c8',         brandId:'audi',  name:'A6 (C8)',             code:'C8/4A',    platform:'MLB Evo',  yearMin:2018, yearMax:2024, slug:'a6-c8' },
    { id:'a7_4k',         brandId:'audi',  name:'A7 (4K)',             code:'4K/F2',    platform:'MLB Evo',  yearMin:2018, yearMax:2024, slug:'a7-4k' },
    { id:'q7_4m',         brandId:'audi',  name:'Q7 (4M)',             code:'4M',       platform:'MLB Evo',  yearMin:2015, yearMax:2024, slug:'q7-4m' },
    { id:'q8_4m',         brandId:'audi',  name:'Q8 (4M)',             code:'4M/F1',    platform:'MLB Evo',  yearMin:2018, yearMax:2024, slug:'q8-4m' },
    { id:'q4_etron',      brandId:'audi',  name:'Q4 e-tron',           code:'F4E',      platform:'MEB',      yearMin:2021, yearMax:2024, slug:'q4-etron' },
    { id:'a3_8p',         brandId:'audi',  name:'A3 (8P)',             code:'8P',       platform:'PQ35',     yearMin:2003, yearMax:2013, slug:'a3-8p' },
    { id:'s3_8p',         brandId:'audi',  name:'S3 (8P)',             code:'8P',       platform:'PQ35',     yearMin:2006, yearMax:2013, slug:'s3-8p' },
    { id:'a4_b8',         brandId:'audi',  name:'A4 (B8)',             code:'8K',       platform:'MLB',      yearMin:2007, yearMax:2015, slug:'a4-b8' },
    { id:'a5_8t',         brandId:'audi',  name:'A5 (8T)',             code:'8T',       platform:'MLB',      yearMin:2007, yearMax:2017, slug:'a5-8t' },
    { id:'q5_8r',         brandId:'audi',  name:'Q5 1e gen (8R)',      code:'8R',       platform:'MLB',      yearMin:2008, yearMax:2017, slug:'q5-8r' },
    { id:'a6_c7',         brandId:'audi',  name:'A6 (C7)',             code:'4G',       platform:'MLB',      yearMin:2011, yearMax:2018, slug:'a6-c7' },
    { id:'a8_d5',         brandId:'audi',  name:'A8 (D5)',             code:'4N',       platform:'MLB Evo',  yearMin:2017, yearMax:2024, slug:'a8-d5' },
    { id:'etron_ge',      brandId:'audi',  name:'e-tron (GE)',         code:'GE',       platform:'MEB',      yearMin:2018, yearMax:2023, slug:'etron' },
    { id:'sq5_fy',        brandId:'audi',  name:'SQ5 (FY)',            code:'FY',       platform:'MLB Evo',  yearMin:2017, yearMax:2024, slug:'sq5-fy' },

    // ══════════════════ SEAT ══════════════════
    { id:'ibiza_6j',      brandId:'seat',  name:'Ibiza 6J',            code:'6J',       platform:'PQ25',     yearMin:2008, yearMax:2017, slug:'ibiza-6j' },
    { id:'ibiza_kj',      brandId:'seat',  name:'Ibiza 6F (KJ)',       code:'KJ',       platform:'MQB-A0',   yearMin:2017, yearMax:2024, slug:'ibiza-kj' },
    { id:'arona',         brandId:'seat',  name:'Arona',               code:'KJ',       platform:'MQB-A0',   yearMin:2017, yearMax:2024, slug:'arona' },
    { id:'leon_5f',       brandId:'seat',  name:'Leon 5F',             code:'5F',       platform:'MQB',      yearMin:2012, yearMax:2020, slug:'leon-5f' },
    { id:'leon_4',        brandId:'seat',  name:'Leon 4 (KL)',         code:'KL',       platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'leon-4' },
    { id:'ateca',         brandId:'seat',  name:'Ateca',               code:'KH/5FP',   platform:'MQB',      yearMin:2016, yearMax:2024, slug:'ateca' },
    { id:'tarraco',       brandId:'seat',  name:'Tarraco',             code:'KN2',      platform:'MQB',      yearMin:2018, yearMax:2024, slug:'tarraco' },
    { id:'alhambra',      brandId:'seat',  name:'Alhambra 2',          code:'7N',       platform:'PQ46',     yearMin:2010, yearMax:2020, slug:'alhambra' },
    { id:'altea',         brandId:'seat',  name:'Altea / XL (5P)',     code:'5P',       platform:'PQ35',     yearMin:2004, yearMax:2015, slug:'altea' },
    { id:'toledo4',       brandId:'seat',  name:'Toledo 4 (KG)',       code:'KG',       platform:'MQB-A0',   yearMin:2013, yearMax:2019, slug:'toledo-4' },
    { id:'mii',           brandId:'seat',  name:'Mii',                 code:'AA',       platform:'PQ25',     yearMin:2011, yearMax:2021, slug:'mii' },

    // ══════════════════ CUPRA ══════════════════
    { id:'cupra_leon',    brandId:'cupra', name:'Cupra Leon',          code:'KL',       platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'leon' },
    { id:'formentor',     brandId:'cupra', name:'Cupra Formentor',     code:'KM',       platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'formentor' },
    { id:'cupra_ateca',   brandId:'cupra', name:'Cupra Ateca',         code:'KH',       platform:'MQB',      yearMin:2016, yearMax:2024, slug:'ateca' },
    { id:'born',          brandId:'cupra', name:'Cupra Born',          code:'BZ1',      platform:'MEB',      yearMin:2021, yearMax:2024, slug:'born' },
    { id:'tavascan',      brandId:'cupra', name:'Cupra Tavascan',      code:'BZ2',      platform:'MEB',      yearMin:2024, yearMax:2024, slug:'tavascan' },
    { id:'terramar',      brandId:'cupra', name:'Cupra Terramar',      code:'KQ',       platform:'MQB Evo',  yearMin:2024, yearMax:2025, slug:'terramar' },

    // ══════════════════ SKODA ══════════════════
    { id:'fabia3',        brandId:'skoda', name:'Fabia 3 (NJ)',        code:'NJ',       platform:'MQB-A0',   yearMin:2014, yearMax:2021, slug:'fabia-3' },
    { id:'fabia4',        brandId:'skoda', name:'Fabia 4 (PJ)',        code:'PJ',       platform:'MQB-A0',   yearMin:2021, yearMax:2024, slug:'fabia-4' },
    { id:'scala',         brandId:'skoda', name:'Scala',               code:'NW',       platform:'MQB-A0',   yearMin:2018, yearMax:2024, slug:'scala' },
    { id:'kamiq',         brandId:'skoda', name:'Kamiq',               code:'NW',       platform:'MQB-A0',   yearMin:2019, yearMax:2024, slug:'kamiq' },
    { id:'rapid',         brandId:'skoda', name:'Rapid (NH)',          code:'NH',       platform:'PQ25',     yearMin:2012, yearMax:2019, slug:'rapid' },
    { id:'octavia3',      brandId:'skoda', name:'Octavia 3 (5E)',      code:'5E',       platform:'MQB',      yearMin:2012, yearMax:2020, slug:'octavia-3' },
    { id:'octavia4',      brandId:'skoda', name:'Octavia 4 (NX5)',     code:'NX5',      platform:'MQB Evo',  yearMin:2020, yearMax:2024, slug:'octavia-4' },
    { id:'superb3',       brandId:'skoda', name:'Superb 3 (3V)',       code:'3V/NP',    platform:'MQB',      yearMin:2015, yearMax:2023, slug:'superb-3' },
    { id:'superb4',       brandId:'skoda', name:'Superb 4',            code:'B9',       platform:'MQB Evo',  yearMin:2024, yearMax:2024, slug:'superb-4' },
    { id:'karoq',         brandId:'skoda', name:'Karoq',               code:'NU7',      platform:'MQB',      yearMin:2017, yearMax:2024, slug:'karoq' },
    { id:'kodiaq',        brandId:'skoda', name:'Kodiaq',              code:'NS7',      platform:'MQB',      yearMin:2016, yearMax:2024, slug:'kodiaq' },
    { id:'kodiaq2',       brandId:'skoda', name:'Kodiaq 2',            code:'NS9',      platform:'MQB Evo',  yearMin:2023, yearMax:2024, slug:'kodiaq-2' },
    { id:'enyaq',         brandId:'skoda', name:'Enyaq',               code:'NX3',      platform:'MEB',      yearMin:2020, yearMax:2024, slug:'enyaq' },
    { id:'fabia2',        brandId:'skoda', name:'Fabia 2 (5J)',        code:'5J',       platform:'PQ25',     yearMin:2006, yearMax:2014, slug:'fabia-2' },
    { id:'yeti',          brandId:'skoda', name:'Yeti (5L)',           code:'5L',       platform:'PQ35',     yearMin:2009, yearMax:2017, slug:'yeti' },
    { id:'citigo',        brandId:'skoda', name:'Citigo',              code:'NH',       platform:'PQ25',     yearMin:2011, yearMax:2019, slug:'citigo' },
    { id:'kodiaq_rs',     brandId:'skoda', name:'Kodiaq RS',           code:'NS7',      platform:'MQB',      yearMin:2018, yearMax:2023, slug:'kodiaq-rs' },
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
    },

    // ════════════════ OPTIONS PQ35 / PQ25 (anciens modèles) ════════════════
    {
      id:'opt_pq35_mirror_fold', name:'Rétroviseurs rabattables via télécommande',
      description:'Repliez vos rétroviseurs automatiquement en verrouillant le véhicule.',
      techDescription:'Module 09 — Long Coding. Bit 7 du byte 0 = 1. Compatible Golf 6, Tiguan 1, A3 8P.',
      category:'confort',
      compatible:{ models:[], platforms:['PQ35','PQ46'], yearMin:2005, yearMax:2016, requiresEquipment:['Rétroviseurs électriques rabattables'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_alarm_horn','opt_pq35_us_lights']
    },
    {
      id:'opt_pq35_alarm_horn', name:'Alarme silencieuse (sans klaxon)',
      description:'L\'alarme se déclenche sans le coup de klaxon — idéal la nuit en résidence.',
      techDescription:'Module 46 ou 09 — désactivation du klaxon lors du déclenchement alarme.',
      category:'confort',
      compatible:{ models:[], platforms:['PQ35','PQ25','PQ46'], yearMin:2002, yearMax:2016, requiresEquipment:['Alarme OEM'] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_pq35_mirror_fold']
    },
    {
      id:'opt_pq35_belt_beep', name:'Désactivation bip ceinture',
      description:'Supprimez le bip de rappel de ceinture (pour l\'atelier ou les manœuvres).',
      techDescription:'Module 17 — Instruments. Long Coding byte 0.',
      category:'confort',
      compatible:{ models:[], platforms:['PQ35','PQ25','PQ46'], yearMin:2002, yearMax:2018, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:[]
    },
    {
      id:'opt_pq35_us_lights', name:'Activation feux US (clignotants orange)',
      description:'Active les répétiteurs de clignotants orange sur les rétroviseurs (norme US).',
      techDescription:'Module 09 ou 52 — Bit clignotants US. Valable sur Golf 5/6, Tiguan 1, A3 8P.',
      category:'eclairage',
      compatible:{ models:[], platforms:['PQ35','PQ25','PQ46'], yearMin:2004, yearMax:2018, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_coming_home']
    },
    {
      id:'opt_pq35_coming_home', name:'Coming Home / Leaving Home',
      description:'Les phares restent allumés quelques secondes après fermeture du véhicule.',
      techDescription:'Module 09 — Lumières de sortie/entrée. Durée paramétrable en adaptation.',
      category:'eclairage',
      compatible:{ models:[], platforms:['PQ35','PQ25','PQ46'], yearMin:2004, yearMax:2018, requiresEquipment:['Phares automatiques ou xénons'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_us_lights']
    },
    {
      id:'opt_pq35_video_motion', name:'Vidéo en roulant (DVD / TV)',
      description:'Déverrouillez la lecture vidéo/DVD sur l\'autoradio pendant que le véhicule est en mouvement.',
      techDescription:'Module 5F — Autoradio. Adaptation canal 36 — valeur 3. Compatible RNS 510/315.',
      category:'multimedia',
      compatible:{ models:[], platforms:['PQ35','PQ46'], yearMin:2004, yearMax:2016, requiresEquipment:['RNS 510 ou RNS 315'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_hidden_menu']
    },
    {
      id:'opt_pq35_hidden_menu', name:'Menu caché autoradio RNS/RCD',
      description:'Accédez au menu de service de votre autoradio d\'origine pour des réglages avancés.',
      techDescription:'Module 5F — Adaptation. Green-menu activation via Long Coding.',
      category:'multimedia',
      compatible:{ models:[], platforms:['PQ35','PQ25','PQ46'], yearMin:2004, yearMax:2018, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:[]
    },
    {
      id:'opt_pq35_startstop', name:'Désactivation Start/Stop permanent',
      description:'Le système Start/Stop reste désactivé à chaque démarrage sans manipulation.',
      techDescription:'Module 17 ou ECO module — Long coding bit désactivation auto SSM.',
      category:'performance',
      compatible:{ models:[], platforms:['PQ35'], yearMin:2011, yearMax:2016, requiresEquipment:['Start/Stop OEM'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:[]
    },
    {
      id:'opt_pq35_dsg_coast', name:'Mode roue libre boîte DSG (Coast)',
      description:'La boîte DSG passe au point mort à faible charge pour réduire la consommation.',
      techDescription:'Module 02 — Boîte automatique. Activation coast-mode via Long Coding.',
      category:'performance',
      compatible:{ models:[], platforms:['PQ35','PQ46'], yearMin:2008, yearMax:2018, requiresEquipment:['Boîte DSG/S-Tronic'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:[]
    },

    // ════════════════ OPTIONS MEB (électriques) ════════════════
    {
      id:'opt_meb_one_pedal', name:'One-Pedal Driving — niveau récupération maximal',
      description:'Augmentez le niveau de récupération d\'énergie au freinage pour une conduite à une pédale.',
      techDescription:'Module 08 — Climatisation/énergie. Adaptation niveau B régénération max.',
      category:'performance',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_meb_battery_display']
    },
    {
      id:'opt_meb_battery_display', name:'Affichage batterie en pourcentage',
      description:'Affichez le niveau de charge en % directement sur le compteur de bord.',
      techDescription:'Module 17 — Virtual Cockpit. Long Coding activation batterie %.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_meb_one_pedal']
    },
    {
      id:'opt_meb_charging_sound', name:'Son de charge personnalisé',
      description:'Modifiez le son émis lors du branchement sur borne de charge.',
      techDescription:'Module 77 — son de charge. Adaptation valeur souhaitée.',
      category:'confort',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:[]
    },
    {
      id:'opt_meb_range_mode', name:'Mode économie d\'énergie personnalisé',
      description:'Configurez le profil de conduite éco pour maximiser l\'autonomie réelle.',
      techDescription:'Module 08 — Gestion énergie. Profil éco personnalisé.',
      category:'performance',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:[] },
      difficulty:'moyen', timeMin:20, price:29, active:true,
      upsellIds:['opt_meb_one_pedal']
    },
    {
      id:'opt_meb_ambient_light', name:'Ambiance intérieure étendue',
      description:'Activez les zones lumineuses supplémentaires de l\'habitacle (si câblé).',
      techDescription:'Module 0A (système d\'ambiance). Long coding zones supplémentaires.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:['Éclairage ambiance OEM'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:[]
    },
    {
      id:'opt_meb_acoustic_prot', name:'Désactivation alerte sonore piéton (AVAS)',
      description:'Supprimez le son artificiel émis à basse vitesse pour les piétons (zones privées).',
      techDescription:'Module AVAS (système son piéton). Adaptation désactivation.',
      category:'performance',
      compatible:{ models:[], platforms:['MEB'], yearMin:2019, yearMax:2024, requiresEquipment:[] },
      difficulty:'avance', timeMin:30, price:49, active:true,
      upsellIds:[]
    },

    // ════════════════ OPTIONS SUPPLEMENTAIRES MQB/MQB Evo ════════════════
    {
      id:'opt_lap_timer', name:'Chronomètre (Lap Timer) dans le cockpit',
      description:'Activez le chronomètre de performances directement sur votre tableau de bord.',
      techDescription:'Module 17 — Virtual Cockpit ou MFD. Activation lap timer via Long Coding.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB','MQB Evo'], yearMin:2014, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_launch','opt_overboost']
    },
    {
      id:'opt_battery_display', name:'Affichage tension batterie 12V',
      description:'Suivez la tension de votre batterie en temps réel sur le MFD.',
      techDescription:'Module 17 — MFD. Activation affichage tension auxiliaire.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:[]
    },
    {
      id:'opt_mirror_tilt_reverse', name:'Rétroviseur côté passager inclinable en marche arrière',
      description:'Le rétroviseur droit s\'incline automatiquement vers le bas lors des manœuvres de recul.',
      techDescription:'Module 09 — Long Coding bit inclinaison rétro passager en marche arrière.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo','PQ35','PQ46'], yearMin:2008, yearMax:2024, requiresEquipment:['Rétroviseurs électriques'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_mirror_fold']
    },
    {
      id:'opt_virtual_cockpit_style', name:'Style d\'affichage Virtual Cockpit personnalisé',
      description:'Changez la mise en page de votre compteur numérique (classique, sport, infotainment).',
      techDescription:'Module 17 — Virtual Cockpit. Long coding style d\'affichage et disposition.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Virtual Cockpit OEM'] },
      difficulty:'facile', timeMin:15, price:39, active:true,
      upsellIds:['opt_lap_timer']
    },
    {
      id:'opt_drl_brake_mode', name:'DRL — extinction à l\'arrêt (frein)',
      description:'Les feux de jour s\'éteignent automatiquement quand vous appuyez sur la pédale de frein à l\'arrêt.',
      techDescription:'Module 09 — Long Coding extinction DRL frein/parking.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['DRL LED'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_drl']
    },
    {
      id:'opt_easy_entry', name:'Easy Entry — recul siège conducteur à l\'ouverture de la porte',
      description:'Le siège recule automatiquement quand vous ouvrez la porte pour faciliter la sortie.',
      techDescription:'Module 52 — Siège conducteur. Activation easy-entry via Long Coding.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Siège électrique conducteur'] },
      difficulty:'facile', timeMin:20, price:39, active:true,
      upsellIds:['opt_seat_heat']
    },
    {
      id:'opt_hill_start_assist', name:'Aide au démarrage en côte — seuil ajusté',
      description:'Configurez la sensibilité de l\'aide au démarrage en côte pour un démarrage plus fluide.',
      techDescription:'Module 03 — ABS/ESP. Adaptation seuil HSA.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:[]
    },
    {
      id:'opt_tyre_pressure_display', name:'Affichage pression des pneus en temps réel',
      description:'Visualisez la pression de chaque pneu individuellement sur le MFD.',
      techDescription:'Module 65 — Monitoring pression pneus. Activation affichage détaillé.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Capteurs TPMS directs OEM'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:[]
    },
    {
      id:'opt_trunk_logo_light', name:'Éclairage coffre via télécommande',
      description:'Allumez l\'éclairage du coffre depuis la télécommande avant de l\'ouvrir.',
      techDescription:'Module 09 — Long Coding éclairage coffre télécommande.',
      category:'eclairage',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:[]
    },
    {
      id:'opt_exhaust_sound_sport', name:'Son d\'échappement Sport (OPF bypass simulation)',
      description:'Optimisez la cartographie du soundaktor pour un son plus présent à froid.',
      techDescription:'Module 01 ou 08 — Adaptation son moteur / OPF flap.',
      category:'performance',
      compatible:{ models:[], platforms:['MQB Evo'], yearMin:2019, yearMax:2024, requiresEquipment:['Moteur TSI/TDI avec OPF'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_soundaktor_max']
    },


    // ════════════════ OPTIONS SUPPLEMENTAIRES (toutes plateformes) ════════════════
    {
      id:'opt_kessy', name:'Activation KESSY — acc\u00e8s mains libres',
      description:'Activez la fonction d\'acc\u00e8s mains libres si votre v\u00e9hicule est pr\u00e9-c\u00e2bl\u00e9 sans l\'avoir command\u00e9e en option.',
      techDescription:'Module 46 ou 09 — Long Coding activation KESSY. N\u00e9cessite poign\u00e9es c\u00e2bl\u00e9es et antennes.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Poign\u00e9es KESSY c\u00e2bl\u00e9es'] },
      difficulty:'moyen', timeMin:25, price:59, active:true,
      upsellIds:['opt_mirror_fold','opt_confort_entry']
    },
    {
      id:'opt_pdc_beep_off', name:'D\u00e9sactivation bip PDC en man\u0153uvre lente',
      description:'Supprimez le signal sonore des capteurs de recul lors des man\u0153uvres \u00e0 tr\u00e8s faible allure — discr\u00e9tion en stationnement.',
      techDescription:'Module 76 — Einparkhilfe. Adaptation seuil d\u00e9clenchement ou d\u00e9sactivation son PDC.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo','PQ35','PQ46'], yearMin:2007, yearMax:2024, requiresEquipment:['PDC OEM'] },
      difficulty:'facile', timeMin:10, price:19, active:true,
      upsellIds:['opt_park_assist']
    },
    {
      id:'opt_seat_memory', name:'M\u00e9morisation position si\u00e8ge conducteur',
      description:'Activez la m\u00e9morisation de position si\u00e8ge et r\u00e9troviseurs pour plusieurs profils conducteur.',
      techDescription:'Module 52 — Si\u00e8ge. Long Coding activation m\u00e9moire position (si c\u00e2bl\u00e9).',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2014, yearMax:2024, requiresEquipment:['Si\u00e8ge \u00e9lectrique OEM'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_easy_entry','opt_seat_heat']
    },
    {
      id:'opt_clim_auto', name:'Climatisation — m\u00e9morisation des r\u00e9glages',
      description:'M\u00e9morisez la temp\u00e9rature et la ventilation entre les d\u00e9marrages — votre confort pr\u00e9f\u00e9r\u00e9 d\u00e8s le premier instant.',
      techDescription:'Module 08 — Climatronic. Adaptation m\u00e9morisation profil utilisateur.',
      category:'confort',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:['Climatisation automatique OEM'] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_seat_heat']
    },
    {
      id:'opt_speedlimiter', name:'Limiteur de vitesse — activation et configuration',
      description:'Activez le limiteur de vitesse et r\u00e9glez le seuil d\'alerte selon vos pr\u00e9f\u00e9rences.',
      techDescription:'Module 17 — Instrumentation. Activation Speed Limiter et seuil via adaptation.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MQB-A0','MLB Evo'], yearMin:2012, yearMax:2024, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_acc_config']
    },
    {
      id:'opt_trailer_assist', name:'Aide au recul remorque (Trailer Assist)',
      description:'Activez l\'assistance au recul de remorque — le v\u00e9hicule g\u00e8re la direction lors des man\u0153uvres arri\u00e8re.',
      techDescription:'Module 76 — Einparkhilfe. Activation Trailer Assist via Long Coding + adaptation.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Attelage \u00e9lectrique OEM','Cam\u00e9ra de recul'] },
      difficulty:'avance', timeMin:30, price:59, active:true,
      upsellIds:['opt_park_assist','opt_rear_camera']
    },
    {
      id:'opt_off_road', name:'Mode Offroad / Terrain — activation',
      description:'D\u00e9bloquez le mode conduite tout-terrain avec r\u00e9partition de couple optimis\u00e9e et contr\u00f4le de descente.',
      techDescription:'Module 09 — Long Coding activation profil Offroad. Adaptation r\u00e9partition couple 4Motion.',
      category:'performance',
      compatible:{ models:['tiguan2','tiguan_allspace','touareg3','q7_4m','q8_4m','kodiaq','kodiaq2'], platforms:['MQB','MLB Evo'], yearMin:2016, yearMax:2024, requiresEquipment:['4Motion / Quattro OEM'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_sport_mode']
    },
    {
      id:'opt_acc_stop_go', name:'ACC Stop & Go — arr\u00eat complet et reprise',
      description:'Activez la fonction Stop & Go de l\'ACC permettant un arr\u00eat complet suivi d\'une reprise automatique sans toucher la p\u00e9dale.',
      techDescription:'Module ACC. Long Coding activation Stop & Go. N\u00e9cessite ACC + PDC avant actifs.',
      category:'assistance',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2016, yearMax:2024, requiresEquipment:['ACC OEM','PDC avant'] },
      difficulty:'moyen', timeMin:20, price:39, active:true,
      upsellIds:['opt_traffic_jam','opt_acc_config']
    },
    {
      id:'opt_virtual_cockpit_activate', name:'Activation Virtual Cockpit (d\u00e9blocage logiciel)',
      description:'D\u00e9bloquez et configurez le Virtual Cockpit si votre v\u00e9hicule est pr\u00e9-\u00e9quip\u00e9 — \u00e9vitez le retrofit mat\u00e9riel.',
      techDescription:'Module 17 — Instrumentation. Long Coding activation VC si c\u00e2bl\u00e9. N\u00e9cessite v\u00e9rification pr\u00e9alable.',
      category:'multimedia',
      compatible:{ models:[], platforms:['MQB','MQB Evo','MLB Evo'], yearMin:2015, yearMax:2024, requiresEquipment:['Virtual Cockpit c\u00e2bl\u00e9'] },
      difficulty:'moyen', timeMin:25, price:49, active:true,
      upsellIds:['opt_virtual_cockpit_style']
    },
    {
      id:'opt_night_vision', name:'Activation Night Vision (vision nocturne)',
      description:'Activez et calibrez la cam\u00e9ra thermique de vision nocturne sur les mod\u00e8les MLB haut de gamme.',
      techDescription:'Module NV (Night Vision). Activation et calibrage via ODIS/VCDS sur mod\u00e8les \u00e9quip\u00e9s.',
      category:'assistance',
      compatible:{ models:['a6_c8','a7_4k','q7_4m','q8_4m','touareg3','a8_d5'], platforms:['MLB Evo'], yearMin:2018, yearMax:2024, requiresEquipment:['Night Vision OEM'] },
      difficulty:'avance', timeMin:30, price:69, active:true,
      upsellIds:['opt_acc_config']
    },
    {
      id:'opt_pq35_gra', name:'R\u00e9gulateur de vitesse — activation logicielle (PQ35)',
      description:'Activez le r\u00e9gulateur de vitesse par codage si votre v\u00e9hicule est c\u00e2bl\u00e9 mais non activ\u00e9 en usine.',
      techDescription:'Module 09 — Long Coding GRA bit. Activation sans mat\u00e9riel suppl\u00e9mentaire si c\u00e2bl\u00e9.',
      category:'performance',
      compatible:{ models:[], platforms:['PQ35','PQ46'], yearMin:2005, yearMax:2016, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_mirror_fold']
    },
    {
      id:'opt_pq35_remote_windows', name:'Commande vitres via t\u00e9l\u00e9commande (PQ35)',
      description:'Maintenez le bouton de la t\u00e9l\u00e9commande pour ouvrir ou fermer toutes les vitres \u00e0 distance.',
      techDescription:'Module 09 — Long Coding activation commande fen\u00eatres distance.',
      category:'confort',
      compatible:{ models:[], platforms:['PQ35','PQ46'], yearMin:2005, yearMax:2016, requiresEquipment:[] },
      difficulty:'facile', timeMin:15, price:29, active:true,
      upsellIds:['opt_pq35_mirror_fold']
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
