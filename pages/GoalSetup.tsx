import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGoals } from '../services/api';
import { Goal } from '../types';

const GoalSetup: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [startDate, setStartDate] = useState<string>('2026-02-18');
  const navigate = useNavigate();

  useEffect(() => {
    getGoals().then(setGoals);
    // Check if user already has a preference stored locally
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.startRamadhanDate) {
            setStartDate(user.startRamadhanDate);
        }
    }
  }, []);

  const toggleGoal = (id: string) => {
    setGoals(current => 
      current.map(g => {
        if (g.type === 'mandatory') return g; // Cannot toggle mandatory
        if (g.id === id) return { ...g, isSelected: !g.isSelected };
        return g;
      })
    );
  };

  const handleStart = () => {
      // Save start date preference
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
          const user = JSON.parse(savedUser);
          user.startRamadhanDate = startDate;
          localStorage.setItem('currentUser', JSON.stringify(user));
      }
      navigate('/journal');
  };

  const getIconColorBg = (color?: string) => {
    switch(color) {
        case 'orange': return 'bg-orange-100 text-orange-500 dark:bg-orange-900/30';
        case 'blue': return 'bg-blue-100 text-blue-500 dark:bg-blue-900/30';
        case 'purple': return 'bg-purple-100 text-purple-500 dark:bg-purple-900/30';
        case 'pink': return 'bg-pink-100 text-pink-500 dark:bg-pink-900/30';
        default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-32">
      {/* Top Nav */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
        <button onClick={() => navigate('/login')} className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Atur Target Ramadhan</h2>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-sm font-semibold uppercase tracking-wider">Persiapan</p>
          <p className="opacity-50 text-sm font-medium">1 dari 2</p>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 py-4 text-center">
        <h2 className="text-3xl font-extrabold leading-tight mb-2">Tentukan Target Ramadhanmu! 🌙</h2>
        <p className="opacity-60 text-base font-medium leading-relaxed max-w-xs mx-auto">
          Mari rencanakan Ramadhan terbaikmu. Pilih tanggal mulai puasa yang kamu yakini.
        </p>
      </div>

      <div className="flex-1 px-4 space-y-8">
        
        {/* Date Selection */}
        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <h3 className="text-sm font-bold uppercase tracking-wide">Kapan Kamu Mulai Puasa?</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div 
                    onClick={() => setStartDate('2026-02-18')}
                    className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${startDate === '2026-02-18' ? 'bg-primary text-[#102216] border-primary ring-2 ring-primary/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}
                >
                    <p className="text-xs opacity-70 mb-1">Muhammadiyah</p>
                    <p className="font-bold text-lg">18 Feb</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Rabu</p>
                </div>
                <div 
                    onClick={() => setStartDate('2026-02-19')}
                    className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${startDate === '2026-02-19' ? 'bg-primary text-[#102216] border-primary ring-2 ring-primary/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}
                >
                    <p className="text-xs opacity-70 mb-1">Pemerintah / NU</p>
                    <p className="font-bold text-lg">19 Feb</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Kamis</p>
                </div>
            </div>
            <p className="text-xs mt-3 text-center opacity-60">Pilihan ini menentukan hitungan "Hari ke-X" di jurnalmu.</p>
        </div>

        {/* Mandatory */}
        <div>
          <div className="flex items-center gap-2 px-2 pb-4 pt-2">
            <span className="material-symbols-outlined opacity-40 text-xl">lock</span>
            <h3 className="text-lg font-bold tracking-tight">Target Wajib (Dari Sekolah)</h3>
          </div>
          <div className="space-y-3">
            {goals.filter(g => g.type === 'mandatory').map(goal => (
              <div key={goal.id} className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm opacity-80">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${getIconColorBg(goal.color)}`}>
                  <span className="material-symbols-outlined">{goal.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{goal.title}</h4>
                  <p className="text-xs opacity-50">{goal.description}</p>
                </div>
                <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional */}
        <div>
          <div className="flex items-center gap-2 px-2 pb-4 pt-2">
            <span className="material-symbols-outlined text-primary text-xl">star</span>
            <h3 className="text-lg font-bold tracking-tight">Target Opsional (Pilihanmu)</h3>
          </div>
          <div className="space-y-3">
            {goals.filter(g => g.type === 'optional').map(goal => (
              <label key={goal.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.98] transition-all">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${getIconColorBg(goal.color)}`}>
                  <span className="material-symbols-outlined">{goal.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{goal.title}</h4>
                  <p className="text-xs opacity-50">{goal.description}</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={goal.isSelected}
                    onChange={() => toggleGoal(goal.id)}
                    className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 bg-slate-50" 
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-50">
        <button 
            onClick={handleStart}
            className="w-full bg-primary hover:brightness-105 active:scale-[0.98] text-slate-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
            Mulai Perjalananku
            <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <p className="text-center text-xs opacity-40 mt-3 font-medium">Kamu bisa mengubahnya nanti di pengaturan</p>
      </div>
    </div>
  );
};

export default GoalSetup;