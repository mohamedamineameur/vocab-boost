# 🗺️ Documentation des Routes

## 📋 Vue d'ensemble

Ce document liste toutes les routes de l'application VocabBoost et explique leur utilisation.

## 🔓 Routes Publiques

### `/home`
**Page**: `HomePage.tsx`
**Description**: Page d'accueil publique avec présentation de l'application
**Fonctionnalités**:
- Présentation de l'application
- Boutons d'inscription et connexion
- Support multilingue
- Design moderne avec gradient

---

### `/signup`
**Page**: `SignupPage.tsx`
**Description**: Page d'inscription
**Fonctionnalités**:
- Formulaire d'inscription
- Validation des données
- Redirection après inscription

---

### `/login`
**Page**: `LoginPage.tsx`
**Description**: Page de connexion
**Fonctionnalités**:
- Formulaire de connexion
- Authentification
- Gestion des erreurs

---

### `/forgot-password`
**Page**: `ForgotPasswordPage.tsx`
**Description**: Page de récupération de mot de passe
**Fonctionnalités**:
- Demande de réinitialisation
- Envoi d'email

---

### `/reset-password/:userId/:resetToken`
**Page**: `ResetPasswordPage.tsx`
**Description**: Page de réinitialisation du mot de passe
**Fonctionnalités**:
- Formulaire de nouveau mot de passe
- Validation du token

---

### `/verify/:userId/:verificationToken`
**Page**: `VerifyEmailPage.tsx`
**Description**: Page de vérification d'email
**Fonctionnalités**:
- Vérification du compte
- Confirmation visuelle

---

### `/mfa-verify`
**Page**: `MFAVerifyPage.tsx`
**Description**: Page de vérification à deux facteurs
**Fonctionnalités**:
- Code de vérification
- Authentification renforcée

---

## 🔒 Routes Protégées (Utilisateur)

### `/`
**Router**: `DashboardRouter`
**Description**: Route racine qui redirige selon le rôle
**Redirection**:
- Utilisateur normal → `/course`
- Administrateur → `/admin`

---

### `/course`
**Page**: `CoursePage.tsx`
**Description**: Page principale des cours (style Duolingo)
**Fonctionnalités**:
- Vue d'ensemble des unités
- Statistiques globales
- Progression visuelle
- Navigation vers les unités

**Composants utilisés**:
- `UnitCard`
- `ProgressBar`
- `StreakDisplay`
- `StatsCard`

---

### `/course/:categoryId/learn`
**Page**: `LearnPage.tsx`
**Description**: Page d'apprentissage d'une unité
**Fonctionnalités**:
- Apprentissage des mots (5 mots)
- Quiz interactifs
- Progression en temps réel
- Écran de félicitations

**Flux**:
1. Affichage des mots avec exemples
2. Quiz à choix multiples
3. Résumé et félicitations

**Composants utilisés**:
- `WordCard`
- `QuizCard`
- `ProgressBar`
- `CompletionModal`

---

### `/onboarding`
**Page**: `OnboardingPage.tsx`
**Description**: Page d'onboarding pour la sélection de catégories
**Fonctionnalités**:
- Sélection de catégories (minimum 3)
- Validation en temps réel
- Design moderne avec animations
- Support multilingue

**Composants utilisés**:
- Grille de catégories
- Bouton de continuation intelligent

---

### `/categories`
**Page**: `CategorySelectionPage.tsx`
**Description**: Page de sélection de catégories (ancienne version)
**Note**: ⚠️ Dépréciée, utilisez `/onboarding` à la place

---

### `/categories/:categoryId/words`
**Page**: `WordSelectorPage.tsx`
**Description**: Sélection de mots par catégorie
**Fonctionnalités**:
- Liste des mots
- Filtrage
- Sélection

---

### `/words/:wordId/quizzes`
**Page**: `QuizPage.tsx`
**Description**: Quiz pour un mot spécifique
**Fonctionnalités**:
- Quiz variés
- Feedback immédiat
- Progression

---

### `/quiz-flow/:userWordId`
**Page**: `QuizFlowRunnerPage.tsx`
**Description**: Exécution du flux de quiz
**Fonctionnalités**:
- Navigation entre quiz
- Sauvegarde des réponses
- Résumé final

---

### `/words`
**Page**: `WordsPage.tsx`
**Description**: Page de gestion des mots
**Fonctionnalités**:
- Liste des mots appris
- Filtrage et recherche
- Statistiques

---

### `/sessions`
**Page**: `SessionsPage.tsx`
**Description**: Historique des sessions d'apprentissage
**Fonctionnalités**:
- Liste des sessions
- Statistiques par session
- Filtres

---

### `/settings`
**Page**: `SettingsPage.tsx`
**Description**: Paramètres de l'utilisateur
**Fonctionnalités**:
- Préférences utilisateur
- Langue
- Notifications
- Compte

