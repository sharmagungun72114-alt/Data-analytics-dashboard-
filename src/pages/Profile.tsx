import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Mail, Shield, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { User } from '../types.js';

interface ProfileProps {
  user: User | null;
  onProfileUpdate: (updatedUser: User) => void;
}

export default function Profile({ user, onProfileUpdate }: ProfileProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Hydrate local state when user updates or loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const response = await axios.put('/api/profile', {
        id: user.id,
        name,
        email
      });

      if (response.data.success) {
        onProfileUpdate(response.data.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(response.data.message || 'Failed to update profile info.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred while saving profile to SQLite.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your profile.</p>
      </div>
    );
  }

  // Generate initial letters for avatar
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div id="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account Profile</h1>
          <p className="page-subtitle">Manage login credentials, name display preferences, and authority roles</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success" id="profile-save-success">
          <CheckCircle size={18} />
          <span>Profile changes updated and saved to local SQLite database!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" id="profile-save-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar-row">
          <div className="profile-avatar">
            {getInitials(user.name || user.username)}
          </div>
          <div className="profile-meta">
            <h3>{user.name}</h3>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
              <Shield size={14} style={{ color: 'var(--accent-blue)' }} />
              <span>{user.role}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="profile-edit-form">
          <div className="form-group">
            <label className="form-label">System Username (Read-Only)</label>
            <div className="search-input-wrapper">
              <UserIcon size={16} className="search-icon" />
              <input
                type="text"
                className="form-control form-input-full search-input"
                style={{ paddingLeft: '38px', backgroundColor: 'rgba(0,0,0,0.02)', cursor: 'not-allowed' }}
                value={user.username}
                disabled
                id="profile-username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <div className="search-input-wrapper">
              <UserIcon size={16} className="search-icon" />
              <input
                type="text"
                className="form-control form-input-full search-input"
                style={{ paddingLeft: '38px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                id="profile-name-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Contact Email</label>
            <div className="search-input-wrapper">
              <Mail size={16} className="search-icon" />
              <input
                type="email"
                className="form-control form-input-full search-input"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="profile-email-input"
              />
            </div>
          </div>

          <div style={{ marginTop: '28px', textAlign: 'right' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="btn-save-profile"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
