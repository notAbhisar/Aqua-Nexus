import { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/Map';
import StatsPanel from './components/StatsPanel';
import Charts from './components/Charts';
import NodeDetail from './components/NodeDetail';
import AlertsFeed from './components/AlertsFeed';
import ContextSwitcher from './components/ContextSwitcher';
import SmartAlertSystem from './components/SmartAlertSystem';
import UrbanDashboard from './components/UrbanDashboard';
import RuralDashboard from './components/RuralDashboard';
import IndustrialDashboard from './components/IndustrialDashboard';

function App() {
  const [stats, setStats] = useState({});
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [contextFilter, setContextFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeContext, setActiveContext] = useState('urban'); // New: track active dashboard context
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'dashboard'

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, nodesRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/nodes/with-telemetry')
      ]);
      setStats(statsRes.data);
      setNodes(nodesRes.data);
      
      // Update selected node if it exists
      if (selectedNode) {
        const updatedNode = nodesRes.data.find(n => n.id === selectedNode.id);
        if (updatedNode) setSelectedNode(updatedNode);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleContextChange = (context) => {
    setActiveContext(context);
    setViewMode('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Aqua Nexus</h1>
              <p className="text-blue-100">Water Quality Monitoring System - Decision Support Brain</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-700'
                }`}
              >
                Map View
              </button>
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'dashboard' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-700'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Conditional Rendering: Dashboard View vs Map View */}
        {viewMode === 'dashboard' ? (
          // DASHBOARD VIEW - Context-aware dashboards
          <div>
            {/* Context Switcher - Dashboard only */}
            <div className="mb-6">
              <ContextSwitcher activeContext={activeContext} onContextChange={handleContextChange} />
            </div>

            {/* Smart Alert System - Dashboard only */}
            <div className="mb-6">
              <SmartAlertSystem activeContext={activeContext} />
            </div>

            {/* Stats Panel - Context-specific */}
            <div className="mb-6">
              <StatsPanel activeContext={activeContext} />
            </div>

            {/* Context-specific dashboards */}
            {activeContext === 'urban' && (
              <UrbanDashboard nodes={nodes} telemetry={stats.telemetry} />
            )}
            {activeContext === 'rural' && (
              <RuralDashboard nodes={nodes} telemetry={stats.telemetry} />
            )}
            {activeContext === 'industrial' && (
              <IndustrialDashboard nodes={nodes} telemetry={stats.telemetry} />
            )}
          </div>
        ) : (
          // MAP VIEW - Traditional map + alerts + details
          <>
            {/* Stats Panel */}
            <div className="mb-6">
              <StatsPanel activeContext={null} />
            </div>

            {/* Main Grid: Map + Alerts at same height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">{/*  Map - 2 columns */}
              <div className="lg:col-span-2 h-[600px]">
                <MapView 
                  nodes={nodes} 
                  selectedNode={selectedNode}
                  onNodeClick={handleNodeClick}
                  contextFilter={contextFilter}
                />
              </div>

              {/* Alerts - 1 column, same height as map */}
              <div className="h-[600px]">
                <AlertsFeed />
              </div>
            </div>

            {/* Node Detail Section - Full Width */}
            {selectedNode && (
              <div className="mb-6">
                <NodeDetail node={selectedNode} />
              </div>
            )}

            {/* Charts Section - Full Width */}
            {selectedNode && (
              <div>
                <Charts selectedNode={selectedNode} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2026 Aqua Nexus - Real-time Water Quality Monitoring & Decision Support</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
