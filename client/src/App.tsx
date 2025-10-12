import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./src/contexts/AuthContext";
import SignupPage from "./src/pages/SignupPage";
import LoginPage from "./src/pages/LoginPage";
import HomePage from "./src/pages/HomePage";
import DashboardPage from "./src/pages/DashboardPage"; // ⚡ Old
import Header from "./src/components/Header";
import Footer from "./src/components/FooterComponent";
import { ProtectedRoute } from "./src/components/ProtectedRoute"; // ⚡
import { AdminRoute } from "./src/components/AdminRoute";
import DashboardRouter from "./src/components/DashboardRouter";
import CategorySelectionPage from "./src/pages/testPage";
import WordSelectorPage from "./src/pages/WordSelectorPage";
import QuizPage from "./src/pages/QuizPage";
import Test2 from "./src/pages/test2";
import ProfileCreatePage from "./src/pages/ProfileCreatePage";
import QuizFlowRunner from "./src/pages/QuizFlowRunnerPage";
import WordsPage from './src/pages/WordsPage';
import SettingsPage from './src/pages/SettingsPage';
import VerifyEmailPage from './src/pages/VerifyEmailPage';
import ForgotPasswordPage from './src/pages/ForgotPasswordPage';
import ResetPasswordPage from './src/pages/ResetPasswordPage';
import MFAVerifyPage from './src/pages/MFAVerifyPage';
import SessionsPage from './src/pages/SessionsPage';
import AuditLogsPage from './src/pages/AuditLogsPage';
import AdminDashboard from './src/pages/AdminDashboard';
import AdminUsersPage from './src/pages/AdminUsersPage';
import NotFoundPage from './src/pages/NotFoundPage';

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E]">
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
    </AuthProvider>
  );
}

export default App;
