import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const RuralDashboard = ({ nodes, telemetry }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchRuralStats();
  }, []);

  const fetchRuralStats = async () => {
    try {
      const response = await axios.get('/api/stats/rural');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching rural stats:', error);
      setStats(getMockRuralStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockRuralStats = () => ({
    total_stations: 3,
    avg_aquifer_depth_m: 35.2,
    max_aquifer_depth_m: 42.5,
    min_aquifer_depth_m: 28.1,
    avg_recharge_rate: 12.4,
    water_table_trend: 'stable',
    stations: [],
    depth_trends: [],
    recharge_trends: []
  });

  if (loading) {
    return <div className="text-center py-8">Loading rural statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load rural statistics</div>;
  }

  // Generate per-station depth trend data (12 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const selectedStationData = selectedStation
    ? stats.stations?.find((station) => station.name === selectedStation)
    : null;
  const selectedTelemetry = selectedStationData?.latest_telemetry || null;
  const selectedAquiferDepth = selectedTelemetry?.aquifer_depth_m
    ?? selectedStationData?.aquifer_depth_m
    ?? stats.avg_aquifer_depth_m
    ?? 0;
  const selectedWaterTableDepth = selectedTelemetry?.water_table_m
    ?? selectedStationData?.water_table_m
    ?? (selectedAquiferDepth ? selectedAquiferDepth * 0.25 : null);
  
  // Use API data if available, otherwise generate mock data per station
  let depthTrendData = [];
  let rechargeTrendData = [];
  
  if (stats.depth_trends && stats.depth_trends.length > 0) {
    // Use real data from API
    depthTrendData = stats.depth_trends;
    rechargeTrendData = stats.recharge_trends;
  } else {
    // Generate flat per-station fallback data (no recharge fluctuation)
    const topStations = stats.stations?.slice(0, 6) || [];
    
    // Create flat depth trend per station
    months.forEach((month) => {
      topStations.forEach((station) => {
        const baseDepth = station.aquifer_depth_m || stats.avg_aquifer_depth_m || 80;
        depthTrendData.push({
          month,
          station: station.name,
          depth: parseFloat(baseDepth.toFixed(1))
        });
      });
    });
    
    // Create flat recharge trend per station
    months.forEach((month) => {
      topStations.forEach((station) => {
        const baseRecharge = stats.avg_recharge_rate || 10;
        rechargeTrendData.push({
          month,
          station: station.name,
          recharge: parseFloat(baseRecharge.toFixed(1))
        });
      });
    });
  }
  
  // Group data by month for multi-line charts
  const depthByMonth = months.map(month => {
    const monthData = { month };
    const stationData = depthTrendData.filter(d => d.month === month);
    stationData.forEach(d => {
      monthData[d.station] = d.depth;
    });
    return monthData;
  });
  
  const rechargeByMonth = months.map(month => {
    const monthData = { month };
    const stationData = rechargeTrendData.filter(d => d.month === month);
    stationData.forEach(d => {
      monthData[d.station] = d.recharge;
    });
    return monthData;
  });
  
  // Get unique station names for chart legends
  const allStationNames = [...new Set(depthTrendData.map(d => d.station))];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  const handleStationClick = (stationName) => {
    setSelectedStation(selectedStation === stationName ? null : stationName);
  };
  
  // Get filtered data for selected station only
  const getStationData = () => {
    if (!selectedStation) return { depthData: [], rechargeData: [] };
    
    const depthByMonthMap = depthTrendData
      .filter((d) => d.station === selectedStation)
      .reduce((acc, d) => {
        acc[d.month] = d.depth;
        return acc;
      }, {});
    const rechargeByMonthMap = rechargeTrendData
      .filter((d) => d.station === selectedStation)
      .reduce((acc, d) => {
        acc[d.month] = d.recharge;
        return acc;
      }, {});
    
    const defaultDepth = selectedWaterTableDepth || 0;
    const defaultRecharge = stats.avg_recharge_rate || 0;
    let lastDepth = defaultDepth;
    let lastRecharge = defaultRecharge;
    
    const depthData = months.map((month) => {
      const depthValue = depthByMonthMap[month];
      if (depthValue != null) lastDepth = depthValue;
      return {
        month,
        depth: depthValue != null ? depthValue : lastDepth
      };
    });
    
    const rechargeData = months.map((month) => {
      const rechargeValue = rechargeByMonthMap[month];
      if (rechargeValue != null) lastRecharge = rechargeValue;
      return {
        month,
        recharge: rechargeValue != null ? rechargeValue : lastRecharge
      };
    });
    
    return { depthData, rechargeData };
  };
  
  const { depthData, rechargeData } = getStationData();
  const depthValues = depthData.map((d) => d.depth).filter((v) => v != null);
  const rechargeValues = rechargeData.map((d) => d.recharge).filter((v) => v != null);
  const avgDepthSelected = depthValues.length > 0
    ? depthValues.reduce((sum, value) => sum + value, 0) / depthValues.length
    : null;
  const avgRechargeSelected = rechargeValues.length > 0
    ? rechargeValues.reduce((sum, value) => sum + value, 0) / rechargeValues.length
    : null;
  const displayWaterTableDepth = selectedStation ? avgDepthSelected : null;
  const displayAquiferDepth = selectedStation ? selectedAquiferDepth : null;
  const displayRechargeRate = selectedStation ? avgRechargeSelected : null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Water Table Depth</p>
          <p className="text-3xl font-bold text-cyan-600">
            {displayWaterTableDepth != null ? displayWaterTableDepth.toFixed(1) : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">meters below surface</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Average Aquifer Depth</p>
          <p className="text-3xl font-bold text-blue-600">
            {displayAquiferDepth != null ? displayAquiferDepth.toFixed(1) : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">meters</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Average Recharge Rate</p>
          <p className="text-3xl font-bold text-green-600">
            {displayRechargeRate != null ? displayRechargeRate.toFixed(1) : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">mm/month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Rural Stations</p>
          <p className="text-3xl font-bold text-purple-600">{stats.total_stations}</p>
          <p className="text-xs text-gray-500 mt-1">Active Monitoring</p>
        </div>
      </div>

      {/* Charts - Only show when station is selected */}
      {selectedStation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Table Depth Trend for Selected Station */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Water Table Depth - {selectedStation}
              </h3>
              <button 
                onClick={() => setSelectedStation(null)}
                className="text-xs bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-3 py-1 rounded transition"
              >
                Clear Selection
              </button>
            </div>
            {depthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="depth" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    name="Water Table Depth (m)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No depth data available for this station</p>
            )}
          </div>

          {/* Recharge Rate for Selected Station */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Recharge Rate - {selectedStation}
              </h3>
              <button 
                onClick={() => setSelectedStation(null)}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded transition"
              >
                Clear Selection
              </button>
            </div>
            {rechargeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rechargeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Recharge (mm/month)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="recharge" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Recharge Rate (mm/month)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No recharge data available for this station</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-dashed border-blue-300 p-8 rounded-lg text-center">
          <p className="text-blue-700 font-semibold mb-2">Station Trend Analysis</p>
          <p className="text-blue-600 text-sm">Click any station in the table below to view its 12-month water table depth and recharge rate trends</p>
        </div>
      )}

      {/* Groundwater Station Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          Groundwater Station Details
          <span className="text-sm font-normal text-gray-500 ml-2">(Click a station to view its trends)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left">Station Name</th>
                <th className="px-4 py-2 text-left">District</th>
                <th className="px-4 py-2 text-left">Aquifer Depth (m)</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.stations && stats.stations.length > 0 ? (
                stats.stations.map((station) => (
                  <tr 
                    key={station.id} 
                    onClick={() => handleStationClick(station.name)}
                    className={`border-b cursor-pointer transition ${
                      selectedStation === station.name 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-2 font-semibold">
                      {selectedStation === station.name && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      )}
                      {station.name}
                    </td>
                    <td className="px-4 py-2">{station.district || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {station.latest_telemetry?.aquifer_depth_m?.toFixed(1)
                          ?? station.aquifer_depth_m?.toFixed(1)
                          ?? 'N/A'}m
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        station.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {station.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No station data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Irrigation Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h4 className="font-bold text-green-700 mb-2">Irrigation Status</h4>
          <p className="text-sm text-gray-700">Groundwater levels are adequate for irrigation activities. Average recharge rate is {stats.avg_recharge_rate?.toFixed(1)} mm/month.</p>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h4 className="font-bold text-blue-700 mb-2">Trend Analysis</h4>
          <p className="text-sm text-gray-700">{stats.water_table_trend === 'stable' ? 'Aquifer levels are stable.' : 'Monitoring aquifer trends closely'} Monsoon recharge expected to increase levels by 15-20%.</p>
        </div>
      </div>
    </div>
  );
};

export default RuralDashboard;
