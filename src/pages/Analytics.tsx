import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, Award, AwardIcon, ShoppingCart, RefreshCw, BarChart2 } from 'lucide-react';
import { AnalyticsData } from '../types.js';

interface AnalyticsProps {
  darkMode: boolean;
}

export default function Analytics({ darkMode }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/analytics');
      if (response.data.success) {
        setData(response.data);
      } else {
        setError('Failed to fetch business analytics.');
      }
    } catch (err: any) {
      setError('Error communicating with backend analytics service.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#f1f5f9';

  // Combo chart showing revenue as Bar and quantity as Line
  const comboChartData = data ? {
    labels: data.monthlyBreakdown.map(b => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const [year, m] = b.month.split('-');
      return monthNames[parseInt(m) - 1] || b.month;
    }),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Monthly Revenue ($)',
        data: data.monthlyBreakdown.map(b => b.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#2563eb',
        borderWidth: 1,
        yAxisID: 'y_rev',
        borderRadius: 4
      },
      {
        type: 'line' as const,
        label: 'Items Sold (Qty)',
        data: data.monthlyBreakdown.map(b => b.items),
        borderColor: '#10b981',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y_items',
        pointBackgroundColor: '#10b981',
        tension: 0.2
      }
    ]
  } : null;

  const comboChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1e293b' : '#0f172a',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderWidth: 1,
        borderColor: darkMode ? '#334155' : '#e2e8f0'
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter' } }
      },
      y_rev: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: gridColor },
        ticks: { 
          color: textColor,
          font: { family: 'Inter' },
          callback: (value: any) => '$' + value
        },
        title: {
          display: true,
          text: 'Revenue ($)',
          color: textColor,
          font: { family: 'Inter', weight: 'bold' as const }
        }
      },
      y_items: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false }, // avoid double lines grid clutter
        ticks: { color: textColor, font: { family: 'Inter' } },
        title: {
          display: true,
          text: 'Items Sold (Qty)',
          color: textColor,
          font: { family: 'Inter', weight: 'bold' as const }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontSize: '15px', color: '#64748b' }}>Calculating analytics indices...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error || 'Could not load analytics.'}</p>
        <button onClick={fetchAnalytics} className="btn btn-primary">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div id="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deconstructive Analytics</h1>
          <p className="page-subtitle">Deep dive into sales trends and product-specific revenue shares</p>
        </div>
        <button onClick={fetchAnalytics} className="btn" id="btn-refresh-analytics">
          <RefreshCw size={14} />
          <span>Reload Metrics</span>
        </button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="kpi-card" id="kpi-avg-transaction">
          <div className="kpi-header">
            <span className="kpi-title">Average Transaction Value</span>
            <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{formatCurrency(data.averageTransaction)}</div>
            <p style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '8px' }}>
              Mean capital exchange per sale ticket
            </p>
          </div>
        </div>

        <div className="kpi-card" id="kpi-top-category">
          <div className="kpi-header">
            <span className="kpi-title">Top Sector</span>
            <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Award size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '24px' }}>Software Solutions</div>
            <p style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '12px' }}>
              High margin recurring sector
            </p>
          </div>
        </div>
      </div>

      <div className="charts-grid-analytics">
        <div className="chart-card" id="combo-chart-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-card-title">Dual-Axis Monthly Revenue vs Volume Sold</h3>
          <div className="chart-wrapper">
            {comboChartData && (
              <Bar 
                data={comboChartData as any} 
                options={comboChartOptions as any} 
              />
            )}
          </div>
        </div>
      </div>

      <div className="card-table-container" id="top-products-table-card">
        <div className="table-header">
          <h2 className="table-title">Top 5 Best-Selling Products by Revenue</h2>
          <div className="badge badge-active">
            <AwardIcon size={14} style={{ marginRight: '4px' }} /> Top Performer
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Identifier</th>
                <th>Quantity Sold (Units)</th>
                <th>Revenue Generated</th>
                <th>Average Unit Value</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{formatNumber(p.itemsSold)} units</td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(p.revenue)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(p.revenue / p.itemsSold)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
