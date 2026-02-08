const Header = ({ currentScreen, setCurrentScreen }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg sticky top-0 z-10">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold">Aqua Reporter</h1>
        <p className="text-sm text-blue-100">Report water quality issues</p>
      </div>

      <nav className="bg-blue-700 bg-opacity-50 px-4 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`px-3 py-2 rounded text-sm font-semibold whitespace-nowrap ${
            currentScreen === 'home'
              ? 'bg-white text-blue-600'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentScreen('submit')}
          className={`px-3 py-2 rounded text-sm font-semibold whitespace-nowrap ${
            currentScreen === 'submit'
              ? 'bg-white text-blue-600'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          Report Issue
        </button>
        <button
          onClick={() => setCurrentScreen('nearby')}
          className={`px-3 py-2 rounded text-sm font-semibold whitespace-nowrap ${
            currentScreen === 'nearby'
              ? 'bg-white text-blue-600'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          Nearby Reports
        </button>
        <button
          onClick={() => setCurrentScreen('myreports')}
          className={`px-3 py-2 rounded text-sm font-semibold whitespace-nowrap ${
            currentScreen === 'myreports'
              ? 'bg-white text-blue-600'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          My Reports
        </button>
      </nav>
    </header>
  );
};

export default Header;
