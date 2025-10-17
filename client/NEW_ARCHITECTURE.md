# 🎓 Nouvelle Architecture - VocabBoost

## 📋 Vue d'ensemble

Refonte complète du frontend suivant la logique du backend avec un système d'apprentissage basé sur les sessions.

## 🎯 Flux Utilisateur

### 1. Écran d'Initialisation

**Route** : `/learn`

**Logique** :
- ✅ Vérifie si l'utilisateur a des catégories
- ❌ Si aucune catégorie → Demande de sélectionner
- ✅ Si catégories existent → Passe à l'apprentissage

**Fonctionnalités** :
- Affichage des statistiques (révision + nouveaux mots)
- Sélection automatique des mots
- Bouton "Commencer la session"

### 2. Phase d'Apprentissage

**Route** : `/quiz-session`

**Logique** :

#### A. Répétition du Vocabulaire
- Sélection aléatoire de **10 mots** déjà dans la DB utilisateur
- Mots appartenant aux catégories de l'utilisateur
- Mélangés aléatoirement

#### B. Nouveaux Mots
- Sélection aléatoire de **10 nouveaux mots**
- Selon les catégories de l'utilisateur
- Excluant les mots déjà appris
- **Ajoutés automatiquement à la DB utilisateur**

#### C. Quiz
- 20 questions au total (10 révision + 10 nouveaux)
- Questions mélangées aléatoirement
- Feedback immédiat (correct/incorrect)
- Sauvegarde automatique des réponses

### 3. Fin de Session

**Route** : `/session-completed`

**Logique** :
- Affichage des résultats (score, correctes, incorrectes)
- Calcul du taux de réussite
- Sauvegarde de la session dans la DB
- Options : Nouvelle session ou retour à l'accueil

## 📊 Architecture Technique

### Pages Principales

#### 1. ApprentissagePage.tsx
**Fichier** : `src/pages/ApprentissagePage.tsx`

**Responsabilités** :
- Initialisation de la session
- Vérification des catégories
- Sélection des mots (révision + nouveaux)
- Affichage des statistiques
- Navigation vers le quiz

**API Calls** :
- `getUserCategories()` - Récupérer les catégories
- `getUserWords()` - Récupérer les mots appris
- `getWords()` - Récupérer tous les mots

**Logique de Sélection** :
```typescript
// Révision : 10 mots aléatoires déjà appris
const userCategoryWords = userWords
  .filter(uw => categoryIds.includes(uw.word.categoryId))
  .sort(() => Math.random() - 0.5)
  .slice(0, 10);

// Nouveaux mots : 10 mots aléatoires non appris
const newWordsToLearn = allWords
  .filter(w => categoryIds.includes(w.categoryId))
  .filter(w => !learnedWordIds.has(w.id))
  .sort(() => Math.random() - 0.5)
  .slice(0, 10);
```

#### 2. QuizSessionPage.tsx
**Fichier** : `src/pages/QuizSessionPage.tsx`

**Responsabilités** :
- Affichage des questions
- Gestion des réponses
- Sauvegarde des quiz
- Navigation entre les questions
- Calcul du score

**API Calls** :
- `createUserWord()` - Créer un userWord pour les nouveaux mots
- `createQuiz()` - Créer un quiz
- `updateQuiz()` - Mettre à jour le quiz avec la réponse

**Logique de Sauvegarde** :
```typescript
// Pour chaque nouveau mot
if (isNewWord && !userWordId) {
  const userWordData = await createUserWord({
    userId: "",
    wordId: currentWord.id
  });
  userWordId = userWordData.id;
}

// Créer le quiz
await createQuiz({
  userWordId,
  question: `Quelle est la traduction de "${currentWord.word}" ?`,
  options: [...],
  correctAnswer: currentWord.translation,
  type: "translationEnglishToOther",
  areUserAnswersCorrect: correct
});
```

#### 3. SessionCompletedPage.tsx
**Fichier** : `src/pages/SessionCompletedPage.tsx`

**Responsabilités** :
- Affichage des résultats
- Sauvegarde de la session
- Navigation vers nouvelle session

**API Calls** :
- `createSession()` - Sauvegarder la session

**Données Sauvegardées** :
```typescript
{
  userId: string,
  score: number,
  totalQuestions: number,
  completedAt: Date
}
```

### Services

#### user-word.services.ts
```typescript
export const createUserWord = async (userWordData: UserWordAttributes) => {
  const response = await api.post(`/user-words/${userWordData.userId}/${userWordData.wordId}`);
  return response.data;
};

export const getUserWords = async () => {
  const response = await api.get("/user-words");
  return response.data;
};
```

#### quiz.services.ts
```typescript
export const createQuiz = async (quizData: {
  userWordId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: string;
  areUserAnswersCorrect: boolean;
}) => {
  const response = await api.post("/quizzes", quizData);
  return response.data;
};

export const updateQuiz = async (id: string, areUserAnswersCorrect: boolean) => {
  const response = await api.patch(`/quizzes/${id}`, { areUserAnswersCorrect });
  return response.data;
};
```

