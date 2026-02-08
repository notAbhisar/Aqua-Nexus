import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SmartAlertSystem = ({ activeContext = 'urban' }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [activeContext]); // Re-fetch when context changes

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`/api/alerts?context=${activeContext}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-50 border-red-300 text-red-700',
      warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
      info: 'bg-blue-50 border-blue-300 text-blue-700'
    };
    return colors[severity] || colors.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: 'CRITICAL',
      warning: 'WARNING',
      info: 'INFO'
    };
    return icons[severity] || icons.info;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Smart Alert System</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Smart Alert System</h2>
        {criticalCount > 0 && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
            {criticalCount} Critical
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-semibold">All systems operating normally</p>
          <p className="text-sm">No active alerts for this context</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded cursor-pointer transition-all ${getSeverityColor(alert.severity)}`}
              onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{backgroundColor: alert.severity === 'critical' ? '#fee2e2' : '#fef3c7'}}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <p className="font-bold">{alert.title}</p>
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                  {expandedId === alert.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <p className="text-xs mb-2">
                        <strong>Node:</strong> {alert.node_name}
                      </p>
                      <p className="text-xs mb-2">
                        <strong>Value:</strong> {alert.value} (Threshold: {alert.threshold})
                      </p>
                      <p className="text-xs mb-3">
                        <strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button className="text-xs px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium">
                          Clear
                        </button>
                        <button className="text-xs px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
                          Address Issue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartAlertSystem;
