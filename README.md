# English Learning App 📚

A comprehensive full-stack web application for learning English vocabulary through interactive quizzes, gamification, and progress tracking. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

## 🌟 Features

### Core Learning Features
- **Vocabulary Management**: Select and learn English words from categorized lists
- **Interactive Quizzes**: 7 different quiz types to reinforce learning
  - English-to-Other translation
  - Other-to-English translation
  - Word meaning
  - Audio comprehension (Text-to-Speech)
  - Spelling challenges
  - Speaking practice (Speech-to-Text with OpenAI Whisper)
  - Sentence arrangement
- **Progress Tracking**: Real-time statistics on learning progress
- **Achievement System**: Unlock badges based on milestones
- **Streak Counter**: Track daily learning consistency

### User Management
- **Authentication System**:
  - User registration with email verification
  - Two-Factor Authentication (2FA/MFA) via email codes
  - Secure password reset flow
  - Session management (view and revoke active sessions)
- **User Profiles**: Customize language preferences (FR/ES/AR) and theme (light/dark)
- **Multi-language Support**: Full interface in 4 languages (French, English, Spanish, Arabic)

### Technical Features
- **Progressive Web App (PWA)**: Installable on mobile devices, offline support
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Activity Tracking**: Automatic logging of quiz attempts and learning activities
- **Admin Panel**: User management for administrators

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)

```
src/
├── config/          # Configuration (database, env, nodemailer)
├── controllers/     # Business logic
├── middlewares/     # Authentication & authorization
├── models/          # Sequelize ORM models
├── routes/          # API endpoints
├── validations/     # Request validation schemas
├── utils/           # Utilities (email service, quiz initiator)
├── seeds/           # Database seed data
└── specs/           # Jest/Supertest tests
```

**Key Models:**
- `User`: User accounts with email verification, MFA
- `Profile`: User preferences (language, theme)
- `Category`: Word categories
- `Word`: English vocabulary with translations
- `UserWord`: User's selected words
- `Quiz`: Generated quiz questions
- `UserActivity`: Activity log (quiz attempts, word additions)
- `UserStreak`: Daily learning streak tracking
- `UserAchievement`: Unlocked achievements
- `Session`: User sessions with device/IP tracking

### Frontend (React + TypeScript + Vite)

```
client/src/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   └── contexts/    # React contexts (Auth, Translate)
├── services/        # API client services
├── hooks/           # Custom React hooks
└── utils/           # Frontend utilities
```

**Key Components:**
- Authentication flow (Signup, Login, MFA, Email Verification)
- Dashboard with statistics and achievements
- Word selector and category management
- Quiz flow runner with 7 quiz types
- Settings panel (profile, password, sessions)
- Header with navigation and logout

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn
- Gmail account for email sending (with App Password)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full
   ```

2. **Install dependencies**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd client
   npm install
   cd ..
   ```

3. **Setup PostgreSQL**
   ```bash
   # Using Docker Compose
   docker-compose up -d
   
   # Or manually create databases:
   # - english_learning_dev (development)
   # - english_learning_test (testing)
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=english_learning_dev
   DB_NAME_TEST=english_learning_test
   
   # Security
   SALT_ROUNDS=10
   SESSION_EXPIRATION=24
   
   # Email (Gmail)
   MAIL_EMAIL=your-email@gmail.com
   MAIL_PASS=your-app-password
   
   # Frontend URL
   DOMAIN=http://localhost:3000
   DOMAIN2=http://localhost:5173
   
   # OpenAI (for Speech Recognition)
   OPENAI_API_KEY=your-openai-key
   ```

5. **Run database migrations and seeds**
   ```bash
   npm run build
   npm run seed
   ```

6. **Create an admin account (optional)**
   ```bash
   npm run create-admin
   ```
   This interactive script will prompt you for:
   - First name
   - Last name
   - Email
   - Password (with validation)
   
   The admin account will be created with `isAdmin: true` and `isVerified: true`.

7. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   npm run dev
   
   # Frontend (Terminal 2)
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📋 API Endpoints

### Authentication & Users
- `POST /api/users` - Create user account
- `POST /api/users/verify/:userId/:verificationToken` - Verify email
- `POST /api/users/resend-verification` - Resend verification email
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password/:userId/:resetToken` - Reset password
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/password` - Update password

### Sessions (MFA)
- `POST /api/sessions` - Login (generates MFA code)
- `POST /api/sessions/verify-mfa` - Verify MFA code and create session
- `GET /api/sessions` - List user sessions
- `DELETE /api/sessions/:sessionId` - Revoke specific session
- `DELETE /api/sessions` - Logout (destroy current session)
- `GET /api/sessions/me` - Get current user

### Learning Content
- `GET /api/categories` - List categories
- `POST /api/user-categories` - Select category
- `GET /api/words` - List words
- `POST /api/user-words` - Add word to learning list
- `GET /api/quizzes` - Get user quizzes
- `PATCH /api/quizzes/:id` - Submit quiz answer

### Progress & Gamification
- `GET /api/user-activities` - Get activity history
- `POST /api/user-activities` - Log activity
- `GET /api/user-streak` - Get current streak
- `POST /api/user-streak` - Update streak
- `GET /api/user-achievements` - Get unlocked achievements

### Media
- `GET /api/audio?text=...` - Text-to-Speech (OpenAI)
- `POST /api/speech-recognition` - Speech-to-Text (Whisper)

