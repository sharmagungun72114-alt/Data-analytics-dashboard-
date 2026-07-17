import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Search, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { Customer } from '../types.js';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/customers', {
        params: {
          search,
          status,
          sortBy,
          sortOrder,
          page,
          limit
        }
      });
      if (response.data.success) {
        setCustomers(response.data.customers);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
      } else {
        setError('Failed to query database customer records.');
      }
    } catch (err: any) {
      setError('Communication breakdown with SQLite API backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [status, sortBy, sortOrder, page]); // Dynamic refetch when page/sort/filter alterations occur

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchCustomers();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    window.open('/api/export?type=customers', '_blank');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsedData = JSON.parse(text);

        if (!Array.isArray(parsedData)) {
          setError('JSON import rejected. Root must be a JSON array of Customer records.');
          return;
        }

        // Send to API
        setLoading(true);
        const response = await axios.post('/api/import', {
          type: 'customers',
          data: parsedData
        });

        if (response.data.success) {
          setSuccessMsg(response.data.message || 'Import completed successfully!');
          setPage(1);
          fetchCustomers();
          setTimeout(() => setSuccessMsg(''), 5000);
        } else {
          setError(response.data.message || 'Error occurred during import.');
        }
      } catch (err: any) {
        setError('Failed to parse file as valid JSON: ' + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div id="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise Accounts</h1>
          <p className="page-subtitle">Track, search, and manage high-value corporate portfolios</p>
        </div>
        <div className="flex-row-gap">
          <button onClick={handleExportCSV} className="btn" id="btn-export-customers">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button onClick={handleImportClick} className="btn btn-primary" id="btn-import-customers">
            <Upload size={14} />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" id="import-success-alert">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" id="customers-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card-table-container">
        <div className="table-header">
          <form onSubmit={handleSearchSubmit} className="table-actions" style={{ flex: 1, gap: '16px' }} id="customers-search-form">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search account name, email, phone..."
                className="form-control search-input"
                style={{ width: '280px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="customer-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="btn-search-customers">
              Apply Filter
            </button>
          </form>

          <div className="table-actions">
            <div>
              <label style={{ marginRight: '8px', fontSize: '13px', fontWeight: 600 }}>Status Filter</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                id="customer-filter-status"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
            
            <button onClick={fetchCustomers} className="btn" title="Refresh Table" id="btn-refresh-customers">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Querying SQLite records...</p>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <AlertCircle size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <p style={{ color: '#64748b' }}>No accounts found matching search criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} id="th-sort-name">
                    Account Name <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th onClick={() => handleSort('email')} id="th-sort-email">
                    Primary Email <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th>Telephone</th>
                  <th onClick={() => handleSort('revenue')} id="th-sort-revenue">
                    Lifetime Yield <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th onClick={() => handleSort('signup_date')} id="th-sort-signup">
                    Signup Date <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th onClick={() => handleSort('status')} id="th-sort-status">
                    Status <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(c.revenue)}</td>
                    <td>{c.signup_date}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="pagination-container">
          <span className="pagination-text" id="pagination-status-text">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} total entries)
          </span>
          <div className="pagination-buttons">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn"
              id="btn-pagination-prev"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="btn"
              id="btn-pagination-next"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Syntax helper for importing */}
      <div 
        style={{
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--card-radius)', 
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>
          <FileSpreadsheet size={16} style={{ color: 'var(--accent-blue)' }} />
          <span>Need help importing data?</span>
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
          You can import multiple customer portfolios instantly. Prepare a <code>.json</code> file structured as a JSON list. Click the template block below to copy a sample schema:
        </p>
        <pre 
          onClick={() => {
            navigator.clipboard.writeText(`[\n  {\n    "name": "Oscorp Industries",\n    "email": "procurement@oscorp.com",\n    "phone": "+1 (555) 012-4040",\n    "revenue": 84500.00,\n    "signup_date": "${new Date().toISOString().split('T')[0]}",\n    "status": "Active"\n  }\n]`);
            alert('Sample JSON syntax copied to clipboard!');
          }}
          style={{
            backgroundColor: 'rgba(0,0,0,0.03)',
            padding: '12px',
            borderRadius: 'var(--input-radius)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            overflowX: 'auto',
            border: '1px solid var(--border-color)'
          }}
          id="copyable-template"
        >
{`[
  {
    "name": "Oscorp Industries",
    "email": "procurement@oscorp.com",
    "phone": "+1 (555) 012-4040",
    "revenue": 84500.00,
    "signup_date": "${new Date().toISOString().split('T')[0]}",
    "status": "Active"
  }
]`}
        </pre>
      </div>
    </div>
  );
}
