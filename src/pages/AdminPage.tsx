import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Marathon, Workout, UserMetric } from '../types';
import { Plus, Edit2, Trash2, Users, BarChart3, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPage = () => {
  const [marathons, setMarathons] = useState<Marathon[]>([]);
  const [selectedMarathonId, setSelectedMarathonId] = useState<string>('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedMarathonId) {
      fetchWorkouts(selectedMarathonId);
    }
  }, [selectedMarathonId]);

  const fetchInitialData = async () => {
    const { data: mData } = await supabase.from('marathons').select('*').order('date', { ascending: true });
    if (mData) {
      setMarathons(mData);
      setSelectedMarathonId(mData[0]?.id || '');
    }

    // Fetch user metrics (simplified for demo)
    // In a real app, you'd use a RPC or a complex join
    const { data: users } = await supabase.from('auth.users').select('id, email');
    const { data: progress } = await supabase.from('user_progress').select('user_id, completed');
    
    if (users) {
      const metrics = users.map(u => {
        const userProgress = progress?.filter(p => p.user_id === u.id && p.completed) || [];
        return {
          user_id: u.id,
          email: u.email || 'Anónimo',
          total_workouts: 0, // Placeholder
          completed_workouts: userProgress.length,
          percentage: 0 // Placeholder
        };
      });
      setUserMetrics(metrics);
    }
    setLoading(false);
  };

  const fetchWorkouts = async (mId: string) => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('marathon_id', mId)
      .order('week_number', { ascending: true });
    if (data) setWorkouts(data);
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;

    const workoutData = {
      ...editingWorkout,
      marathon_id: selectedMarathonId,
    };

    if (editingWorkout.id) {
      const { error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', editingWorkout.id);
      if (!error) fetchWorkouts(selectedMarathonId);
    } else {
      const { error } = await supabase
        .from('workouts')
        .insert(workoutData);
      if (!error) fetchWorkouts(selectedMarathonId);
    }
    setIsModalOpen(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este entrenamiento?')) {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (!error) fetchWorkouts(selectedMarathonId);
    }
  };

  if (loading) return <div className="flex justify-center py-20">Cargando panel de control...</div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Administración</h2>
          <p className="text-slate-500">Gestiona entrenamientos y supervisa el progreso de los corredores.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm font-medium outline-none"
              value={selectedMarathonId}
              onChange={(e) => setSelectedMarathonId(e.target.value)}
            >
              {marathons.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => {
              setEditingWorkout({ week_number: 1, title: '', description: '' });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Nuevo Entrenamiento
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workouts List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <BarChart3 size={20} />
            Listado de Entrenamientos
          </h3>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Semana</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workouts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">No hay entrenamientos creados para este maratón.</td>
                  </tr>
                ) : (
                  workouts.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-600">Semana {w.week_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{w.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{w.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingWorkout(w);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteWorkout(w.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Users size={20} />
            Corredores
          </h3>
          <div className="space-y-3">
            {userMetrics.map(u => (
              <div key={u.user_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-800 text-sm truncate">{u.email}</p>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    {u.completed_workouts} completados
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (u.completed_workouts / (workouts.length || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-800">
                  {editingWorkout?.id ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
                </h4>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveWorkout} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Semana</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingWorkout?.week_number || 1}
                      onChange={(e) => setEditingWorkout({ ...editingWorkout, week_number: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Series de 1000m"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingWorkout?.title || ''}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label>
                  <textarea 
                    required
                    placeholder="Detalles del entrenamiento..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32"
                    value={editingWorkout?.description || ''}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, description: e.target.value })}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
