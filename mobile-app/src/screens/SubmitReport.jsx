import { useState } from 'react';
import axios from 'axios';

const SubmitReport = ({ userLocation, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: 'leak',
    reporter_name: '',
    reporter_contact: '',
  });
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(userLocation);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhotoSelect = (e) => {
    setPhoto(e.target.files[0]);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Could not get location: ' + error.message);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.description.trim()) {
      setError('Please describe the issue');
      return;
    }

    if (!location) {
      setError('Location is required. Please enable location services');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = null;

      // Encode photo to base64 if present
      if (photo) {
        photoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(photo);
        });
      }

      const submitData = {
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
        photo_url: photoUrl,
      };

      const response = await axios.post('/api/report', submitData, {
        timeout: 30000,
      });
      setSuccess(true);
      setFormData({
        description: '',
        category: 'leak',
        reporter_name: '',
        reporter_contact: '',
      });
      setPhoto(null);

      onReportSubmitted({
        ...response.data,
        submitted_at: new Date().toISOString(),
      });

      setTimeout(() => {
        alert('Report submitted successfully!');
      }, 500);
    } catch (err) {
      setError('Failed to submit report: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Issue Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe the water quality issue..."
            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            minLength="10"
          />
        </div>

        {/* Category */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="leak">Leak</option>
            <option value="pollution">Pollution</option>
            <option value="drought">Drought</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {photo && (
            <p className="text-sm text-green-600 mt-2 font-medium">Selected: {photo.name}</p>
          )}
        </div>

        {/* Location */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Location *
          </label>
          {location ? (
            <div className="text-sm text-gray-700 p-3 bg-green-50 rounded border border-green-300">
              <p className="font-medium">Location captured</p>
              <p className="text-xs text-gray-600 mt-1">
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
              </p>
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                Update Location
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={getLocation}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
            >
              Get My Location
            </button>
          )}
        </div>

        {/* Reporter Info */}
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <h3 className="font-semibold text-gray-700">Your Information (optional)</h3>
          <input
            type="text"
            placeholder="Your name"
            value={formData.reporter_name}
            onChange={(e) =>
              setFormData({ ...formData, reporter_name: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your email or phone"
            value={formData.reporter_contact}
            onChange={(e) =>
              setFormData({ ...formData, reporter_contact: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded">
            Report submitted successfully!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default SubmitReport;
