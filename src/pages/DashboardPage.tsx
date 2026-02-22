import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Marathon, Workout, UserProgress } from '../types';
import { calculateWeeksRemaining, getTimeRemaining, cn } from '../utils/helpers';
import { CheckCircle2, Circle, ChevronRight, Timer, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [marathons, setMarathons] = useState<Marathon[]>([]);
  const [selectedMarathon, setSelectedMarathon] = useState<Marathon | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<any>(null);

  useEffect(() => {
    fetchMarathons();
  }, []);

  useEffect(() => {
    if (selectedMarathon) {
      fetchWorkouts(selectedMarathon.id);
      
      const timer = setInterval(() => {
        setCountdown(getTimeRemaining(selectedMarathon.date));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [selectedMarathon]);

  const fetchMarathons = async () => {
    const { data, error } = await supabase.from('marathons').select('*').order('date', { ascending: true });
    if (data) {
      setMarathons(data);
      setSelectedMarathon(data[0]);
    }
    setLoading(false);
  };

  const fetchWorkouts = async (marathonId: string) => {
    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*')
      .eq('marathon_id', marathonId)
      .order('week_number', { ascending: true });
    
    if (workoutData) setWorkouts(workoutData);

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user?.id);
    
    if (progressData) {
      const progressMap: Record<string, UserProgress> = {};
      progressData.forEach(p => {
        progressMap[p.workout_id] = p;
      });
      setProgress(progressMap);
    }
  };

  const toggleWorkout = async (workoutId: string) => {
    const current = progress[workoutId];
    const isCompleted = !current?.completed;

    if (current?.id) {
      const { data, error } = await supabase
        .from('user_progress')
        .update({ completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();
      
      if (data) setProgress({ ...progress, [workoutId]: data });
    } else {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user?.id,
          workout_id: workoutId,
          completed: isCompleted,
          sensations: '',
          discomfort: ''
        })
        .select()
        .single();
      
      if (data) setProgress({ ...progress, [workoutId]: data });
    }
  };

  const updateProgressDetails = async (workoutId: string, field: 'sensations' | 'discomfort', value: string) => {
    const current = progress[workoutId];
    if (!current?.id) return;

    const { data } = await supabase
      .from('user_progress')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', current.id)
      .select()
      .single();
    
    if (data) setProgress({ ...progress, [workoutId]: data });
  };

  if (loading) return <div className="flex justify-center py-20">Cargando...</div>;

  const weeksRemaining = selectedMarathon ? calculateWeeksRemaining(selectedMarathon.date) : 0;

  // Group workouts by week
  const groupedWorkouts = workouts.reduce((acc, w) => {
    if (!acc[w.week_number]) acc[w.week_number] = [];
    acc[w.week_number].push(w);
    return acc;
  }, {} as Record<number, Workout[]>);

  return (
    <div className="space-y-8">
      {/* Marathon Selector & Countdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Selecciona tu Maratón
          </label>
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={selectedMarathon?.id}
            onChange={(e) => setSelectedMarathon(marathons.find(m => m.id === e.target.value) || null)}
          >
            {marathons.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          <div className="mt-6 flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-xl">
            <Calendar size={20} />
            <div>
              <p className="text-xs font-medium uppercase">Semanas restantes</p>
              <p className="text-2xl font-bold">{weeksRemaining}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-blue-600 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Timer size={32} />
              {selectedMarathon?.name}
            </h2>
            
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Días', value: countdown?.days || 0 },
                { label: 'Horas', value: countdown?.hours || 0 },
                { label: 'Min', value: countdown?.minutes || 0 },
                { label: 'Seg', value: countdown?.seconds || 0 },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="text-xs uppercase font-medium opacity-80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative SVG */}
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Timer size={240} />
          </div>
        </div>
      </section>

      {/* Training Plan */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Plan de Entrenamiento
          <span className="text-sm font-normal text-slate-400">({workouts.length} sesiones)</span>
        </h3>

        <div className="space-y-10">
          {Object.entries(groupedWorkouts).map(([week, weekWorkouts]: [string, any]) => (
            <div key={week} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Semana {week}</h4>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weekWorkouts.map((workout) => {
                  const p = progress[workout.id];
                  const isCompleted = p?.completed;

                  return (
                    <motion.div 
                      key={workout.id}
                      layout
                      className={cn(
                        "p-5 rounded-2xl border transition-all duration-300",
                        isCompleted 
                          ? "bg-emerald-50 border-emerald-100 shadow-sm" 
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h5 className={cn("font-bold text-lg", isCompleted ? "text-emerald-800" : "text-slate-800")}>
                            {workout.title}
                          </h5>
                          <p className="text-sm text-slate-500 mt-1">{workout.description}</p>
                        </div>
                        <button 
                          onClick={() => toggleWorkout(workout.id)}
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            isCompleted ? "text-emerald-600 bg-emerald-100" : "text-slate-300 hover:text-blue-500 bg-slate-50"
                          )}
                        >
                          {isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isCompleted && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t border-emerald-100"
                          >
                            <div>
                              <label className="text-xs font-bold text-emerald-700 uppercase mb-1 block">Sensaciones</label>
                              <input 
                                type="text"
                                placeholder="¿Cómo te has sentido?"
                                className="w-full bg-white/50 border border-emerald-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={p.sensations || ''}
                                onChange={(e) => updateProgressDetails(workout.id, 'sensations', e.target.value)}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id={`discomfort-${workout.id}`}
                                className="rounded text-emerald-600"
                                checked={!!p.discomfort}
                                onChange={(e) => updateProgressDetails(workout.id, 'discomfort', e.target.checked ? 'Molestias en...' : '')}
                              />
                              <label htmlFor={`discomfort-${workout.id}`} className="text-xs font-medium text-emerald-700">He tenido molestias</label>
                            </div>

                            {p.discomfort !== undefined && p.discomfort !== '' && (
                              <textarea 
                                placeholder="Describe tus molestias..."
                                className="w-full bg-white/50 border border-emerald-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none h-20"
                                value={p.discomfort || ''}
                                onChange={(e) => updateProgressDetails(workout.id, 'discomfort', e.target.value)}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
