import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./src/contexts/AuthContext";
import SignupPage from "./src/pages/SignupPage";
import LoginPage from "./src/pages/LoginPage";
import HomePage from "./src/pages/HomePage";
import DashboardPage from "./src/pages/DashboardPage"; // ⚡
import Footer from "./src/components/FooterComponent";
import { ProtectedRoute } from "./src/components/ProtectedRoute"; // ⚡
import CategorySelectionPage from "./src/pages/testPage";
import WordSelectorPage from "./src/pages/WordSelectorPage";
import QuizPage from "./src/pages/QuizPage";
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E]">
          <div className="flex-1">
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Page publique */}
              <Route path="/home" element={<HomePage />} />

              {/* Page protégée → "/" */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
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

            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
