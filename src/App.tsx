import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WalletProvider } from "./contexts/WalletContext";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Trade } from "./pages/Trade";
import { Wallet } from "./pages/Wallet";
import { Settings } from "./pages/Settings";
import { History } from "./pages/History";
import { News } from "./pages/News";
import { AuthForms } from "./components/auth/AuthForms";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Admin } from "./pages/Admin";
import { ScrollToTop } from "./components/layout/ScrollToTop";

function AppContent() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthForms />;
  }

  return (
    <WalletProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="trade" element={<Trade />} />
          <Route path="news" element={<News />} />
          <Route path="history" element={<History />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="settings" element={<Settings />} />

          <Route
            path="admin"
            element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </WalletProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
