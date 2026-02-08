import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UrbanDashboard = ({ nodes, telemetry }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchUrbanStats();
  }, []);

  useEffect(() => {
    // Auto-select first node when stats load
    if (stats && stats.nodes && stats.nodes.length > 0 && !selectedNode) {
      setSelectedNode(stats.nodes[0].name);
    }
  }, [stats, selectedNode]);

  const fetchUrbanStats = async () => {
    try {
      const response = await axios.get('/api/stats/urban');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching urban stats:', error);
      // Fallback to mock data if API fails
      setStats(getMockUrbanStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockUrbanStats = () => ({
    total_nodes: 3,
    avg_flow_rate: 125.4,
    avg_pressure: 2.5,
    water_loss_percentage: 8.2,
    districts: {
      'Delhi': { nodes: 1, flow: 130 },
      'Gurugram': { nodes: 1, flow: 120 },
      'Noida': { nodes: 1, flow: 125 }
    },
    nodes: []
  });

  if (loading) {
    return <div className="text-center py-8">Loading urban statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load urban statistics</div>;
  }

  // Prepare chart data
  const districtData = Object.entries(stats.districts || {}).map(([name, data]) => ({
    name,
    flow: Math.round(data.flow || 0),
    demand: Math.round((data.flow || 0) * 0.85)
  }));

  const waterLoss = stats.water_loss_percentage || 0;
  const lossData = [
    { name: 'Delivered', value: 100 - waterLoss },
    { name: 'Lost (Leakage)', value: waterLoss }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  // Process telemetry trend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const flowTrendData = stats.flow_trends || [];
  const pressureTrendData = stats.pressure_trends || [];
  
  const selectedNodeData = selectedNode
    ? stats.nodes?.find((node) => node.name === selectedNode)
    : null;
  const selectedTelemetry = selectedNodeData?.latest_telemetry || null;
  
  // Get selected node stats
  const displayFlowRate = selectedTelemetry?.flow_rate ?? 0;
  const displayPressure = selectedTelemetry?.pressure ?? 0;
  
  // Handle node selection
  const handleNodeChange = (event) => {
    setSelectedNode(event.target.value);
  };
  
  // Get filtered data for selected node only
  const getNodeData = () => {
    if (!selectedNode) return { flowData: [], pressureData: [] };
    
    // Filter for selected node
    const flowByMonthMap = flowTrendData
      .filter((d) => d.node === selectedNode)
      .reduce((acc, d) => {
        acc[d.month] = d.flow;
        return acc;
      }, {});
    const pressureByMonthMap = pressureTrendData
      .filter((d) => d.node === selectedNode)
      .reduce((acc, d) => {
        acc[d.month] = d.pressure;
        return acc;
      }, {});
    
    const defaultFlow = stats.avg_flow_rate || 0;
    const defaultPressure = stats.avg_pressure || 0;
    let lastFlow = defaultFlow;
    let lastPressure = defaultPressure;
    
    const flowData = months.map((month) => {
      const flowValue = flowByMonthMap[month];
      if (flowValue != null) lastFlow = flowValue;
      return {
        month,
        flow: flowValue != null ? flowValue : lastFlow
      };
    });
    
    const pressureData = months.map((month) => {
      const pressureValue = pressureByMonthMap[month];
      if (pressureValue != null) lastPressure = pressureValue;
      return {
        month,
        pressure: pressureValue != null ? pressureValue : lastPressure
      };
    });
    
    return { flowData, pressureData };
  };
  
  const { flowData, pressureData } = getNodeData();
  const allNodeNames = stats.nodes?.map(n => n.name) || [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];


  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Flow Rate</p>
          <p className="text-3xl font-bold text-blue-600">
            {displayFlowRate?.toFixed(1) || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">m³/hr</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Pressure</p>
          <p className="text-3xl font-bold text-green-600">
            {displayPressure?.toFixed(2) || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Bar</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Water Loss</p>
          <p className="text-3xl font-bold text-red-600">{stats.water_loss_percentage?.toFixed(1) || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Leakage Rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Urban Nodes</p>
          <p className="text-3xl font-bold text-purple-600">{stats.total_nodes}</p>
          <p className="text-xs text-gray-500 mt-1">Active Monitoring</p>
        </div>
      </div>

      {/* Node Selection Dropdown */}
      {allNodeNames.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <label htmlFor="node-select" className="block text-sm font-semibold text-gray-700 mb-2">
            Select Node:
          </label>
          <select
            id="node-select"
            value={selectedNode || ''}
            onChange={handleNodeChange}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
          >
            {allNodeNames.map((nodeName) => (
              <option key={nodeName} value={nodeName}>
                {nodeName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow Rate Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Flow Rate Trend - {selectedNode || 'Select a Node'}
          </h3>
          {flowData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'm³/hr', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="flow"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFlow)"
                  name="Flow Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No flow rate trend data available</p>
          )}
        </div>

        {/* Pressure Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Pressure Trend - {selectedNode || 'Select a Node'}
          </h3>
          {pressureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pressureData}>
                <defs>
                  <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Bar', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="pressure"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPressure)"
                  name="Pressure"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No pressure trend data available</p>
          )}
        </div>
      </div>

      {/* Flow Distribution by District */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Flow Distribution by District</h3>
        {districtData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="flow" fill="#3b82f6" name="Actual Flow (m³/hr)" />
              <Bar dataKey="demand" fill="#8b5cf6" name="Demand (m³/hr)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No district data available</p>
        )}
      </div>

      {/* Districts Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">District-wise Flow Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left">District</th>
                <th className="px-4 py-2 text-left">Nodes Count</th>
                <th className="px-4 py-2 text-left">Avg Flow Rate (m³/hr)</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.districts || {}).map(([district, data]) => (
                <tr key={district} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">{district}</td>
                  <td className="px-4 py-2">{data.nodes}</td>
                  <td className="px-4 py-2">{data.flow.toFixed(1)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      data.flow > 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {data.flow > 100 ? 'Normal' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UrbanDashboard;
