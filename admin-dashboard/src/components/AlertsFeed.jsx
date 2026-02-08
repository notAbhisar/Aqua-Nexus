import { useEffect, useState } from 'react';
import axios from 'axios';

const AlertsFeed = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cacheHeaders = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const [reportsRes, alertsRes] = await Promise.all([
        axios.get('/api/reports?limit=10', cacheHeaders),
        axios.get('/api/alerts', cacheHeaders) // Get all alerts (no context filter for map view)
      ]);
      
      // Sort reports by created_at (most recent first)
      const sortedReports = (reportsRes.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      
      // Sort alerts by timestamp (most recent first)
      const sortedAlerts = (alertsRes.data.alerts || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setReports(sortedReports);
      setAlerts(sortedAlerts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">System Alerts</h2>
      <div className="overflow-y-auto flex-1">
      
      {alerts.length === 0 && reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2 font-bold text-green-600">OK</p>
          <p>All systems operating normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Node Status Alerts from API */}
          {alerts.map((alert) => (
            <div 
              key={`alert-${alert.id}`}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="mr-3">Value: {alert.value}</span>
                    <span>Threshold: {alert.threshold}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {/* Citizen Reports */}
          {reports.map((report) => (
            <div 
              key={`report-${report.id}`}
              className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">Citizen Report</p>
                  <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Category: {report.category} • Status: {report.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AlertsFeed;
