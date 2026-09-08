import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import ResultsPage from './pages/ResultsPage';

function ProtectedLayout({ children }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span className="spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Navbar />
      {children}
    </div>
  );
}

function PublicOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
            <Route path="/" element={<ProtectedLayout><GamePage /></ProtectedLayout>} />
            <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
            <Route path="/results" element={<ProtectedLayout><ResultsPage /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
