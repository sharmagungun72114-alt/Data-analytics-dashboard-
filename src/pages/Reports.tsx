import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Eye, X, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Report } from '../types.js';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/reports', {
        params: { search, category, status }
      });
      if (response.data.success) {
        setReports(response.data.reports);
      } else {
        setError('Failed to fetch reports.');
      }
    } catch (err: any) {
      setError('Error communicating with backend database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [category, status]); // Instant fetch on filter change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Published':
        return 'badge-active';
      case 'Pending':
        return 'badge-pending';
      case 'Draft':
        return 'badge-inactive';
      default:
        return '';
    }
  };

  return (
    <div id="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Reports</h1>
          <p className="page-subtitle">Access business statements, system logs, and marketing audits</p>
        </div>
        <button onClick={fetchReports} className="btn" id="btn-refresh-reports">
          <RefreshCw size={14} />
          <span>Reload Table</span>
        </button>
      </div>

      <div className="card-table-container">
        <div className="table-header">
          <form onSubmit={handleSearchSubmit} className="table-actions" style={{ flex: 1, gap: '16px' }} id="reports-search-form">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search report title, summary, author..."
                className="form-control search-input"
                style={{ width: '280px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="report-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="btn-search-reports">
              Apply Search
            </button>
          </form>

          <div className="table-actions">
            <div>
              <label style={{ marginRight: '8px', fontSize: '13px', fontWeight: 600 }}>Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="report-filter-category"
              >
                <option value="All">All Categories</option>
                <option value="Financial">Financial</option>
                <option value="Audit">Audit</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label style={{ marginRight: '8px', fontSize: '13px', fontWeight: 600 }}>Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                id="report-filter-status"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading records list...</p>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <AlertCircle size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <p style={{ color: '#64748b' }}>No reports match the current criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Created By</th>
                  <th>Release Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ fontWeight: 600 }}>{report.title}</td>
                    <td>{report.category}</td>
                    <td>{report.created_by}</td>
                    <td>{report.created_at}</td>
                    <td>
                      <span className={`badge ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Report detail modal */}
      {selectedReport && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setSelectedReport(null)}
          id="report-detail-modal"
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--card-radius)',
              width: '100%',
              maxWidth: '600px',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedReport(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              id="report-modal-close-btn"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '50%' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <span className={`badge ${getStatusClass(selectedReport.status)}`} style={{ marginBottom: '4px' }}>
                  {selectedReport.status}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedReport.title}</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Category</p>
                <p style={{ fontWeight: 500 }}>{selectedReport.category}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Created By</p>
                <p style={{ fontWeight: 500 }}>{selectedReport.created_by}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Published At</p>
                <p style={{ fontWeight: 500 }}>{selectedReport.created_at}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Report ID</p>
                <p style={{ fontFamily: 'var(--font-mono)' }}>#REP-{selectedReport.id}</p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Executive Summary / Description</p>
              <p style={{ lineHeight: '1.6', fontSize: '14px', color: 'var(--text-primary)' }}>
                {selectedReport.description}
              </p>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'right' }}>
              <button onClick={() => setSelectedReport(null)} className="btn btn-primary">
                Close Report View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