### Admin - Audit Logs
- `GET /api/audit-logs` - List all audit logs (admin only)
- `GET /api/audit-logs/stats` - Get audit statistics (admin only)
- `GET /api/audit-logs/user/:userId` - Get logs for specific user (admin only)

## 🧪 Testing

### Run Backend Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test -- src/specs/routes/user.routes.test.ts
```

### Test Coverage
- User routes (CRUD, authentication)
- Session routes (login, MFA, logout)
- Profile routes
- Category routes
- Quiz routes
- User-word routes
- User-activity routes
- User-streak routes
- User-achievement routes

## 🎯 User Flow

### 1. Registration & Onboarding
1. User signs up with email/password
2. Verification email sent with link
3. User verifies email
4. User creates profile (language preference, theme)
5. User selects learning categories
6. User selects words from categories

### 2. Learning Flow
1. User views dashboard with stats and achievements
2. User navigates to word list
3. User clicks on a word to start quizzes
4. System generates 7 different quiz types
5. User completes quizzes
6. Progress and achievements update automatically
7. Daily streak tracked

### 3. Authentication Flow (with MFA)
1. User enters email/password
2. Backend validates credentials
3. Backend generates 6-digit code and sends via email
4. User enters code on MFA page
5. Backend verifies code and creates session
6. User redirected to dashboard

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **Email Verification**: Required before login
- **Two-Factor Authentication**: Email-based OTP codes
- **Session Management**: 
  - Secure HTTP-only cookies
  - Token hashing in database
  - Session expiration (configurable)
  - Device/IP tracking
  - Multi-session support with individual revocation
- **Password Reset**: Time-limited tokens (1 hour)
- **MFA Codes**: Time-limited (10 minutes), single-use
- **Admin/User Scopes**: Role-based access control
- **Audit Logging**: Complete non-repudiation system
  - All critical actions logged (authentication, password changes, user management)
  - Immutable audit trail with WHO, WHAT, WHEN, WHERE
  - Admin dashboard for security monitoring
  - See [AUDIT_SYSTEM.md](./AUDIT_SYSTEM.md) for details

## 🌍 Internationalization (i18n)

The app supports 4 languages:
- **French (FR)** - Default
- **English (EN)**
- **Spanish (ES)**
- **Arabic (AR)** - Full RTL support

All UI elements, error messages, and email notifications are fully translated.

## 📱 Progressive Web App (PWA)

- Installable on mobile devices
- Offline support with service worker
- Optimized caching strategy for API responses
- Mobile-optimized manifest with icons

## 🎨 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **vite-plugin-pwa** - PWA support

### Backend
- **Node.js** with TypeScript
- **Express** - Web framework
- **Sequelize** - ORM
- **PostgreSQL** - Database
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **OpenAI API** - TTS & STT
- **Multer** - File upload handling
- **Jest + Supertest** - Testing

## 📊 Database Schema

### Core Tables
- `users` - User accounts
- `profiles` - User preferences
- `sessions` - Active sessions
- `categories` - Word categories
- `words` - English vocabulary
- `user_categories` - User category selections
- `user_words` - User word selections
- `quizzes` - Generated quizzes
- `user_activities` - Activity log
- `user_streaks` - Streak data
- `user_achievements` - Unlocked achievements
- `audit_logs` - Security audit trail (non-repudiation)

## 🛠️ Development

### Backend Development
```bash
npm run dev           # Start development server with ts-node
npm run build         # Compile TypeScript
npm run test          # Run tests
npm run seed          # Seed database
npm run create-admin  # Create admin account (interactive)
```

### Frontend Development
```bash
cd client
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📦 Deployment

### Backend
1. Build TypeScript: `npm run build`
2. Set production environment variables
3. Run migrations: `npm run migrate`
4. Start server: `node dist/index.js`

### Frontend
1. Build: `cd client && npm run build`
2. Serve `client/dist` with static file server (nginx, Apache, etc.)
3. Configure API proxy or CORS

## 🔧 Environment Variables

### Required
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `MAIL_EMAIL`, `MAIL_PASS` (Gmail with App Password)
- `OPENAI_API_KEY` (for speech features)

### Optional
- `PORT` (default: 3000)
- `NODE_ENV` (development/production)
- `SALT_ROUNDS` (default: 10)
- `SESSION_EXPIRATION` (hours, default: 24)
- `DOMAIN`, `DOMAIN2` (for email links)

## 📈 Statistics & Gamification

The app tracks and displays:
- Total words selected
- Words learned (mastery level)
- Quiz completion rate
- Success rate percentage
- Current streak (consecutive days)
- Longest streak
- Recent activities (last 20)
- Unlocked achievements

### Achievement Categories
- **Vocabulary**: First word, 10 words, 50 words
- **Quizzes**: First quiz, 10 quizzes, perfectionist (100%)
- **Streak**: 3 days, 7 days, 30 days
- **Mastery**: Master 10 words

## 🎮 Quiz Types Explained

1. **Translation (EN→Other)**: Translate English to selected language
2. **Translation (Other→EN)**: Translate from selected language to English
3. **Meaning**: Choose the correct definition
4. **Audio**: Listen and select the correct word (TTS via OpenAI)
5. **Spelling**: Listen and type the word correctly
6. **Speaking**: Pronounce the word (STT via OpenAI Whisper)
7. **Sentence Arrangement**: Rearrange words to form correct sentence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Author: Amine Ameur

Built with ❤️ for language learners worldwide.

## 🆘 Support

For issues, questions, or feature requests, please open an issue on the repository.

---

**Happy Learning! 🎓**

