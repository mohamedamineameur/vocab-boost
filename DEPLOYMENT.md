# 🚀 Guide de Déploiement sur Render

## Configuration du fichier `render.yaml`

Le fichier `render.yaml` configure automatiquement :
- **Service web fullstack** : Node.js qui sert à la fois le backend API et le frontend React
- **Base de données** : PostgreSQL hébergée ailleurs (à configurer manuellement)

## Variables d'environnement requises

### 🔧 Service Web - À configurer manuellement dans Render Dashboard

Dans le dashboard Render, allez dans votre service web → **Environment** et ajoutez :

```bash
# Base de données (hébergée ailleurs)
DATABASE_URL=postgresql://username:password@host:port/database

# Email Configuration (Gmail)
MAIL_EMAIL=votre-email@gmail.com
MAIL_PASS=votre-mot-de-passe-app-gmail

# OpenAI API Keys
OPENAI_API_KEY=votre-clé-openai
OPENAI_WHISPER_API_KEY=votre-clé-whisper

# JWT Secret
JWT_SECRET=votre-clé-secrète-jwt-très-longue-et-sécurisée
```

**Variables automatiques** (pas besoin de les ajouter) :
- `NODE_ENV=production`
- `PORT=10000`

## Étapes de déploiement

### 1. Préparation du code
```bash
# Assurez-vous que le build fonctionne
npm run build

# Testez localement en production
NODE_ENV=production npm start
```

### 2. Déploiement sur Render
1. **Connectez votre repo GitHub** à Render
2. **Créez un nouveau Web Service** depuis `render.yaml`
3. **Configurez manuellement les variables d'environnement** dans le dashboard :
   - `DATABASE_URL`, `MAIL_EMAIL`, `MAIL_PASS`, `OPENAI_API_KEY`, `OPENAI_WHISPER_API_KEY`, `JWT_SECRET`
4. **Déployez** - Render utilisera automatiquement `render.yaml`

### 3. Configuration des variables d'environnement dans Render

#### 🔧 Service Web
1. Allez dans votre service web sur Render
2. Cliquez sur **Environment** dans le menu de gauche
3. Ajoutez ces variables une par une :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | URL de votre base PostgreSQL |
| `MAIL_EMAIL` | `votre-email@gmail.com` | Email Gmail pour l'envoi d'emails |
| `MAIL_PASS` | `votre-mot-de-passe-app` | Mot de passe d'application Gmail |
| `OPENAI_API_KEY` | `sk-...` | Clé API OpenAI pour TTS |
| `OPENAI_WHISPER_API_KEY` | `sk-...` | Clé API OpenAI pour STT |
| `JWT_SECRET` | `votre-clé-très-longue` | Clé secrète JWT (minimum 32 caractères) |

### 4. Configuration de la base de données
```bash
# Après le premier déploiement, connectez-vous au backend
# et exécutez les seeds
npm run seed
```

## URLs après déploiement

- **Application** : `https://english-learning-app.onrender.com`
- **API Health** : `https://english-learning-app.onrender.com/api/health`
- **Métriques** : `https://english-learning-app.onrender.com/metrics`

## Notes importantes

- **Plan Starter** : Gratuit mais avec limitations (sleep après inactivité)
- **Build time** : ~5-10 minutes pour le premier déploiement
- **Cold start** : ~30 secondes après inactivité (plan gratuit)
- **Base de données** : PostgreSQL 15 avec 1GB de stockage (plan starter)

## Monitoring

Les métriques Prometheus sont disponibles sur `/metrics` pour surveiller :
- Nombre de requêtes
- Temps de réponse
- Erreurs HTTP
- Utilisation mémoire

## Dépannage

### Build échoue
- Vérifiez que tous les tests passent : `npm test`
- Vérifiez les variables d'environnement
- Consultez les logs de build dans Render

### Base de données
- Vérifiez la connexion avec `DATABASE_URL`
- Exécutez les migrations si nécessaire
- Vérifiez les seeds : `npm run seed`

### Frontend ne se charge pas
- Vérifiez `VITE_API_URL` pointe vers le bon backend
- Vérifiez les CORS dans le backend
- Consultez la console du navigateur
