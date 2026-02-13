import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBadges, getStudentHistory } from '../services/api';
import { Badge, JournalEntry, Student } from '../types';

const Progress: React.FC = () => {
    const navigate = useNavigate();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [stats, setStats] = useState({
        totalFasting: 0,
        totalPoints: 0,
        streak: 0,
        completionRate: 0,
        currentDay: 1
    });

    useEffect(() => {
        const calculateGamification = async () => {
            // 1. Get Current User
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return;
            const user: Student = JSON.parse(userStr);

            // 2. Get User History
            // In a real app, this fetches from backend. 
            // Here it might return mock data from api.ts, but the LOGIC below is real.
            const history = await getStudentHistory(user.id);

            // 3. Calculate Basic Stats
            const totalFasting = history.filter(h => h.fasting.isFasting).length;

            // Calculate Streak (Consecutive days backward from today)
            // Simplified logic for demo
            const streak = user.streak || 0;

            // 4. BADGE LOGIC ENGINE
            // Define criteria for each badge
            const calculatedBadges: Badge[] = [
                {
                    id: '1',
                    name: 'Ahli Puasa',
                    icon: 'no_meals',
                    color: 'primary',
                    isUnlocked: totalFasting >= 5 || (user.stats?.fastingDays ?? 0) >= 5
                },
                {
                    id: '2',
                    name: 'Tadarus Starter',
                    icon: 'menu_book',
                    color: 'blue',
                    isUnlocked: history.filter(h => h.ibadahWajib.tilawahPages >= 20).length >= 3
                },
                {
                    id: '3',
                    name: 'Dermawan',
                    icon: 'volunteer_activism',
                    color: 'purple',
                    isUnlocked: history.filter(h => h.ibadahSunnah.sedekah).length >= 3
                },
                {
                    id: '4',
                    name: 'Pejuang Jamaah',
                    icon: 'mosque',
                    color: 'zinc',
                    isUnlocked: history.reduce((acc, curr) => {
                        const jamaahCount = Object.values(curr.prayers).filter(p => p === 'jamaah').length;
                        return acc + jamaahCount;
                    }, 0) >= 15 || (user.stats?.jamaahRatio ?? 0) > 50 // Fallback: if ratio > 50% assume active
                },
                {
                    id: '5',
                    name: 'Khatam Quran',
                    icon: 'emoji_events',
                    color: 'zinc',
                    isUnlocked: (user.stats?.currentJuz || 0) >= 30
                },
                {
                    id: '6',
                    name: 'Qiyamul Lail',
                    icon: 'nightlight_round',
                    color: 'zinc',
                    isUnlocked: history.filter(h => h.ibadahWajib.tarawih).length >= 5
                },
            ];

            setBadges(calculatedBadges);
            setStats({
                totalFasting,
                totalPoints: user.points,
                streak: streak,
                completionRate: user.journalCompletion,
                currentDay: totalFasting + 1 // Mock logic for current day
            });
        };

        calculateGamification();
    }, []);

    const getBadgeGradient = (color: string, isUnlocked: boolean) => {
        if (!isUnlocked) return 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border-zinc-200 dark:border-zinc-700';

        switch (color) {
            case 'primary': return 'from-primary/20 to-primary/40 border-primary shadow-[0_0_15px_rgba(19,236,91,0.2)] text-green-700 dark:text-primary';
            case 'blue': return 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)] text-blue-600 dark:text-blue-400';
            case 'purple': return 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.2)] text-purple-600 dark:text-purple-400';
            default: return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-transparent';
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111813] dark:text-white pb-24 min-h-screen">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold tracking-tight">Progress & Lencana</h1>
                </div>
                <button className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm opacity-60 hover:opacity-100">
                    <span className="material-symbols-outlined">help_outline</span>
                </button>
            </header>

            <main className="px-4">
                {/* Hero */}
                <section className="mt-6 mb-8">
                    <div className="flex flex-col gap-1 mb-4">
                        <h2 className="text-3xl font-bold tracking-tight">Ramadhan Kareem 🌙</h2>
                        <p className="text-sm opacity-70">Masya Allah, perjalananmu luar biasa!</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-black/5 dark:border-white/5">
                        <div className="flex justify-between items-end mb-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Perjalanan Puasa</span>
                                <span className="text-2xl font-bold">{stats.totalFasting} <span className="text-sm font-medium opacity-50">/ 30 Hari</span></span>
                            </div>
                            <span className="text-sm font-bold bg-primary/20 text-green-700 dark:text-primary px-3 py-1 rounded-full">{stats.completionRate}% Selesai</span>
                        </div>
                        <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${stats.completionRate}%` }}>
                                <div className="absolute right-0 top-0 h-full w-2 bg-white/30"></div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-[#61896f] dark:text-primary/80">
                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            <p>Terus semangat, sedikit lagi menuju kemenangan!</p>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">stars</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 dark:text-primary">+25 Today</span>
                        </div>
                        <p className="text-sm font-medium opacity-60">Poin Kebaikan</p>
                        <p className="text-2xl font-bold tracking-tight">{stats.totalPoints} <span className="text-xs opacity-50 font-medium">XP</span></p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">local_fire_department</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200"></div>
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-300"></div>
                            </div>
                        </div>
                        <p className="text-sm font-medium opacity-60">Istiqamah Streak</p>
                        <p className="text-2xl font-bold tracking-tight">{stats.streak} <span className="text-xs opacity-50 font-medium">Hari</span></p>
                    </div>
                </section>

                {/* Badges */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold tracking-tight">Lencana Amal</h3>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-500">Auto-Update</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className={`flex flex-col items-center gap-2 group transition-all duration-500 ${!badge.isUnlocked ? 'grayscale opacity-70' : 'scale-105'}`}>
                                <div className={`relative w-full aspect-square rounded-2xl flex items-center justify-center p-4 bg-gradient-to-br border-2 transition-all duration-300 ${getBadgeGradient(badge.color, badge.isUnlocked)}`}>
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: badge.isUnlocked ? "'FILL' 1" : "'FILL' 0" }}>
                                        {badge.icon}
                                    </span>
                                    {badge.isUnlocked ? (
                                        <div className={`absolute -top-1 -right-1 p-0.5 rounded-full ${badge.color === 'primary' ? 'bg-primary text-[#111813]' : `bg-${badge.color}-500 text-white`}`}>
                                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl">
                                            <span className="material-symbols-outlined text-zinc-400 text-xl">lock</span>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-[10px] leading-tight font-bold text-center ${badge.isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                                    {badge.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Leaderboard Teaser */}
                <section className="mt-10 bg-gradient-to-r from-primary to-green-400 p-6 rounded-xl text-[#111813] flex items-center justify-between shadow-lg shadow-primary/20">
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold leading-tight">Kamu Peringkat #3</h4>
                        <p className="text-sm font-medium opacity-80">Di kelas 8-B pekan ini!</p>
                    </div>
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="bg-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        Lihat Papan Skor
                    </button>
                </section>
            </main>
        </div>
    );
};

export default Progress;