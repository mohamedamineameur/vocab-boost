import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage"; // ⚡ Old
import Header from "./components/Header";
import Footer from "./components/FooterComponent";
import { ProtectedRoute } from "./components/ProtectedRoute"; // ⚡
import { AdminRoute } from "./components/AdminRoute";
import DashboardRouter from "./components/DashboardRouter";
import CategorySelectionPage from "./pages/testPage";
import WordSelectorPage from "./pages/WordSelectorPage";
import QuizPage from "./pages/QuizPage";
import Test2 from "./pages/test2";
import ProfileCreatePage from "./pages/ProfileCreatePage";
import QuizFlowRunner from "./pages/QuizFlowRunnerPage";
import WordsPage from './pages/WordsPage';
import SettingsPage from './pages/SettingsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MFAVerifyPage from './pages/MFAVerifyPage';
import SessionsPage from './pages/SessionsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import OnboardingPage from './pages/OnboardingPage';
import CoursePage from './pages/CoursePage';
import LearnPage from './pages/LearnPage';
import ApprentissagePage from './pages/ApprentissagePage';
import WordLearningPage from './pages/WordLearningPage';
import QuizSessionPage from './pages/QuizSessionPage';
import SessionCompletedPage from './pages/SessionCompletedPage';

function App() {
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/mfa-verify" element={<MFAVerifyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:userId/:resetToken" element={<ResetPasswordPage />} />
              <Route path="/verify/:userId/:verificationToken" element={<VerifyEmailPage />} />
              <Route path="/test2" element={<Test2 />} />

              {/* Page publique */}
              <Route path="/home" element={<HomePage />} />

              {/* Page protégée → "/" - Redirige automatiquement admin/user */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />

              {/* Nouvelle expérience d'apprentissage - Flux direct */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute skipCategoryCheck>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Page d'accueil d'apprentissage - Redirection principale après login */}
              <Route
                path="/learn"
                element={
                  <ProtectedRoute>
                    <ApprentissagePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Page d'apprentissage des mots */}
              <Route
                path="/learn-words"
                element={
                  <ProtectedRoute>
                    <WordLearningPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Page de quiz pour la session complète */}
              <Route
                path="/quiz-session"
                element={
                  <ProtectedRoute>
                    <QuizSessionPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Page de fin de session avec résultats */}
              <Route
                path="/session-completed"
                element={
                  <ProtectedRoute>
                    <SessionCompletedPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Page d'apprentissage d'une catégorie spécifique (ancienne version) */}
              <Route
                path="/learn/:categoryId"
                element={
                  <ProtectedRoute>
                    <LearnPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Anciennes routes (optionnelles) */}
              <Route
                path="/course"
                element={
                  <ProtectedRoute>
                    <CoursePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course/:categoryId/learn"
                element={
                  <ProtectedRoute>
                    <LearnPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Ancien dashboard (optionnel) */}
              <Route
                path="/dashboard-simple"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute skipCategoryCheck>
                    <CategorySelectionPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/categories/:categoryId/words" element={
                <ProtectedRoute>
                  <WordSelectorPage />
                </ProtectedRoute>
              } />
              <Route path="/words/:wordId/quizzes" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />
             <Route path="/profile" element={
  <ProtectedRoute skipProfileCheck skipCategoryCheck>
    <ProfileCreatePage />
  </ProtectedRoute>
} />

              <Route path="/quiz-flow/:userWordId" element={
                <ProtectedRoute>
                  <QuizFlowRunner />
                </ProtectedRoute>
              } />

              <Route
  path="/words"
  element={
    <ProtectedRoute>
      <WordsPage />
    </ProtectedRoute>
  }
/>

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <SessionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Routes Admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/audit-logs"
                element={
                  <AdminRoute>
                    <AuditLogsPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />

              {/* Route 404 - Doit être en dernier */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
