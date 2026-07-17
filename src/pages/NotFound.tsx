import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-container" id="not-found-page">
      <div style={{ color: '#ef4444', marginBottom: '16px' }}>
        <AlertCircle size={72} />
      </div>
      <div className="error-code">404</div>
      <h2 className="error-title">Page Not Found</h2>
      <p className="error-description">
        We could not locate the business intelligence directory or analytics reporting page you were searching for. Please check the URL or click the button below to return to the Home Dashboard.
      </p>
      <Link to="/" className="btn btn-primary" id="btn-return-home" style={{ textDecoration: 'none' }}>
        <Home size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
