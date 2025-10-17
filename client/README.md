# 🎓 VocabBoost - Application d'Apprentissage de Vocabulaire

## 📖 Description

VocabBoost est une application web moderne d'apprentissage de vocabulaire anglais, inspirée de Duolingo. Elle offre une expérience utilisateur engageante avec des animations fluides, un système de progression visuelle et des quiz interactifs.

## ✨ Fonctionnalités Principales

### 🎯 Apprentissage Progressif
- **Système d'unités** : Apprenez par unités de 5 mots
- **Quiz interactifs** : Questions variées avec feedback immédiat
- **Prononciation audio** : Écoutez et répétez chaque mot
- **Exemples d'utilisation** : Comprenez le contexte de chaque mot

### 📊 Suivi de Progression
- **Barres de progression** : Visualisez votre avancement
- **Système de série** : Maintenez votre série quotidienne 🔥
- **Statistiques détaillées** : Suivez vos performances
- **Badges et réalisations** : Débloquez des récompenses

### 🎨 Interface Moderne
- **Design style Duolingo** : Interface intuitive et engageante
- **Animations fluides** : Transitions douces et professionnelles
- **Responsive design** : Fonctionne sur mobile, tablette et desktop
- **Support multilingue** : FR, EN, ES, AR

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ et npm
- Backend VocabBoost en cours d'exécution

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

### Accès
- **Développement** : http://localhost:5173
- **Production** : Selon votre configuration

## 📁 Structure du Projet

```
client/
├── src/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   ├── UnitCard.tsx
│   │   │   ├── WordCard.tsx
│   │   │   ├── QuizCard.tsx
│   │   │   ├── CompletionModal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── pages/          # Pages de l'application
│   │   │   ├── HomePage.tsx
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── CoursePage.tsx
│   │   │   ├── LearnPage.tsx
│   │   │   └── ...
│   │   ├── contexts/       # Contextes React
│   │   │   ├── AuthContext.tsx
│   │   │   └── TranslateContext.tsx
│   │   ├── services/       # Services API
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── utils/          # Utilitaires
│   ├── App.tsx             # Composant principal
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── public/                 # Fichiers statiques
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

## 🗺️ Routes Principales

### Routes Publiques
- `/home` - Page d'accueil
- `/signup` - Inscription
- `/login` - Connexion
- `/forgot-password` - Récupération de mot de passe
- `/reset-password/:token` - Réinitialisation du mot de passe
- `/verify/:token` - Vérification d'email

### Routes Utilisateur
- `/` - Redirection automatique
- `/course` - Page principale des cours
- `/course/:categoryId/learn` - Apprentissage d'une unité
- `/onboarding` - Sélection de catégories
- `/words` - Liste des mots appris
- `/sessions` - Historique des sessions
- `/settings` - Paramètres

### Routes Administrateur
- `/admin` - Dashboard administrateur
- `/admin/users` - Gestion des utilisateurs
- `/admin/audit-logs` - Logs d'audit

## 🎨 Design System

### Couleurs
```css
Primaire:   #3B82F6 (Bleu)
Secondaire: #22C55E (Vert)
Accent:     #F59E0B (Orange)
Danger:     #EF4444 (Rouge)
Succès:     #10B981 (Vert clair)
```

### Typographie
- **Titres** : Font-bold, text-2xl/3xl
- **Sous-titres** : Font-semibold, text-lg/xl
- **Corps** : Font-medium, text-base
- **Petit texte** : text-sm

### Espacements
- Petit : 4px (gap-1)
- Moyen : 16px (gap-4)
- Grand : 32px (gap-8)

### Bordures
- Petit : rounded-xl (12px)
- Moyen : rounded-2xl (16px)
- Grand : rounded-3xl (24px)

## 🧩 Composants Principaux

### ProgressBar
Barre de progression animée avec couleurs personnalisables.

```tsx
<ProgressBar
  current={75}
  total={100}
  color="#3B82F6"
  height={8}
  showPercentage={true}
  animated={true}
