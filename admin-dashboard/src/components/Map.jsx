import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const colors = {
    normal: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280',
  };
  
  const statusLower = status?.toLowerCase() || 'normal';
  const color = colors[statusLower] || colors.normal;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapView = ({ nodes, selectedNode, onNodeClick, contextFilter }) => {
  const [center, setCenter] = useState([28.5, 77.1]); // Delhi NCR region
  const [zoom, setZoom] = useState(11);

  // Filter nodes by context
  const filteredNodes = contextFilter === 'all' 
    ? nodes 
    : nodes.filter(node => node.context_mode === contextFilter);

  // Auto-center map when filter changes
  useEffect(() => {
    if (filteredNodes.length > 0) {
      const avgLat = filteredNodes.reduce((sum, n) => sum + n.latitude, 0) / filteredNodes.length;
      const avgLng = filteredNodes.reduce((sum, n) => sum + n.longitude, 0) / filteredNodes.length;
      setCenter([avgLat, avgLng]);
      setZoom(filteredNodes.length === 1 ? 13 : 11);
    }
  }, [contextFilter, filteredNodes.length]);

  return (
    <div className="h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-full"
        key={`${center[0]}-${center[1]}-${zoom}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredNodes.map((node) => {
          // Use status directly from backend
          const displayStatus = node.status || 'normal';

          return (
          <Marker
            key={node.id}
            position={[node.latitude, node.longitude]}
            icon={createCustomIcon(displayStatus)}
            eventHandlers={{
              click: () => onNodeClick(node),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs">
                <p className="font-bold">{node.name}</p>
                <p className={`text-xs ${
                  displayStatus === 'normal' ? 'text-green-600' :
                  displayStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {displayStatus.toUpperCase()}
                </p>
                {node.latest_telemetry && node.latest_telemetry.flow_rate != null && (
                  <p className="text-gray-600 mt-1">
                    Flow: {node.latest_telemetry.flow_rate.toFixed(1)} L/s
                  </p>
                )}
              </div>
            </Tooltip>
          </Marker>
        );})}
      </MapContainer>
    </div>
  );
};

export default MapView;
