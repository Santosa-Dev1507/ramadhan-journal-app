import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';
import { Student } from '../types';

const Leaderboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [currentUser, setCurrentUser] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'global' | 'class'>('global');

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        getLeaderboard().then(data => {
            setStudents(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
                Memuat Papan Skor...
            </div>
        );
    }

    const filteredStudents = tab === 'class' && currentUser
        ? students.filter(s => s.class === currentUser.class)
        : students;

    const topThree = filteredStudents.slice(0, 3);
    const restOfStudents = filteredStudents.slice(3);

    // Podium order: [2nd, 1st, 3rd]
    const second = topThree[1];
    const first = topThree[0];
    const third = topThree[2];

    // Find current user rank
    const currentUserRank = currentUser
        ? filteredStudents.findIndex(s => s.nis === currentUser.nis) + 1
        : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 antialiased pb-24">
            {/* Header */}
            <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-effect dark:bg-background-dark/80 border-b border-primary/10">
                <div className="w-10 h-10" /> {/* spacer */}
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Peringkat Kebaikan</h1>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">info</span>
                </button>
            </nav>

            <main className="pb-32">
                {/* Podium Area */}
                <div className="relative overflow-hidden pt-8 pb-12 px-6 bg-gradient-to-b from-primary/10 to-transparent">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <span className="material-symbols-outlined text-[200px]">auto_awesome</span>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex justify-center mb-10">
                        <div className="inline-flex p-1 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-primary/10">
                            <button
                                onClick={() => setTab('global')}
                                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${tab === 'global'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                Global
                            </button>
                            <button
                                onClick={() => setTab('class')}
                                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${tab === 'class'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                Kelas Saya
                            </button>
                        </div>
                    </div>

                    {/* Podium Top 3 */}
                    <div className="flex items-end justify-center gap-4 mt-4 h-64">
                        {/* 2nd Place (Left) */}
                        {second && (
                            <div className="flex flex-col items-center w-24">
                                <div className="relative mb-3">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-200 overflow-hidden shadow-lg">
                                        <img
                                            alt={second.name}
                                            className="w-full h-full object-cover"
                                            src={second.avatarUrl}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                        2
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-t-xl w-full pt-4 pb-2 text-center h-24 border-x border-t border-slate-200/30">
                                    <p className="text-xs font-bold truncate px-2">{second.name?.split(' ')[0] || second.name || 'Siswa'}</p>
                                    <p className="text-[10px] text-primary font-bold">{second.points.toLocaleString('id-ID')} pt</p>
                                </div>
                            </div>
                        )}

                        {/* 1st Place (Center) */}
                        {first && (
                            <div className="flex flex-col items-center w-28 relative z-10">
                                <div className="absolute -top-10 animate-bounce">
                                    <span className="material-symbols-outlined text-yellow-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                </div>
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full border-4 border-primary overflow-hidden shadow-xl ring-4 ring-primary/20">
                                        <img
                                            alt={first.name}
                                            className="w-full h-full object-cover"
                                            src={first.avatarUrl}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 border-white">
                                        1
                                    </div>
                                </div>
                                <div className="bg-primary/10 dark:bg-primary/20 backdrop-blur-sm rounded-t-2xl w-full pt-6 pb-3 text-center h-32 border-x border-t border-primary/30">
                                    <p className="text-sm font-extrabold truncate px-2">{first.name?.split(' ').slice(0, 2).join(' ') || first.name || 'Siswa'}</p>
                                    <p className="text-xs text-primary font-extrabold mt-1">{first.points.toLocaleString('id-ID')} pt</p>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place (Right) */}
                        {third && (
                            <div className="flex flex-col items-center w-24">
                                <div className="relative mb-3">
                                    <div className="w-16 h-16 rounded-full border-4 border-orange-200 overflow-hidden shadow-lg">
                                        <img
                                            alt={third.name}
                                            className="w-full h-full object-cover"
                                            src={third.avatarUrl}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-orange-300 text-orange-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                        3
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-t-xl w-full pt-4 pb-2 text-center h-20 border-x border-t border-slate-200/30">
                                    <p className="text-xs font-bold truncate px-2">{third.name?.split(' ')[0] || third.name || 'Siswa'}</p>
                                    <p className="text-[10px] text-primary font-bold">{third.points.toLocaleString('id-ID')} pt</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rest of Leaderboard */}
                <div className="px-6 space-y-3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Peringkat Lainnya</h2>
                    {restOfStudents.map((student, idx) => {
                        const rank = idx + 4;
                        const isMe = student.nis === currentUser?.nis;
                        return (
                            <div
                                key={student.id}
                                className={`flex items-center gap-4 p-4 rounded-xl shadow-sm border transition-all ${isMe
                                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                    }`}
                            >
                                <span className="w-6 text-center font-bold text-slate-400">{rank}</span>
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <img alt={student.name} className="w-full h-full object-cover" src={student.avatarUrl} />
                                </div>
                                <div className="flex-grow">
                                    <h4 className={`text-sm font-bold ${isMe ? 'text-primary' : ''}`}>
                                        {student.name} {isMe && '(Saya)'}
                                    </h4>
                                    <p className="text-[10px] text-slate-400">{student.class}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {student.points.toLocaleString('id-ID')} pt
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Bottom Sticky - My Rank Card */}
            {currentUser && currentUserRank > 0 && (
                <div className="fixed bottom-16 left-0 right-0 p-4 z-20 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent pointer-events-none">
                    <div className="max-w-md mx-auto pointer-events-auto">
                        <div className="bg-primary dark:bg-primary/90 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border-2 border-white/20">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/20 rounded-xl font-extrabold text-lg">
                                {currentUserRank}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold">Peringkat Kamu</h4>
                                    <span className="px-1.5 py-0.5 rounded-sm bg-white/20 text-[10px] font-bold">{currentUser.class}</span>
                                </div>
                                <p className="text-[10px] text-white/80 mt-0.5 italic">Ayo terus berbuat baik hari ini!</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-white/80">Poin Kebaikan</p>
                                <p className="text-lg font-extrabold leading-tight">{currentUser.points.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;