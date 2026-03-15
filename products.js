/* AREPROG - products.js - 16/03/2026 */

const AREPROG_PRODUCTS = [
  {
    "id": "stage1",
    "slug": "stage1",
    "category": "prestation",
    "name": "Stage 1",
    "tagline": "Libérez le potentiel caché de votre moteur",
    "badge": "Populaire",
    "badgeStyle": "popular",
    "icon": "⚡",
    "price": 300,
    "priceLabel": "à partir de",
    "priceUnit": "Devis confirmé sous 24h",
    "stripeLink": "https://buy.stripe.com/VOTRE_LIEN_STAGE1",
    "featured": true,
    "variants": [
      {
        "label": "Diesel",
        "price": 300
      },
      {
        "label": "Essence",
        "price": 320
      }
    ],
    "shortDesc": "Optimisation complète de la cartographie moteur sans modification mécanique. Gains garantis en puissance et couple.",
    "fullDesc": "La reprogrammation Stage 1 consiste à modifier les paramètres du calculateur moteur (ECU) pour optimiser la courbe de puissance, le couple et la consommation dans les limites mécaniques d'origine. Sans aucune pièce à changer — uniquement logiciel.",
    "benefits": [
      {
        "icon": "⚡",
        "label": "+15 à +30% de puissance",
        "desc": "Gains mesurables sur banc de puissance"
      },
      {
        "icon": "🔩",
        "label": "+20 à +40% de couple",
        "desc": "Reprise et souplesse moteur améliorées"
      },
      {
        "icon": "♻️",
        "label": "100% réversible",
        "desc": "Fichier d'origine conservé, retour à tout moment"
      },
      {
        "icon": "🛡️",
        "label": "Garantie 2 ans",
        "desc": "Sur la prestation et la cartographie"
      }
    ],
    "features": [
      "+15 à +30% de puissance",
      "Garantie 2 ans — 100% réversible",
      "Diagnostic inclus avant intervention"
    ],
    "process": [
      {
        "step": "01",
        "title": "Diagnostic",
        "desc": "Lecture des défauts moteur, contrôle de l'état général du véhicule avant intervention."
      },
      {
        "step": "02",
        "title": "Lecture ECU",
        "desc": "Extraction de la cartographie d'origine via OBD ou en Boot mode si nécessaire."
      },
      {
        "step": "03",
        "title": "Flashage",
        "desc": "Écriture du nouveau fichier optimisé directement dans le calculateur."
      },
      {
        "step": "04",
        "title": "Validation",
        "desc": "Test sur route avec datalogger. Contrôle de tous les paramètres en charge."
      }
    ],
    "faq": [
      {
        "q": "Est-ce que le Stage 1 risque d'endommager mon moteur ?",
        "a": "Un Stage 1 correctement réalisé reste dans les tolérances mécaniques d'origine. Les constructeurs dimensionnent leurs moteurs avec une marge significative. On travaille dans cet espace. Diagnostic complet avant chaque intervention."
      },
      {
        "q": "Ma garantie constructeur est-elle affectée ?",
        "a": "La reprogrammation peut être détectée lors d'un passage en concession. Notre intervention étant 100% réversible, il suffit de repasser au fichier d'origine avant. On conserve votre stock et le remet à tout moment."
      },
      {
        "q": "Les gains annoncés sont-ils garantis ?",
        "a": "Les pourcentages sont des moyennes constatées. Les gains réels dépendent de l'état du moteur et du carburant. Ce qui est garanti : une amélioration mesurable. Si le résultat ne convient pas, on ajuste ou on revient à l'origine."
      },
      {
        "q": "Combien de temps dure l'intervention ?",
        "a": "Entre 45 min et 1h30 : 15-20 min de diagnostic, 20-45 min de flashage, 15-20 min de validation. Certains calculateurs nécessitent jusqu'à 2h30."
      }
    ],
    "relatedIds": [
      "stage2",
      "pack-s1-egr",
      "pack-triple"
    ],
    "seoTitle": "Stage 1 — Reprogrammation moteur AREPROG",
    "seoDesc": "Reprogrammation moteur Stage 1 à domicile. +15 à +30% de puissance, garantie 2 ans, 100% réversible. Devis gratuit sous 24h.",
    "active": true
  }
];

function getProductById(id){return AREPROG_PRODUCTS.find(function(p){return p.id===id})||null}
function getProductsByCategory(cat){return AREPROG_PRODUCTS.filter(function(p){return p.category===cat})}
function getRelatedProducts(p,l){l=l||3;if(!p.relatedIds)return[];return p.relatedIds.map(getProductById).filter(Boolean).slice(0,l)}
var SHOP_CATEGORIES=[{id:"prestation",label:"Prestations"},{id:"pack",label:"Packs combines"},{id:"produit",label:"Produits physiques"},{id:"cadeau",label:"Bons cadeaux"}];