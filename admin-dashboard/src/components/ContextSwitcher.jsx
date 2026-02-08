import React from 'react';

const ContextSwitcher = ({ activeContext, onContextChange }) => {
  const contexts = [
    {
      id: 'urban',
      label: 'Urban Planners',
      description: 'Flow distribution & demand patterns',
      icon: 'URBAN'
    },
    {
      id: 'rural',
      label: 'Rural Irrigation',
      description: 'Aquifer depth & recharge rates',
      icon: 'RURAL'
    },
    {
      id: 'industrial',
      label: 'Industrial Auditors',
      description: 'Effluent compliance & violations',
      icon: 'INDUSTRIAL'
    }
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Context Mode</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contexts.map((context) => (
          <button
            key={context.id}
            onClick={() => onContextChange(context.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeContext === context.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-xl font-bold mb-2 text-blue-600">{context.icon}</div>
            <p className="font-bold text-gray-800">{context.label}</p>
            <p className="text-sm text-gray-600">{context.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextSwitcher;
