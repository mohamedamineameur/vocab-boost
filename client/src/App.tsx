import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./src/pages/SignupPage";
import LoginPage from "./src/pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
