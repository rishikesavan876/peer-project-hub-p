import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProjectForm from '../components/ProjectForm';

export default function CreateProject() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/projects', data);
      navigate(`/projects/${res.data.data._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Share a New Project</h1>
      <p className="text-sm text-slate-500 mb-6">
        Show the community what you have been building
      </p>
      <ProjectForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish Project" error={error} />
    </div>
  );
}
