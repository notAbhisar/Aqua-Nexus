import { useState, useEffect } from 'react';
import axios from 'axios';

const NearbyReports = ({ userLocation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNearbyReports();
  }, [userLocation]);

  const fetchNearbyReports = async () => {
    if (!userLocation) {
      setError('Location required to find nearby reports');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/reports/nearby', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_km: 5,
        },
      });
      setReports(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load nearby reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      leak: 'Leak',
      pollution: 'Pollution',
      drought: 'Drought',
      other: 'Other',
    };
    return labels[category] || 'Report';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-300 text-yellow-700',
      investigating: 'bg-blue-50 border-blue-300 text-blue-700',
      resolved: 'bg-green-50 border-green-300 text-green-700',
      rejected: 'bg-red-50 border-red-300 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-600">Loading nearby reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
          {error}
        </div>
        <button
          onClick={fetchNearbyReports}
          className="mt-4 w-full p-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Nearby Reports</h2>

      {reports.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p>No reports in your area</p>
          <p className="text-sm mt-2">Be the first to report an issue!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const distance = userLocation
              ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  report.latitude,
                  report.longitude
                )
              : 'N/A';

            return (
              <div key={report.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start gap-3">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                    {getCategoryLabel(report.category)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {report.category.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{distance} km away</span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {report.reporter_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reported by: {report.reporter_name}
                      </p>
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold border ${
                      getStatusColor(report.status)
                    }`}
                  >
                    {report.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={fetchNearbyReports}
        className="mt-6 w-full p-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600"
      >
        Refresh
      </button>
    </div>
  );
};

export default NearbyReports;
