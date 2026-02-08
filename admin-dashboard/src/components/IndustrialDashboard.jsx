import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const IndustrialDashboard = ({ nodes, telemetry }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFacility, setExpandedFacility] = useState(null);

  useEffect(() => {
    fetchIndustrialStats();
  }, []);

  const fetchIndustrialStats = async () => {
    try {
      const response = await axios.get('/api/stats/industrial');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching industrial stats:', error);
      setStats(getMockIndustrialStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockIndustrialStats = () => ({
    total_facilities: 3,
    compliance_score: 65,
    total_violations: 5,
    critical_violations: 2,
    avg_ph: 7.5,
    violations_by_type: {},
    facilities: []
  });

  if (loading) {
    return <div className="text-center py-8">Loading industrial statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load industrial statistics</div>;
  }

  const getPhStatus = (phLevel) => {
    if (phLevel == null) return 'unknown';
    if (phLevel < 6.0 || phLevel > 9.0) return 'critical';
    if (phLevel < 6.5 || phLevel > 8.5) return 'warning';
    return 'normal';
  };

  const buildViolations = (facility) => {
    const phLevel = facility.latest_telemetry?.ph_level ?? null;
    const status = getPhStatus(phLevel);
    return [
      {
        parameter: 'pH',
        measured: phLevel != null ? phLevel.toFixed(2) : 'N/A',
        limit: '6.5-8.5',
        status
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Total Facilities</p>
          <p className="text-3xl font-bold text-purple-600">{stats.total_facilities}</p>
          <p className="text-xs text-gray-500 mt-1">Active Monitoring</p>
        </div>

        <div className={`bg-gradient-to-br ${stats.compliance_score >= 80 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} p-6 rounded-lg shadow`}>
          <p className="text-sm text-gray-600 mb-2">Compliance Score</p>
          <p className={`text-3xl font-bold ${stats.compliance_score >= 80 ? 'text-green-600' : 'text-red-600'}`}>{stats.compliance_score}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.compliance_score >= 80 ? 'Good Standing' : 'Requires Action'}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Active Violations</p>
          <p className="text-3xl font-bold text-red-600">{stats.total_violations}</p>
          <p className="text-xs text-gray-500 mt-1">Warnings + Critical</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-2">Average pH</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avg_ph?.toFixed(1) || 7.0}</p>
          <p className="text-xs text-gray-500 mt-1">Neutral (6.5-8.5 optimal)</p>
        </div>
      </div>

      {/* Compliance Status by Facility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameter Compliance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Parameter Compliance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(stats.facilities || []).map((facility) => ({
              name: facility.name,
              ph: facility.latest_telemetry?.ph_level ?? null
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide={true} />
              <YAxis domain={[0, 14]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ph" name="pH (latest)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Violation Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Violation Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { label: 'Warnings', violations: stats.total_violations - stats.critical_violations },
              { label: 'Critical', violations: stats.critical_violations }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} name="Incident Count" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Facility Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Industrial Facilities - Compliance Details</h3>
        <div className="space-y-4">
          {stats.facilities && stats.facilities.length > 0 ? (
            stats.facilities.map((facility) => {
              const violations = buildViolations(facility);
              const violationCount = violations.filter(v => v.status === 'warning' || v.status === 'critical').length;
              const isCompliant = violationCount === 0;

              return (
                <div
                  key={facility.id}
                  className="border rounded-lg overflow-hidden"
                  onClick={() => setExpandedFacility(expandedFacility === facility.id ? null : facility.id)}
                >
                  <div className={`p-4 cursor-pointer ${isCompliant ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{facility.name}</p>
                        <p className="text-sm text-gray-600">
                          Type: <span className="font-semibold capitalize">{facility.facility_type || 'Unknown'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isCompliant ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                        }`}>
                          {isCompliant ? 'Compliant' : `${violationCount} Violations`}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Last Inspection: {facility?.last_inspection ? new Date(facility.last_inspection).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedFacility === facility.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-700 mb-3">Current Parameter Status:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {violations.map((v, idx) => (
                            <div key={idx} className={`p-3 rounded text-center text-xs ${
                              v.status === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : v.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : v.status === 'normal'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                              <p className="font-bold">{v.parameter}</p>
                              <p className="text-xs">{v.measured}/{v.limit}</p>
                              <p className="text-xs mt-1">
                                {v.status === 'critical'
                                  ? 'Critical'
                                  : v.status === 'warning'
                                    ? 'Warning'
                                    : v.status === 'normal'
                                      ? 'OK'
                                      : 'N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                            View Report
                          </button>
                          <button className="text-xs px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                            Schedule Inspection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">No facilities data available</p>
          )}
        </div>
      </div>

      {/* Regulatory Reference */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h4 className="font-bold text-blue-700 mb-2">CPCB Schedule VI Standards</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold">pH</p>
            <p>6.0 - 8.0</p>
          </div>
          <div>
            <p className="font-semibold">BOD</p>
            <p>&lt; 30 mg/L</p>
          </div>
          <div>
            <p className="font-semibold">COD</p>
            <p>&lt; 100 mg/L</p>
          </div>
          <div>
            <p className="font-semibold">TSS</p>
            <p>&lt; 50 mg/L</p>
          </div>
          <div>
            <p className="font-semibold">Turbidity</p>
            <p>&lt; 5.0 NTU</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrialDashboard;
