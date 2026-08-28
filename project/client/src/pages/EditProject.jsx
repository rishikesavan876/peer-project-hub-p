import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProjectForm from '../components/ProjectForm';
import { useAuth } from '../context/authContext';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/projects/${id}`)
      .then((res) => {
        if (cancelled) return;
        if (profile && res.data.data.owner?._id !== profile._id) {
          setNotAllowed(true);
        }
        setProject(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load project');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, profile]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/projects/${id}`, data);
      navigate(`/projects/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="mt-6 h-64 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (notAllowed) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center py-16 bg-white rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Not your project</h1>
        <p className="mt-2 text-sm text-slate-500">You can only edit projects you created.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center py-16 bg-white rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">{error || 'Project not found'}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Project</h1>
      <p className="text-sm text-slate-500 mb-6">Update the details of your project</p>
      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
        error={error}
      />
    </div>
  );
}
