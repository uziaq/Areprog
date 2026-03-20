# AREPROG — Guide de déploiement GitHub Pages

## 🔴 PROBLÈME ACTUEL

Votre site est sur **GitHub Pages**, mais certains fichiers corrigés et nouvelles pages
**n'ont pas encore été uploadés** sur votre repo GitHub.

---

## ✅ FICHIERS À UPLOADER SUR GITHUB (liste complète)

### Fichiers modifiés (à remplacer)
```
index.html
about.html
boutique.html
contact.html
conversion-e85.html
desactivation-adblue.html
desactivation-egr.html
desactivation-fap.html
faq.html
mentions-legales.html
nav.js
odis.html
optimisation-consommation.html
politique-confidentialite.html
produit.html
reprogrammation-moteur-anglet.html
reprogrammation-moteur-auxerre.html
reprogrammation-moteur-bayonne.html
reprogrammation-moteur-biarritz.html
reprogrammation-moteur-dax.html
reprogrammation-moteur-pau.html
robots.txt
shared.css
simulateur.html
sitemap.xml
stage1.html
stage2.html
tarifs.html
whatsapp-widget.js
```

### Fichiers NOUVEAUX (à ajouter pour la 1ère fois)
```
chip-tuning-pays-basque.html         ← NOUVELLE PAGE SEO
guide-reprogrammation-moteur.html    ← NOUVELLE PAGE SEO
reprogrammation-moteur-saint-jean-de-luz.html  ← NOUVELLE PAGE SEO
services.css                         ← NOUVEAU fichier CSS
seo-local.css                        ← NOUVEAU fichier CSS
```

---

## 📋 PROCÉDURE D'UPLOAD SUR GITHUB

1. Allez sur **github.com** → votre repo `areprog`
2. Cliquez **Add file → Upload files**
3. Glissez-déposez **TOUS les fichiers** de la liste ci-dessus
4. En bas, tapez dans "Commit changes" : `Mise à jour SEO + nouvelles pages`
5. Cliquez **Commit changes**
6. Attendez **1-2 minutes** → votre site est mis à jour automatiquement

---

## ⚠️ IMPORTANT — GitHub Pages vs URLs propres

GitHub Pages **ne supporte pas** les URLs sans `.html` nativement.

| URL | Fonctionne sur GitHub Pages ? |
|-----|-------------------------------|
| `areprog.fr/stage1.html` | ✅ OUI |
| `areprog.fr/stage1` | ❌ NON (404) |
| `areprog.fr/chip-tuning-pays-basque.html` | ✅ OUI |
| `areprog.fr/chip-tuning-pays-basque` | ❌ NON (404) |

**Les nouvelles pages fonctionnent avec `.html` dans l'URL.**
Les canonicals et le sitemap ont été mis à jour pour correspondre.

---

## 🚀 OPTION NETLIFY (recommandé pour les URLs propres)

Si vous souhaitez des URLs sans `.html` (ex: `areprog.fr/stage1`), migrez vers **Netlify** (gratuit) :

1. Allez sur **netlify.com** → Sign up avec votre compte GitHub
2. Cliquez **New site from Git** → sélectionnez votre repo GitHub
3. Laissez tous les paramètres par défaut → **Deploy site**
4. Dans **Domain settings** → ajoutez `areprog.fr` comme domaine custom
5. Les fichiers `_redirects` et `_headers` fonctionneront automatiquement

