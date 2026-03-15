import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthRedirectRoute } from "./components/auth/AuthRedirectRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/common/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { MeishiPreviewPage } from "./pages/MeishiPreviewPage";
import { PrefectureSelectPage } from "./pages/PrefectureSelectPage";
import { ReceivePage } from "./pages/ReceivePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TopicGenerationPage } from "./pages/TopicGenerationPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthRedirectRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/receive" element={<ReceivePage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<PrefectureSelectPage />} />
              <Route path="/topics" element={<TopicGenerationPage />} />
              <Route path="/preview" element={<MeishiPreviewPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