---

### `/profile`
**Page**: `ProfileCreatePage.tsx`
**Description**: Création/édition du profil
**Fonctionnalités**:
- Informations personnelles
- Photo de profil
- Préférences

---

### `/dashboard-simple`
**Page**: `DashboardPage.tsx`
**Description**: Ancien dashboard simple
**Note**: ⚠️ Déprécié, utilisez `/course` à la place

---

## 👑 Routes Administrateur

### `/admin`
**Page**: `AdminDashboard.tsx`
**Description**: Dashboard administrateur
**Fonctionnalités**:
- Vue d'ensemble du système
- Statistiques globales
- Actions rapides

---

### `/admin/audit-logs`
**Page**: `AuditLogsPage.tsx`
**Description**: Logs d'audit
**Fonctionnalités**:
- Historique des actions
- Filtres
- Export

---

### `/admin/users`
**Page**: `AdminUsersPage.tsx`
**Description**: Gestion des utilisateurs
**Fonctionnalités**:
- Liste des utilisateurs
- Modération
- Statistiques

---

## 🔧 Routes de Test

### `/test2`
**Page**: `Test2.tsx`
**Description**: Page de test
**Note**: ⚠️ À supprimer en production

---

## 🚫 Route 404

### `*`
**Page**: `NotFoundPage.tsx`
**Description**: Page d'erreur 404
**Fonctionnalités**:
- Message d'erreur
- Bouton de retour
- Design moderne

---

## 📊 Schéma des Routes

```
/
├── /home (publique)
├── /signup (publique)
├── /login (publique)
├── /forgot-password (publique)
├── /reset-password/:userId/:resetToken (publique)
├── /verify/:userId/:verificationToken (publique)
├── /mfa-verify (publique)
│
├── / (protégée - redirige)
│   ├── /course (utilisateur)
│   │   └── /course/:categoryId/learn (utilisateur)
│   ├── /onboarding (utilisateur)
│   ├── /categories (utilisateur - dépréciée)
│   ├── /categories/:categoryId/words (utilisateur)
│   ├── /words/:wordId/quizzes (utilisateur)
│   ├── /quiz-flow/:userWordId (utilisateur)
│   ├── /words (utilisateur)
│   ├── /sessions (utilisateur)
│   ├── /settings (utilisateur)
│   ├── /profile (utilisateur)
│   └── /dashboard-simple (utilisateur - dépréciée)
│
├── /admin (administrateur)
│   ├── /admin/audit-logs (administrateur)
│   └── /admin/users (administrateur)
│
└── * (404)
```

## 🔐 Protection des Routes

### ProtectedRoute
**Fichier**: `components/ProtectedRoute.tsx`
**Description**: Composant de protection des routes
**Props**:
- `skipCategoryCheck`: Ignore la vérification de catégorie
- `skipProfileCheck`: Ignore la vérification de profil

**Exemple**:
```tsx
<ProtectedRoute skipCategoryCheck>
  <YourComponent />
</ProtectedRoute>
```

### AdminRoute
**Fichier**: `components/AdminRoute.tsx`
**Description**: Composant de protection des routes admin
**Redirection**: Vers `/` si non administrateur

**Exemple**:
```tsx
<AdminRoute>
  <AdminComponent />
</AdminRoute>
```

## 🎯 Flux Utilisateur Recommandé

### Nouvel Utilisateur
```
/home → /signup → /onboarding → /course → /course/:categoryId/learn
```

### Utilisateur Existant
```
/home → /login → /course → /course/:categoryId/learn
```

### Utilisateur Revenant
```
/ → /course (redirection automatique)
```

### Administrateur
```
/ → /admin → /admin/users ou /admin/audit-logs
```

## 📝 Notes Importantes

1. **Routes Dépréciées**:
   - `/categories` → Utilisez `/onboarding`
   - `/dashboard-simple` → Utilisez `/course`

2. **Routes Protégées**:
   - Toutes les routes utilisateur nécessitent une authentification
   - Les routes admin nécessitent le rôle administrateur

3. **Redirections Automatiques**:
   - `/` redirige vers `/course` ou `/admin` selon le rôle
   - Les utilisateurs non authentifiés sont redirigés vers `/login`

4. **Routes de Test**:
   - `/test2` doit être supprimée en production

## 🔄 Mises à Jour Futures

### Routes Prévues
- `/leaderboard` - Classement des utilisateurs
- `/achievements` - Badges et réalisations
- `/social` - Fonctionnalités sociales
- `/premium` - Abonnement premium

### Routes à Supprimer
- `/test2` - Page de test
- `/categories` - Ancienne version
- `/dashboard-simple` - Ancien dashboard

---

**Dernière mise à jour**: 2024
**Version**: 1.0.0


