# Prés Gaillard - Agent Virtuel

Application web standalone pour l'agent virtuel du gîte "Prés Gaillard" à La Bresse.

## 🎯 Caractéristiques

- ✅ Interface chat style iMessage avec design élégant
- ✅ Header vert foncé avec statut en ligne
- ✅ 8 boutons de raccourcis (disparaissent après le premier message)
- ✅ Message de bienvenue saisonnier automatique
- ✅ Textarea avec auto-resize et envoi via Enter
- ✅ Agent IA alimenté par Claude Sonnet 4
- ✅ Gestion sécurisée de la clé API (côté serveur uniquement)
- ✅ Déployable sur Netlify Drop ou Vercel

## 📁 Structure des fichiers

```
.
├── index.html                    # Application frontend (tout-en-un)
├── netlify.toml                 # Configuration Netlify
├── netlify/
│   └── functions/
│       └── chat.js              # Fonction serveur (proxy API)
└── README.md                     # Cette documentation
```

## 🚀 Déploiement sur Netlify

### Option 1 : Netlify Drop (Drag & Drop)
1. Assurez-vous que vous avez les fichiers :
   - `index.html`
   - `netlify.toml`
   - `netlify/functions/chat.js`

2. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop)
3. Glissez-déposez le dossier racine dans l'interface
4. Attendez la création du site
5. Allez dans **Site settings → Build & deploy → Environment** et ajoutez :
   - Variable : `ANTHROPIC_API_KEY`
   - Valeur : Votre clé API Anthropic

### Option 2 : Git + Netlify
1. Créez un repository Git
2. Poussez le code vers GitHub/GitLab/Bitbucket
3. Connectez-le à Netlify
4. Laissez Netlify déployer automatiquement
5. Configurez la variable d'environnement `ANTHROPIC_API_KEY`

### Option 3 : Vercel
1. Installez Vercel CLI : `npm i -g vercel`
2. Adaptez `netlify.toml` pour Vercel (renommez `netlify/functions/` en `api/`)
3. Exécutez : `vercel`

## ⚙️ Configuration

### Clé API Anthropic

**IMPORTANT** : La clé API n'est JAMAIS incluse dans le code HTML. Elle est :
- Stockée uniquement comme variable d'environnement sur Netlify
- Utilisée exclusivement par la Netlify Function côté serveur
- Jamais exposée au client

**Pour obtenir votre clé API** :
1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez un compte ou connectez-vous
3. Générez une nouvelle clé API
4. Copiez la clé
5. Ajoutez-la dans Netlify : **Site settings → Build & deploy → Environment → Edit variables**

### Personnalisation

Modifiez le `SYSTEM_PROMPT` dans `netlify/functions/chat.js` pour adapter l'agent aux spécificités réelles du gîte :
- Informations actuelles sur les tarifs
- Horaires d'accès précis
- Coordonnées d'urgence
- Services/équipements disponibles
- Politique d'annulation

## 🧪 Tests locaux

### Frontend uniquement
```bash
# Servez simplement le fichier HTML
cd /Users/antoinedementendehorne/Documents/Claude/Code
python3 -m http.server 8000
# Ouvrez http://localhost:8000
```

### Avec fonctions Netlify locales
```bash
# Installez Netlify CLI
npm install -g netlify-cli

# Lancez le serveur local
netlify dev
# Le site sera à http://localhost:8888
# Les fonctions sont à /.netlify/functions/chat
```

## 📊 Architecture

```
Frontend (index.html)
    ↓ (POST /.netlify/functions/chat)
Netlify Function (chat.js)
    ↓ (HTTPS + Clé API)
Anthropic API (Claude Sonnet 4)
    ↓
Response envoyée au client
```

## 🎨 Personnalisation du design

Le design est entièrement contrôlé par la section `<style>` dans `index.html`. Vous pouvez modifier :

- **Couleurs** : La teinte verte est `#1b5e20` (changez toutes les occurrences)
- **Police** : Modifiez `font-family` (ligne 6)
- **Taille max** : Modifiez `max-width: 500px` pour un chat plus large
- **Animations** : Ajustez les keyframes et transitions

## 🔒 Sécurité

- ✅ Clé API gérée côté serveur
- ✅ CORS configuré (adaptable)
- ✅ Pas de données sensibles en localStorage
- ✅ Pas de stockage de conversation serveur
- ✅ Messages envoyés directement à Anthropic

## 📱 Responsive

L'interface s'adapte automatiquement aux appareils mobiles et desktop. Testez avec les dimensions suivantes :
- Desktop : 500px de large
- Tablette : 768px
- Mobile : 375px

## 🐛 Dépannage

### "API key not configured"
→ Vérifiez que `ANTHROPIC_API_KEY` est défini dans les variables d'environnement Netlify

### Messages n'arrivent pas
→ Ouvrez la console (F12) et vérifiez les erreurs
→ Assurez-vous que l'URL `.netlify/functions/chat` est correcte

### Fonction Netlify ne se déploie pas
→ Assurez-vous que `netlify.toml` pointe vers `functions = "netlify/functions"`
→ Vérifiez que `chat.js` est dans `netlify/functions/chat.js`

## 📚 Ressources

- [Documentation Anthropic API](https://docs.anthropic.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview)
- [Claude Sonnet 4 Model Card](https://www.anthropic.com/models)

## 📄 Licence

À adapter selon vos besoins.