/>
```

### StreakDisplay
Affichage de la série quotidienne avec animation de flamme.

```tsx
<StreakDisplay streak={7} size="md" />
```

### UnitCard
Carte d'unité avec progression et états visuels.

```tsx
<UnitCard
  title="Unité 1"
  description="Mots de base"
  progress={60}
  totalWords={10}
  completedWords={6}
  isLocked={false}
  isActive={true}
  onClick={() => {}}
/>
```

### WordCard
Carte de mot interactive avec prononciation.

```tsx
<WordCard
  word="Hello"
  translation="Bonjour"
  example="Hello, how are you?"
  exampleTranslation="Bonjour, comment allez-vous ?"
  size="lg"
  showExample={true}
/>
```

### QuizCard
Carte de quiz avec feedback visuel.

```tsx
<QuizCard
  question="Comment dit-on 'Bonjour' en anglais ?"
  options={["Hello", "Goodbye", "Thank you", "Please"]}
  correctAnswer="Hello"
  onAnswer={(isCorrect) => {}}
/>
```

## 🌍 Support Multilingue

L'application supporte 4 langues :
- 🇫🇷 Français (fr)
- 🇬🇧 Anglais (en)
- 🇪🇸 Espagnol (es)
- 🇸🇦 Arabe (ar)

### Utilisation

```tsx
import { useTranslate } from '../contexts/TranslateContext';

function MyComponent() {
  const { language } = useTranslate();
  const t = (key: string) => translations[language]?.[key] || translations.en[key];
  
  return <h1>{t('title')}</h1>;
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Classes Utiles
```tsx
// Texte responsive
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

## 🎭 Animations

### Animations Disponibles
- `animate-fadeIn` - Apparition en fondu
- `animate-slideUp` - Glissement vers le haut
- `animate-slideDown` - Glissement vers le bas
- `animate-scaleIn` - Zoom d'entrée
- `animate-bounce` - Rebond
- `animate-pulse` - Pulsation

### Utilisation
```tsx
<div className="animate-fadeIn">
  Contenu animé
</div>
```

## 🔧 Configuration

### Variables d'Environnement
Créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VocabBoost
```

### Tailwind CSS
Configuration dans `tailwind.config.ts` :

```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#22C55E',
      }
    }
  }
}
```

## 🧪 Tests

```bash
# Lancer les tests
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📦 Build et Déploiement

### Build de Production
```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.

### Prévisualisation
```bash
npm run preview
```

### Déploiement
Les fichiers dans `dist/` peuvent être déployés sur :
- Vercel
- Netlify
- GitHub Pages
- Tout serveur web statique

## 🐛 Dépannage

### Problème : Les animations ne fonctionnent pas
**Solution** : Vérifiez que `index.css` est bien importé dans `main.tsx`

### Problème : Les couleurs ne s'affichent pas
**Solution** : Vérifiez la configuration Tailwind dans `tailwind.config.ts`

### Problème : Les routes ne fonctionnent pas
**Solution** : Vérifiez que les routes sont bien définies dans `App.tsx`

### Problème : Les composants ne se chargent pas
**Solution** : Vérifiez les imports et la structure des fichiers

## 📚 Documentation

- **[UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md)** - Documentation complète des améliorations UI
- **[QUICK_START_UI.md](./QUICK_START_UI.md)** - Guide de démarrage rapide
- **[ROUTES.md](./ROUTES.md)** - Documentation des routes
- **[RESUME_AMELIORATIONS.md](./RESUME_AMELIORATIONS.md)** - Résumé des améliorations

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 👥 Auteurs

- **Amine** - *Développeur principal*

## 🙏 Remerciements

- Design inspiré de Duolingo
- Icônes par Lucide React
- Styles par Tailwind CSS
- Framework React

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter.

---

**Fait avec ❤️ pour faciliter l'apprentissage de l'anglais**

**Version** : 1.0.0
**Dernière mise à jour** : 2024


