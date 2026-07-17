import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { DashboardData } from '../types.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  darkMode: boolean;
}

export default function Dashboard({ darkMode }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/dashboard');
      if (response.data.success) {
        setData(response.data);
      } else {
        setError('Failed to fetch dashboard metrics.');
      }
    } catch (err: any) {
      setError('Error communicating with backend database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Adjust chart styling dynamically based on dark mode state
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#f1f5f9';

  // Common options for line & bar charts
  const getChartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1e293b' : '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
      }
    }
  });

  const getPieOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12 },
          padding: 16
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
    }
  });

  // Prepare chart datasets
  const lineChartData = data ? {
    labels: data.salesTrend.map(t => t.month),
    datasets: [
      {
        fill: true,
        label: 'Monthly Sales Revenue ($)',
        data: data.salesTrend.map(t => t.amount),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#2563eb',
        pointHoverRadius: 6
      }
    ]
  } : null;

  const barChartData = data ? {
    labels: data.categoryRevenue.map(c => c.category),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.categoryRevenue.map(c => c.amount),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        borderRadius: 6
      }
    ]
  } : null;

  const pieChartData = data ? {
    labels: data.customerDistribution.map(d => d.status),
    datasets: [
      {
        data: data.customerDistribution.map(d => d.count),
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: darkMode ? 2 : 1,
        borderColor: darkMode ? '#1e293b' : '#ffffff'
      }
    ]
  } : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontSize: '15px', color: '#64748b' }}>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error || 'Could not load data.'}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div id="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Overview</h1>
          <p className="page-subtitle">Real-time indicators and performance summaries</p>
        </div>
        <button onClick={fetchDashboardData} className="btn" id="btn-refresh-dashboard">
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Display Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" id="kpi-revenue">
          <div className="kpi-header">
            <span className="kpi-title">Total Revenue</span>
            <div className="kpi-icon-container">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{formatCurrency(kpis.totalRevenue)}</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={14} />
              <span>Cumulative Earnings</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" id="kpi-sales">
          <div className="kpi-header">
            <span className="kpi-title">Items Sold</span>
            <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{formatNumber(kpis.totalSales)}</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={14} />
              <span>Total volume transacted</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" id="kpi-customers">
          <div className="kpi-header">
            <span className="kpi-title">Total Customers</span>
            <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{formatNumber(kpis.totalCustomers)}</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={14} />
              <span>Database records count</span>
            </div>
          </div>
        </div>

        <div className="kpi-card" id="kpi-growth">
          <div className="kpi-header">
            <span className="kpi-title">Growth (July)</span>
            <div className="kpi-icon-container" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">
              {kpis.monthlyGrowth >= 0 ? '+' : ''}{kpis.monthlyGrowth}%
            </div>
            <div className={`kpi-trend ${kpis.monthlyGrowth >= 0 ? 'trend-up' : 'trend-down'}`}>
              {kpis.monthlyGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>vs prior month (June)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Display Grid */}
      <div className="charts-grid">
        <div className="chart-card" id="chart-sales-trend">
          <h3 className="chart-card-title">Sales Revenue Trend (Line Chart)</h3>
          <div className="chart-wrapper">
            {lineChartData && (
              <Line 
                data={lineChartData} 
                options={getChartOptions('Sales Revenue Trend')} 
              />
            )}
          </div>
        </div>

        <div className="chart-card" id="chart-customer-distribution">
          <h3 className="chart-card-title">Customer Status Distribution</h3>
          <div className="chart-wrapper">
            {pieChartData && (
              <Pie 
                data={pieChartData} 
                options={getPieOptions()} 
              />
            )}
          </div>
        </div>
      </div>

      <div className="charts-grid-analytics">
        <div className="chart-card" id="chart-revenue-category" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-card-title">Revenue by Product Category (Bar Chart)</h3>
          <div className="chart-wrapper">
            {barChartData && (
              <Bar 
                data={barChartData} 
                options={getChartOptions('Revenue by Category')} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
