import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  LogOut,
  X
} from 'lucide-react';
import { User } from '../types.js';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <LayoutDashboard className="text-blue-500" size={24} />
        <span>BI Analytics</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className="menu-btn" 
            style={{ marginLeft: 'auto', display: 'none', color: '#ffffff' }}
            id="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="sidebar-menu">
          <li>
            <NavLink 
              to="/" 
              id="sidebar-link-dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/analytics" 
              id="sidebar-link-analytics"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/reports" 
              id="sidebar-link-reports"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <FileText size={18} />
              <span>Reports</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/customers" 
              id="sidebar-link-customers"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Customers</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              id="sidebar-link-settings"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <SettingsIcon size={18} />
              <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/profile" 
              id="sidebar-link-profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <UserIcon size={18} />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ padding: '12px' }}>
        <button 
          onClick={handleLogoutClick} 
          className="sidebar-link" 
          id="btn-logout"
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {user && (
        <div className="sidebar-footer">
          <p style={{ fontWeight: 600, color: '#ffffff' }}>{user.name}</p>
          <p style={{ fontSize: '11px', opacity: 0.7 }}>{user.role}</p>
        </div>
      )}
    </aside>
  );
}
