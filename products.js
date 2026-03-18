/* AREPROG - products.js - 18/03/2026 */

const AREPROG_PRODUCTS = [];

function getProductById(id){return AREPROG_PRODUCTS.find(function(p){return p.id===id})||null}
function getProductsByCategory(cat){return AREPROG_PRODUCTS.filter(function(p){return p.category===cat})}
function getRelatedProducts(p,l){l=l||3;if(!p.relatedIds)return[];return p.relatedIds.map(getProductById).filter(Boolean).slice(0,l)}
var SHOP_CATEGORIES=[{id:"prestation",label:"Prestations"},{id:"pack",label:"Packs combines"},{id:"produit",label:"Produits physiques"},{id:"cadeau",label:"Bons cadeaux"}];