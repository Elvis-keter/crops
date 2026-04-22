import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';
import api from '../services/api';

export function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    current_stage: '',
    notes: '',
  });
  const [agents, setAgents] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    assigned_to: '',
  });

  const stages = ['Planted', 'Growing', 'Ready', 'Harvested'];

  useEffect(() => {
    fetchField();
    if (user?.role === 'Admin') {
      fetchAgents();
    }
  }, [id, user]);

  const fetchField = async () => {
    try {
      const response = await api.get(`/fields/${id}`);
      setField(response.data);
      setFormData({
        current_stage: response.data.current_stage,
        notes: response.data.notes || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch field:', error);
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateField = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/fields/${id}`, formData);
      await fetchField();
      alert('Field updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/fields/${id}/assign`, assignFormData);
      await fetchField();
      setShowAssignForm(false);
      setAssignFormData({ assigned_to: '' });
      alert('Agent assigned successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign agent');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading field details...</p>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Field not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
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
            <button
              onClick={() => navigate(-1)}
              className="text-green-600 hover:text-green-800 font-medium mb-2"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
          </div>
          <span className={`px-4 py-2 rounded-full border ${getStatusColor(field.status)} font-medium`}>
            {field.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Field Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Information</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Crop Type</p>
                  <p className="text-gray-900 font-medium">{field.crop_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Planting Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(field.planting_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Assigned Agent</p>
                  <p className="text-gray-900 font-medium">{field.agent_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Last Updated</p>
                  <p className="text-gray-900 font-medium">
                    {field.last_updated ? new Date(field.last_updated).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Form - Only for agents or admin */}
            {(user?.role === 'Agent' || user?.role === 'Admin') && (
              <form onSubmit={handleUpdateField} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Field</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage
                  </label>
                  <select
                    name="current_stage"
                    value={formData.current_stage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes / Observations
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add any observations or notes about the field..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-medium"
                >
                  {saving ? 'Saving...' : 'Save Update'}
                </button>
              </form>
            )}
          </div>

          {/* Admin Controls */}
          {user?.role === 'Admin' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>

                <button
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium mb-4"
                >
                  {showAssignForm ? 'Cancel' : 'Assign Agent'}
                </button>

                {showAssignForm && (
                  <form onSubmit={handleAssignAgent} className="border-t border-gray-200 pt-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Agent
                      </label>
                      <select
                        name="assigned_to"
                        value={assignFormData.assigned_to}
                        onChange={handleAssignChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Choose an agent --</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-medium"
                    >
                      {saving ? 'Assigning...' : 'Assign'}
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Field Timeline</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(field.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {field.last_updated && (
                      <div>
                        <p className="text-gray-600">Last Modified</p>
                        <p className="font-medium text-gray-900">
                          {new Date(field.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
