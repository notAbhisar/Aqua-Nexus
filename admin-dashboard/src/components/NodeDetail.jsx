import { useEffect, useState } from 'react';
import axios from 'axios';

const NodeDetail = ({ node }) => {
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node) {
      fetchLatestTelemetry();
    }
  }, [node]);

  const fetchLatestTelemetry = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/telemetry/node/${node.id}/latest`);
      setLatestTelemetry(response.data);
    } catch (error) {
      console.error('Error fetching latest telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!node) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{node.name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          node.status?.toLowerCase() === 'normal' ? 'bg-green-100 text-green-800' :
          node.status?.toLowerCase() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {node.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Node Type</p>
          <p className="font-semibold">{node.node_type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Context Mode</p>
          <p className="font-semibold capitalize">{node.context_mode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Latitude</p>
          <p className="font-semibold">{node.latitude.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Longitude</p>
          <p className="font-semibold">{node.longitude.toFixed(6)}</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : latestTelemetry ? (
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Latest Telemetry</h3>
          {node.node_type === 'urban' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Flow Rate</p>
                <p className="text-lg font-bold text-blue-600">{latestTelemetry.flow_rate?.toFixed(2) ?? 'N/A'} L/s</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-xs text-gray-600">Pressure</p>
                <p className="text-lg font-bold text-purple-600">{latestTelemetry.pressure?.toFixed(2) ?? 'N/A'} PSI</p>
              </div>
              <div className="bg-red-50 p-3 rounded col-span-2">
                <p className="text-xs text-gray-600">Turbidity</p>
                <p className="text-lg font-bold text-red-600">{latestTelemetry.turbidity?.toFixed(2) ?? 'N/A'} NTU</p>
              </div>
            </div>
          )}

          {node.node_type === 'rural' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Aquifer Depth</p>
                <p className="text-lg font-bold text-blue-600">{latestTelemetry.aquifer_depth_m?.toFixed(2) ?? 'N/A'} m</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded">
                <p className="text-xs text-gray-600">Water Table Depth</p>
                <p className="text-lg font-bold text-cyan-600">{latestTelemetry.water_table_m?.toFixed(2) ?? 'N/A'} m</p>
              </div>
              <div className="bg-green-50 p-3 rounded col-span-2">
                <p className="text-xs text-gray-600">Recharge Rate</p>
                <p className="text-lg font-bold text-green-600">{latestTelemetry.recharge_rate?.toFixed(2) ?? 'N/A'} mm/month</p>
              </div>
            </div>
          )}

          {node.node_type === 'industrial' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-xs text-gray-600">pH Level</p>
                <p className="text-lg font-bold text-green-600">{latestTelemetry.ph_level?.toFixed(2) ?? 'N/A'}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <p className="text-xs text-gray-600">Temperature</p>
                <p className="text-lg font-bold text-orange-600">{latestTelemetry.temperature?.toFixed(2) ?? 'N/A'} °C</p>
              </div>
              <div className="bg-red-50 p-3 rounded col-span-2">
                <p className="text-xs text-gray-600">Turbidity</p>
                <p className="text-lg font-bold text-red-600">{latestTelemetry.turbidity?.toFixed(2) ?? 'N/A'} NTU</p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Last reading: {new Date(latestTelemetry.timestamp).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No telemetry data available</p>
      )}
    </div>
  );
};

export default NodeDetail;
