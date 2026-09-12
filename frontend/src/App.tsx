import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

const MainContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const activeRole = user.role || (user as any).role_id;
    switch (activeRole) {
      case 'CITIZEN':
        return <CitizenDashboard />;
      case 'DEPARTMENT_OFFICER':
        return <OfficerDashboard />;
      case 'SYSTEM_ADMIN':
      case 'DEPARTMENT_ADMIN':
        return <AdminDashboard />;
      default:
        return <CitizenDashboard />;
    }
  }

  return <LandingPage />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F5F6F3] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
          <Navbar />
          <main className="flex-1">
            <MainContent />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
