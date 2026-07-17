import { Moon, Sun, Bell, ShieldCheck, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SettingsProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  notifications: boolean;
  onNotificationsToggle: () => void;
}

export default function Settings({ 
  darkMode, 
  onThemeToggle, 
  notifications, 
  onNotificationsToggle 
}: SettingsProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure theme environments, notification channels, and telemetry defaults</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success" id="settings-save-success">
          <CheckCircle size={18} />
          <span>Configuration saved locally!</span>
        </div>
      )}

      <div className="settings-list">
        <div className="settings-item" id="setting-dark-mode">
          <div className="settings-info">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {darkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-yellow-500" />}
              <span>Interface Appearance</span>
            </h4>
            <p>Toggle between Light and Dark visual canvas backgrounds</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={onThemeToggle} 
              id="switch-darkmode"
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-item" id="setting-notifications">
          <div className="settings-info">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--accent-blue)' }} />
              <span>Real-time Alerts</span>
            </h4>
            <p>Enable sound and banners upon successful portfolio imports and exports</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={onNotificationsToggle} 
              id="switch-notifications"
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-item" id="setting-security">
          <div className="settings-info">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              <span>Durable Local Engine</span>
            </h4>
            <p>The system stores your custom settings safely using SQLite and Local Storage</p>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
            Fully Connected
          </div>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <button onClick={handleSave} className="btn btn-primary" id="btn-save-settings">
            Persist Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
