import { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext.jsx';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export function AgentDashboard() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    atRisk: 0,
    completed: 0,
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await api.get('/fields/agent/assigned');
      setFields(response.data);
      calculateStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      setLoading(false);
    }
  };

  const calculateStats = (fieldsList) => {
    const stats = {
      total: fieldsList.length,
      active: fieldsList.filter(f => f.status === 'Active').length,
      atRisk: fieldsList.filter(f => f.status === 'At Risk').length,
      completed: fieldsList.filter(f => f.status === 'Completed').length,
    };
    setStats(stats);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Planted':
        return 'text-blue-600';
      case 'Growing':
        return 'text-yellow-600';
      case 'Ready':
        return 'text-orange-600';
      case 'Harvested':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SmartSeason Field Agent</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">My Fields</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">At Risk</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.atRisk}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
        </div>

        {/* Fields List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Fields</h2>
          </div>
          
          {fields.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No fields assigned yet. Check back soon!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {fields.map((field) => (
                <div key={field.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                      <p className="text-sm text-gray-600">{field.crop_type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border ${getStatusColor(field.status)} text-xs font-medium`}>
                      {field.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stage</p>
                      <p className={`font-medium ${getStageColor(field.current_stage)}`}>
                        {field.current_stage}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Planted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(field.planting_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {field.last_updated ? new Date(field.last_updated).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {field.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-green-500">
                      <p className="text-sm text-gray-700"><strong>Notes:</strong> {field.notes}</p>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/field/${field.id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Update Field
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
