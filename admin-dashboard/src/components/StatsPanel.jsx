import { useEffect, useState } from 'react';
import axios from 'axios';

const StatsPanel = ({ activeContext }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [activeContext]); // Re-fetch when context changes

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = activeContext ? `/api/stats?context=${activeContext}` : '/api/stats';
      const response = await axios.get(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-16 bg-gray-200 rounded w-40 mb-6"></div>
          <div className="flex gap-4">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-lg mb-6">
            <h3 className="text-xl font-bold tracking-wide">NODES</h3>
          </div>
          
          {/* Main Count */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Nodes</p>
            <p className="text-6xl font-bold text-gray-900">{stats.total_nodes}</p>
          </div>
          
          {/* Status Breakdown */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-green-700">{stats.active_nodes} Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-semibold text-yellow-700">{stats.warning_nodes} Warning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-semibold text-red-700">{stats.critical_nodes} Critical</span>
            </div>
          </div>
        </div>
      </div>
      
      {stats.last_updated && (
        <div className="text-right text-sm text-gray-500">
          Last updated: {new Date(stats.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
