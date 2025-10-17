# 🛠️ Commandes Utiles - VocabBoost Client

## 📦 Installation et Configuration

### Installation des Dépendances
```bash
# Installation standard
npm install

# Installation avec force (en cas de conflits)
npm install --force

# Nettoyage et réinstallation
rm -rf node_modules package-lock.json
npm install
```

### Configuration de l'Environnement
```bash
# Créer le fichier .env
touch .env

# Éditer le fichier .env
nano .env
# ou
code .env
```

**Contenu du fichier .env** :
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VocabBoost
```

## 🚀 Développement

### Lancer le Serveur de Développement
```bash
# Mode développement standard
npm run dev

# Mode développement avec host public
npm run dev -- --host

# Mode développement avec port spécifique
npm run dev -- --port 3000
```

### Build de Production
```bash
# Build standard
npm run build

# Build avec analyse du bundle
npm run build -- --analyze

# Build avec mode watch
npm run build -- --watch
```

### Prévisualisation
```bash
# Prévisualiser le build de production
npm run preview

# Prévisualiser avec port spécifique
npm run preview -- --port 4173
```

## 🧪 Tests et Qualité

### Linting
```bash
# Lancer ESLint
npm run lint

# Linter avec auto-fix
npm run lint -- --fix

# Linter un fichier spécifique
npm run lint -- src/pages/HomePage.tsx
```

### Tests
```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests avec verbose
npm test -- --verbose
```

### Vérification TypeScript
```bash
# Vérifier les types
npx tsc --noEmit

# Watch mode pour les types
npx tsc --noEmit --watch
```

## 🧹 Nettoyage

### Nettoyer les Caches
```bash
# Nettoyer node_modules
rm -rf node_modules

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Vite
rm -rf node_modules/.vite

# Nettoyer le build
rm -rf dist
```

### Réinitialiser Complètement
```bash
# Script de nettoyage complet
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build
```

## 📊 Analyse et Performance

### Analyse du Bundle
```bash
# Installer rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer

# Build avec analyse
npm run build -- --analyze
```

### Audit des Dépendances
```bash
# Audit npm
npm audit

# Audit avec auto-fix
npm audit fix

# Audit avec force
npm audit fix --force
```

### Vérifier les Versions
```bash
# Versions installées
npm list

# Versions obsolètes
npm outdated

# Mettre à jour les dépendances
npm update
```

## 🔧 Maintenance

### Mettre à Jour les Dépendances
```bash
# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm update react

# Mettre à jour vers la dernière version
npm install react@latest
```

### Gérer les Dépendances
```bash
# Ajouter une dépendance
npm install <package-name>

# Ajouter une dépendance de développement
npm install --save-dev <package-name>

# Supprimer une dépendance
npm uninstall <package-name>

# Supprimer une dépendance de développement
npm uninstall --save-dev <package-name>
```

## 🐛 Débogage

### Mode Debug
```bash
# Lancer avec debug
DEBUG=* npm run dev

# Debug spécifique
DEBUG=vite:* npm run dev
```

### Vérifier les Erreurs
```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Vérifier les erreurs ESLint
npm run lint

# Vérifier les erreurs de build
npm run build
```

### Logs
```bash
# Voir les logs en temps réel
tail -f logs/app.log

# Voir les erreurs
grep -i error logs/app.log
```

## 📦 Scripts Personnalisés

### Ajouter un Script
Éditez `package.json` :
```json
{
  "scripts": {
    "your-script": "votre-commande"
  }
}
```

Puis exécutez :
```bash
npm run your-script
```

### Scripts Utiles à Ajouter
```json
{
  "scripts": {
    "clean": "rm -rf dist node_modules/.vite",
    "fresh": "npm run clean && npm install && npm run dev",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "analyze": "npm run build && npx vite-bundle-visualizer"
  }
}
```

## 🌐 Déploiement

### Build pour Production
```bash
# Build standard
npm run build

# Build avec variables d'environnement
NODE_ENV=production npm run build
```

### Déployer sur Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Déployer sur Netlify
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy

# Déployer en production
netlify deploy --prod
```

### Déployer sur GitHub Pages
```bash
# Installer gh-pages
npm install --save-dev gh-pages

# Ajouter le script
npm run build
npx gh-pages -d dist
```

## 🔐 Sécurité

### Audit de Sécurité
```bash
# Audit npm
npm audit

# Audit avec rapport détaillé
npm audit --json > audit-report.json

# Vérifier les vulnérabilités
npm audit --audit-level=moderate
```

### Mettre à Jour les Packages Vulnérables
```bash
# Auto-fix des vulnérabilités
npm audit fix

# Force update
npm audit fix --force

# Update manuel
npm update <package-name>
```

## 📈 Performance

### Analyser les Performances
```bash
# Build avec analyse
npm run build -- --analyze

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Optimiser les Images
```bash
# Installer imagemin
npm install --save-dev imagemin imagemin-webp

# Optimiser les images
npx imagemin src/assets/images/* --out-dir=src/assets/images/optimized
```

## 🔄 Git

### Commandes Git Utiles
```bash
# Cloner le projet
git clone <repository-url>

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Commiter les changements
git add .
git commit -m "Description des changements"

# Pousser les changements
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request
gh pr create
```

### Workflow Recommandé
```bash
# 1. Mettre à jour la branche principale
git checkout main
git pull origin main

# 2. Créer une branche de fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# 3. Développer et tester
npm run dev

# 4. Commiter les changements
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 5. Pousser et créer une PR
git push origin feature/nouvelle-fonctionnalite
gh pr create
```

## 🎯 Commandes Rapides

### Démarrage Rapide
```bash
# Installation et lancement
npm install && npm run dev
```

### Build et Preview
```bash
# Build et prévisualisation
npm run build && npm run preview
```

### Nettoyage Complet
```bash
# Nettoyer et réinstaller
rm -rf node_modules dist .vite && npm install
```

### Vérification Complète
```bash
# Vérifier tout
npm run lint && npx tsc --noEmit && npm test
```

## 📝 Notes Importantes

### Ordre des Commandes
1. `npm install` - Toujours en premier
2. `npm run dev` - Pour le développement
3. `npm run build` - Avant le déploiement
4. `npm run preview` - Pour tester le build

### En Cas de Problème
1. Nettoyer les caches
2. Réinstaller les dépendances
3. Vérifier les versions Node.js et npm
4. Consulter les logs d'erreur

### Versions Recommandées
- Node.js: 18.x ou supérieur
- npm: 9.x ou supérieur
- TypeScript: 5.8.x

---

**Dernière mise à jour** : 2024
**Version** : 1.0.0


