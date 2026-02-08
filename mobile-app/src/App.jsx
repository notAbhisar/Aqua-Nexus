import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SubmitReport from './screens/SubmitReport';
import NearbyReports from './screens/NearbyReports';
import MyReports from './screens/MyReports';
import Home from './screens/Home';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userLocation, setUserLocation] = useState(null);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.log('Geolocation error:', error)
      );
    }

    // Load user's reports from localStorage
    const stored = localStorage.getItem('userReports');
    if (stored) {
      setUserReports(JSON.parse(stored));
    }
  }, []);

  const handleReportSubmitted = (newReport) => {
    const updated = [...userReports, newReport];
    setUserReports(updated);
    localStorage.setItem('userReports', JSON.stringify(updated));
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {currentScreen === 'home' && <Home setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'submit' && (
          <SubmitReport
            userLocation={userLocation}
            onReportSubmitted={handleReportSubmitted}
          />
        )}
        {currentScreen === 'nearby' && <NearbyReports userLocation={userLocation} />}
        {currentScreen === 'myreports' && <MyReports reports={userReports} />}
      </main>
    </div>
  );
}

export default App;
