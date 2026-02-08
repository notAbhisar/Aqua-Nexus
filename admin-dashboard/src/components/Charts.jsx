const Charts = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
        Select a node on the map to view time-series data
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
      {selectedNode.node_type === 'urban' && (
        <p>Urban charts are available in the Urban dashboard view</p>
      )}
      {selectedNode.node_type === 'rural' && (
        <p>Rural charts are available in the Rural dashboard view</p>
      )}
      {selectedNode.node_type === 'industrial' && (
        <p>Industrial charts are available in the Industrial dashboard view</p>
      )}
    </div>
  );
};

export default Charts;
