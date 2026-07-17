import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import Analytics from './pages/Analytics.js';
import Reports from './pages/Reports.js';
import Customers from './pages/Customers.js';
import Settings from './pages/Settings.js';
import Profile from './pages/Profile.js';
import NotFound from './pages/NotFound.js';
import { User } from './types.js';

export default function App() {
  // Session tracking
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('currentUser');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Client preferences
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('darkMode');
    try {
      return cached ? JSON.parse(cached) : false;
    } catch {
      return false;
    }
  });

  const [notifications, setNotifications] = useState<boolean>(() => {
    const cached = localStorage.getItem('notifications');
    try {
      return cached ? JSON.parse(cached) : true;
    } catch {
      return true;
    }
  });

  // Mobile sidebar visibility toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize body class for theme background colors
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setMobileSidebarOpen(false);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleThemeToggle = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('darkMode', JSON.stringify(nextMode));
  };

  const handleNotificationsToggle = () => {
    const nextNotify = !notifications;
    setNotifications(nextNotify);
    localStorage.setItem('notifications', JSON.stringify(nextNotify));
  };

  // If user is not authenticated, load the Login page exclusively
  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="app-container" id="app-root">
        {/* Mobile Top Navbar */}
        <header className="mobile-navbar" id="app-mobile-nav">
          <span className="mobile-logo">BI Dashboard</span>
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            className="menu-btn"
            id="mobile-menu-toggle-btn"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Sidebar Component */}
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          isOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Backdrop for mobile layout */}
        {mobileSidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 45
            }}
            onClick={() => setMobileSidebarOpen(false)}
            id="mobile-sidebar-backdrop"
          />
        )}

        {/* Main Content Area */}
        <main className="main-content" id="app-main-content">
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/analytics" element={<Analytics darkMode={darkMode} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/customers" element={<Customers />} />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  darkMode={darkMode} 
                  onThemeToggle={handleThemeToggle} 
                  notifications={notifications} 
                  onNotificationsToggle={handleNotificationsToggle}
                />
              } 
            />
            <Route 
              path="/profile" 
              element={<Profile user={user} onProfileUpdate={handleProfileUpdate} />} 
            />
            
            {/* Catch-all route renders professional 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
