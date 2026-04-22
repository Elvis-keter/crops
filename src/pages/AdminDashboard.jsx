import { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext.jsx';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
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
      const response = await api.get('/fields');
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
          <p className="text-gray-600">Loading fields...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">SmartSeason Admin</h1>
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
            <p className="text-gray-600 text-sm">Total Fields</p>
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

        {/* Actions */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/create-field')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            + Create Field
          </button>
        </div>

        {/* Fields Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Fields</h2>
          </div>
          
          {fields.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No fields yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crop</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stage</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Agent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{field.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{field.crop_type}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${getStageColor(field.current_stage)}`}>
                        {field.current_stage}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full border ${getStatusColor(field.status)} text-xs font-medium`}>
                          {field.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {field.agent_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/field/${field.id}`)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