#### session.services.ts
```typescript
export const createSession = async (sessionData: {
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}) => {
  const response = await api.post("/sessions", sessionData);
  return response.data;
};
```

## 🔄 Flux de Données

```
1. Login
   ↓
2. /learn (ApprentissagePage)
   ├─ getUserCategories() → Vérifier catégories
   ├─ getUserWords() → Mots appris
   └─ getWords() → Tous les mots
   ↓
3. Sélection des mots
   ├─ 10 mots de révision (déjà appris)
   └─ 10 nouveaux mots (à apprendre)
   ↓
4. /quiz-session (QuizSessionPage)
   ├─ Pour chaque nouveau mot
   │  └─ createUserWord() → Ajouter à la DB
   ├─ Pour chaque question
   │  ├─ createQuiz() → Créer le quiz
   │  └─ updateQuiz() → Sauvegarder la réponse
   ↓
5. /session-completed (SessionCompletedPage)
   └─ createSession() → Sauvegarder la session
```

## 🎨 Interface Utilisateur

### ApprentissagePage
```
┌─────────────────────────────────────┐
│  Session d'Apprentissage            │  🔥 7 jours
│  Répétition et nouveaux mots        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │ 📚 Répétition│  │ ✨ Nouveaux  ││
│  │     10       │  │     10       ││
│  │    mots      │  │    mots      ││
│  └──────────────┘  └──────────────┘│
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Total de la session       │ │
│  │           20                  │ │
│  │          mots                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✨ Commencer la session      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### QuizSessionPage
```
┌─────────────────────────────────────┐
│  ← Question 5 sur 20                │
│  ████████░░░░░░░░░░ 25%            │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✨ Hello                     │ │
│  │                               │ │
│  │  Quelle est la traduction ?   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Bonjour                      │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  Au revoir                    │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  Merci                        │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  S'il vous plaît              │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### SessionCompletedPage
```
┌─────────────────────────────────────┐
│          🏆                         │
│                                     │
│     Félicitations !                 │
│  Session terminée avec succès !     │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ 15/20│  │  15  │  │  5   │     │
│  │Score │  │Correct│  │Incorrect│  │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Taux de réussite            │ │
│  │          75%                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  Excellent travail !                │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✨ Nouvelle session          │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  🏠 Retour à l'accueil        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## ✅ Fonctionnalités Implémentées

### 1. Initialisation Automatique
- ✅ Vérification des catégories
- ✅ Sélection automatique des mots
- ✅ Calcul des statistiques

### 2. Sélection Intelligente
- ✅ 10 mots de révision (aléatoires)
- ✅ 10 nouveaux mots (aléatoires)
- ✅ Exclusion des mots déjà appris
- ✅ Filtrage par catégories

### 3. Sauvegarde Automatique
- ✅ Création des userWords pour nouveaux mots
- ✅ Création des quiz
- ✅ Mise à jour des quiz avec réponses
- ✅ Sauvegarde de la session

### 4. Interface Moderne
- ✅ Design moderne avec gradients
- ✅ Animations fluides
- ✅ Feedback visuel immédiat
- ✅ Responsive design

## 🚀 Avantages

### Pour l'Utilisateur
- ⚡ Démarrage immédiat après login
- 🎯 Focus sur l'apprentissage
- 📊 Suivi des progrès
- 🎨 Interface moderne et intuitive

### Pour le Système
- 🔄 Logique basée sur le backend
- 💾 Sauvegarde automatique
- 📈 Traçabilité des sessions
- 🎲 Sélection aléatoire intelligente

## 📝 Notes Techniques

### Performance
- Lazy loading des composants
- Optimisation des appels API
- Gestion des états React

### Sécurité
- Routes protégées
- Validation des données
- Gestion des erreurs

### Scalabilité
- Architecture modulaire
- Services réutilisables
- Séparation des responsabilités

## 🔧 Configuration

### Routes
```typescript
/learn → ApprentissagePage (initialisation)
/quiz-session → QuizSessionPage (apprentissage)
/session-completed → SessionCompletedPage (résultats)
```

### API Endpoints
```
GET /user-categories → Catégories de l'utilisateur
GET /user-words → Mots appris
GET /words → Tous les mots
POST /user-words/:userId/:wordId → Créer userWord
POST /quizzes → Créer quiz
PATCH /quizzes/:id → Mettre à jour quiz
POST /sessions → Créer session
```

## 📊 Statistiques

### Build
```
✓ 1801 modules transformed
✓ built in 3.34s
✓ PWA generated
```

### Fichiers
- **Nouvelles pages** : 3
- **Services modifiés** : 3
- **Routes ajoutées** : 3
- **Lignes de code** : ~1500

---

**Version** : 2.0.0
**Statut** : ✅ Production Ready
**Dernière mise à jour** : 2024


