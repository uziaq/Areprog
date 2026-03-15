# AREPROG — Guide de mise en ligne

## Ce que vous obtenez
- Site hébergé **gratuitement** sur GitHub Pages
- URL : **areprog.fr** (votre domaine)
- Mise à jour du catalogue en **1 clic** depuis `admin.html`
- Déploiement automatique en **~30 secondes** après chaque publication

---

## Étape 1 — Créer le repo GitHub

1. Connectez-vous sur [github.com](https://github.com)
2. Cliquez **New repository** (bouton vert en haut à droite)
3. Nommez-le `areprog` (ou ce que vous voulez)
4. Cochez **Public** (requis pour GitHub Pages gratuit)
5. Cliquez **Create repository**

---

## Étape 2 — Uploader les fichiers du site

Dans votre nouveau repo :

1. Cliquez **uploading an existing file** (ou **Add file → Upload files**)
2. Glissez-déposez **tous vos fichiers** :
   - `index.html`, `about.html`, `contact.html`, `faq.html`
   - `boutique.html`, `produit.html`, `confirmation.html`
   - `products.js`, `nav.js`, `shared.css`, `whatsapp-widget.js`
   - Toutes les autres pages `.html`
3. Cliquez **Commit changes**

> ⚠️ Ne mettez **pas** `admin.html` sur GitHub — gardez-le uniquement en local sur votre ordinateur.

---

## Étape 3 — Activer GitHub Pages

1. Dans votre repo, cliquez sur **Settings** (onglet en haut)
2. Dans le menu gauche, cliquez **Pages**
3. Sous **Source**, sélectionnez **Deploy from a branch**
4. Choisissez la branche **main** et le dossier **/ (root)**
5. Cliquez **Save**

Après quelques secondes, GitHub affiche l'URL de votre site :
`https://votre-username.github.io/areprog`

---

## Étape 4 — Connecter votre domaine areprog.fr

### Chez votre registrar (OVH, Gandi, Namecheap...)

Ajoutez ces enregistrements DNS :

**4 enregistrements A** (pointent vers les serveurs GitHub) :
```
Type : A    Nom : @    Valeur : 185.199.108.153
Type : A    Nom : @    Valeur : 185.199.109.153
Type : A    Nom : @    Valeur : 185.199.110.153
Type : A    Nom : @    Valeur : 185.199.111.153
```

**1 enregistrement CNAME** (pour www) :
```
Type : CNAME    Nom : www    Valeur : votre-username.github.io
```

### Sur GitHub Pages

1. Retournez dans **Settings → Pages**
2. Dans **Custom domain**, tapez `areprog.fr`
3. Cliquez **Save**
4. Cochez **Enforce HTTPS** (apparaît après quelques minutes)

> La propagation DNS prend 5 min à 48h selon votre registrar.

---

## Étape 5 — Créer votre Token GitHub (pour l'admin)

Le token permet à `admin.html` de mettre à jour `products.js` directement.

1. Allez sur [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. **Note** : `AREPROG Admin`
3. **Expiration** : choisissez `No expiration` (ou 1 an)
4. **Scopes** : cochez uniquement `repo` (accès complet aux repos)
5. Cliquez **Generate token**
6. **Copiez le token** — il n'apparaît qu'une seule fois !

---

## Étape 6 — Configurer l'admin

1. Ouvrez `admin.html` sur votre ordinateur (double-clic)
2. Cliquez **Publier sur GitHub** (bouton vert en bas de la sidebar)
3. Remplissez le formulaire :
   - **Token** : collez votre token `ghp_xxxxx`
   - **Utilisateur** : votre username GitHub
   - **Repo** : `areprog`
   - **Chemin** : `products.js`
   - **Branche** : `main`
4. Cliquez **Tester la connexion** — vous devriez voir ✓ Connexion OK
5. Cliquez **Publier maintenant**

---

## Utilisation quotidienne

```
1. Ouvrez admin.html (double-clic sur votre bureau)
2. Modifiez vos produits
3. Ctrl+S pour enregistrer
4. Cliquez "Publier sur GitHub"
5. Le site est mis à jour en 30 secondes ✓
```

---

## Structure des fichiers

```
votre-ordinateur/
└── admin.html          ← Gardez ici, ne publiez pas

github.com/votre-username/areprog/
├── index.html
├── boutique.html
├── produit.html
├── products.js         ← Mis à jour automatiquement par l'admin
├── nav.js
├── shared.css
├── confirmation.html
└── ... (toutes les autres pages)
```

---

## En cas de problème

**Le site ne s'affiche pas après activation GitHub Pages**
→ Attendez 2-3 minutes et rechargez. GitHub Pages peut prendre jusqu'à 10 min la première fois.

**Le domaine areprog.fr ne fonctionne pas**
→ La propagation DNS peut prendre jusqu'à 48h. Testez l'URL `username.github.io/areprog` en attendant.

**Erreur 401 lors de la publication**
→ Le token est invalide ou expiré. Créez-en un nouveau sur GitHub.

**Erreur 404 lors de la publication**
→ Vérifiez le nom d'utilisateur et du repo dans la config de l'admin.

**products.js publié mais la boutique n'est pas mise à jour**
→ Videz le cache du navigateur (Ctrl+Shift+R) ou attendez 1-2 minutes.
