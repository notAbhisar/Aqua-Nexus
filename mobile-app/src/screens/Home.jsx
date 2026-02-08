const Home = ({ setCurrentScreen }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentScreen('submit')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-lg text-center transition"
          >
            <div className="text-3xl mb-2 font-bold text-blue-600">Report</div>
            <p className="font-semibold">Report Issue</p>
            <p className="text-sm text-blue-100">Submit a problem</p>
          </button>

          <button
            onClick={() => setCurrentScreen('nearby')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-6 rounded-lg shadow-lg text-center transition"
          >
            <div className="text-3xl mb-2 font-bold text-blue-600">Location</div>
            <p className="font-semibold">Nearby Issues</p>
            <p className="text-sm text-cyan-100">See reports</p>
          </button>
        </div>

        {/* Info Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3 text-gray-800">How it Works</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Spot a water quality issue in your area</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Click "Report Issue" and fill in details</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Add a photo and your location</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Submit and track the status</span>
            </li>
          </ol>
        </div>

        {/* Categories Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3 text-gray-800">Report Categories</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Leak:</strong> Water leaks or breaks in pipes</p>
            <p><strong>Pollution:</strong> Contamination or discoloration</p>
            <p><strong>Drought:</strong> Low water availability</p>
            <p><strong>Other:</strong> Other water quality issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
