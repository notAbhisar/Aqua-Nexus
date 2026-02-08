const MyReports = ({ reports }) => {
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

  return (
    <div className="p-4 max-w-2xl mx-auto pb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">My Reports</h2>

      {reports.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p>You haven't submitted any reports yet</p>
          <p className="text-sm mt-2">Help improve water quality by reporting issues!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start gap-3">
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                  {getCategoryLabel(report.category)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {report.category?.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>Lat: {report.latitude.toFixed(4)}, Lng: {report.longitude.toFixed(4)}</span>
                    <span>
                      {new Date(
                        report.submitted_at || report.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold border ${
                    getStatusColor(report.status)
                  }`}
                >
                  {report.status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
