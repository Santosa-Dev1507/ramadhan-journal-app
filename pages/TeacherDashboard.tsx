import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeacherStats, getStudentHistory } from '../services/api';
import { Student, JournalEntry } from '../types';

const TeacherDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [user, setUser] = useState<Student | null>(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'rank' | 'completion_asc'>('rank');

    // Detail View State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentHistory, setStudentHistory] = useState<JournalEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const parsed = JSON.parse(userStr);
            setUser({
                ...parsed,
                name: parsed.name || parsed.nama || parsed.Nama || parsed.nis || 'Guru',
                class: parsed.class || parsed.kelas || parsed.Kelas || 'Pengajar'
            });
        }
        getTeacherStats().then(data => {
            if (data && data.students) {
                const normalizedStudents = data.students.map((s: any) => ({
                    ...s,
                    name: s.name || s.nama || s.Nama || s.nis || 'Siswa',
                    class: s.class || s.kelas || s.Kelas || '?'
                }));
                setStats({ ...data, students: normalizedStudents });
            } else {
                setStats(data);
            }
        });
    }, []);

    // Fetch history when a student is selected
    useEffect(() => {
        if (selectedStudent) {
            setIsLoadingHistory(true);
            getStudentHistory(selectedStudent.id).then(data => {
                setStudentHistory(data);
                setIsLoadingHistory(false);
            });
        }
    }, [selectedStudent]);

    const filteredStudents = useMemo(() => {
        if (!stats) return [];
        let students: Student[] = [...stats.students];

        if (selectedClass !== 'all') {
            // Mock filter logic
        }

        students.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'rank') return b.points - a.points;
            if (sortBy === 'completion_asc') return a.journalCompletion - b.journalCompletion;
            return 0;
        });

        return students;
    }, [stats, selectedClass, sortBy]);

    const studentsNeedingAttention = useMemo(() => {
        if (!stats) return [];
        return stats.students.filter((s: Student) =>
            s.journalCompletion < 60 || (s.stats?.prayerPercentage || 0) < 70
        );
    }, [stats]);

    // Derived Stats for Summary Cards
    const summaryStats = useMemo(() => {
        if (!stats || !stats.students.length) return { avgFasting: 0, avgPrayer: 0 };

        // Use filtered students for stats to reflect class selection? 
        // Typically dashboard stats might be global or filtered. Let's use filtered for better interactivity.
        const sourceData = filteredStudents.length > 0 ? filteredStudents : stats.students;

        const totalFasting = sourceData.reduce((acc: number, s: Student) => acc + (s.stats?.fastingDays || 0), 0);
        const totalPrayer = sourceData.reduce((acc: number, s: Student) => acc + (s.stats?.prayerPercentage || 0), 0);

        return {
            avgFasting: (totalFasting / sourceData.length).toFixed(1),
            avgPrayer: Math.round(totalPrayer / sourceData.length)
        };
    }, [stats, filteredStudents]);

    // Unique Classes for Dropdown
    const uniqueClasses = useMemo(() => {
        if (!stats) return [];
        const classes = new Set(stats.students.map((s: Student) => s.class));
        return Array.from(classes).sort(); // Alphabetical sort
    }, [stats]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const handleDownloadReport = () => {
        if (!filteredStudents.length) return;
        const headers = ['Nama', 'NIS', 'Kelas', 'Total Poin', 'Jurnal (%)', 'Puasa (Hari)', 'Shalat 5 Waktu (%)', 'Jamaah (%)', 'Tilawah (Juz)'];
        const rows = filteredStudents.map(s => [
            s.name, s.nis, s.class, s.points, s.journalCompletion,
            s.stats?.fastingDays || 0, s.stats?.prayerPercentage || 0,
            s.stats?.jamaahRatio || 0, s.stats?.currentJuz || 0
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Laporan_Ramadhan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!stats) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Memuat Data Guru...</div>;

    // --- DETAIL VIEW MODE ---
    if (selectedStudent) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-12">
                {/* Header Detail */}
                <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="font-bold text-lg">Detail Siswa</h2>
                </div>

                <main className="p-4 space-y-6">
                    {/* Profile Summary */}
                    <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <img src={selectedStudent.avatarUrl} className="size-20 rounded-full border-4 border-slate-50 dark:border-slate-800 mb-3" />
                        <h1 className="text-xl font-bold">{selectedStudent.name}</h1>
                        <p className="text-sm opacity-60 font-medium mb-4">{selectedStudent.class} • NIS {selectedStudent.nis}</p>

                        <div className="grid grid-cols-3 gap-8 w-full border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-primary">{selectedStudent.journalCompletion}%</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Jurnal</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold">{selectedStudent.stats?.prayerPercentage}%</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Shalat</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold">{selectedStudent.stats?.fastingDays}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Puasa</span>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                            Riwayat 7 Hari Terakhir
                        </h3>

                        {isLoadingHistory ? (
                            <div className="p-4 text-center opacity-50">Mengambil data jurnal...</div>
                        ) : (
                            <div className="space-y-3">
                                {studentHistory.map((entry, idx) => {
                                    // Simple count for prayers
                                    const prayersFilled = Object.values(entry.prayers).filter(p => p !== 'none').length;
                                    const isFullPrayer = prayersFilled === 5;

                                    return (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                    <span className="text-xs font-bold uppercase text-slate-400">
                                                        {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                                                    </span>
                                                    <span className="text-lg font-bold">
                                                        {new Date(entry.date).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {entry.fasting.isFasting ? (
                                                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">PUASA</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">TIDAK PUASA</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs opacity-60">
                                                        Shalat: {prayersFilled}/5 {isFullPrayer && '⭐'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Simple Indicator Dot */}
                                            <div className={`size-3 rounded-full ${isFullPrayer && entry.fasting.isFasting ? 'bg-primary' : 'bg-orange-300'}`}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // --- MAIN DASHBOARD MODE ---

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="p-2 -ml-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 mr-1"
                        title="Keluar"
                    >
                        <span className="material-symbols-outlined block">logout</span>
                    </button>
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined block">school</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Monitor Siswa</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-xs font-bold">{user?.name || 'Guru'}</span>
                        <span className="text-[10px] opacity-60">{user?.class || 'Pengajar'}</span>
                    </div>
                    <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary/50">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBsu4z5IVpiW4kDDlF7VYLG0DL7tV2ZhcQKrblcRV1NfkcuqFoReuyhG0K1emKefHAfexOZVzYnpfF9KeicpcJpKQJJS_tLr13Pz5N0OmZnt-wU0i7IVUtZJBluE4vGmu9QDr5LbJivDJhQAAsbIV7geo5ik58uF28RZXtBTUwM7tR3fmY6BLadVR0zH4zvi8I0mGT7jhWpOORzxwsHuV9jca8kf8i4TlNh34BBcnvm5AtImuC0pnDr6fg8TyCcua8DBXtou6nJKbC" alt="Profile" />
                    </div>
                </div>
            </nav>

            <main className="p-4 space-y-6">

                {/* Alerts Section (Critical for Teachers) */}
                {studentsNeedingAttention.length > 0 && (
                    <section className="animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined font-variation-filled">warning</span>
                            <h2 className="text-sm font-bold uppercase tracking-wide">Perlu Perhatian ({studentsNeedingAttention.length})</h2>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
                            {studentsNeedingAttention.map((s: Student) => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedStudent(s)}
                                    className="snap-center min-w-[280px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <div className="relative">
                                        <img src={s.avatarUrl} className="size-12 rounded-full grayscale" alt={s.name} />
                                        <span className="absolute bottom-0 right-0 p-1 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                                        <p className="text-xs text-red-600 dark:text-red-300 font-medium mt-0.5">
                                            {s.journalCompletion < 50 ? 'Jurnal Kosong' : 'Shalat Bolong-bolong'}
                                        </p>
                                        <div className="mt-2 w-full h-1.5 bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${s.journalCompletion}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Global Stats */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-xs text-slate-500 font-bold uppercase">Rata2 Puasa</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-2xl font-bold">{summaryStats.avgFasting}</span>
                            <span className="text-xs mb-1 opacity-60">/ 30 Hari</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-xs text-slate-500 font-bold uppercase">Kepatuhan Shalat</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-2xl font-bold text-primary">{summaryStats.avgPrayer}%</span>
                            <span className="text-xs mb-1 opacity-60">{summaryStats.avgPrayer > 80 ? 'Sangat Baik' : 'Cukup'}</span>
                        </div>
                    </div>
                </section>

                {/* Controls */}
                <section className="flex gap-3 sticky top-[70px] z-40 bg-background-light dark:bg-background-dark py-2">
                    <div className="relative flex-1">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none shadow-sm"
                        >
                            <option value="all">Semua Kelas</option>
                            {uniqueClasses.map((cls: any) => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                    <div className="relative w-1/3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none shadow-sm"
                        >
                            <option value="rank">Poin</option>
                            <option value="completion_asc">Terendah</option>
                            <option value="name">Nama</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">sort</span>
                    </div>
                </section>

                {/* Detailed Student List */}
                <section className="space-y-3">
                    {filteredStudents.map((student: Student) => (
                        <div
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            {/* Header: Identity & Points */}
                            <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3">
                                <div className="flex items-center gap-3">
                                    <img src={student.avatarUrl} alt={student.name} className="size-10 rounded-full border border-slate-100 dark:border-slate-700 object-cover" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{student.name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-1.5 py-0.5 rounded mt-1">{student.class}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-primary font-bold">
                                        <span className="material-symbols-outlined text-sm">stars</span>
                                        <span className="text-sm">{student.points}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Total XP</p>
                                </div>
                            </div>

                            {/* Stats Grid - Critical for Teacher */}
                            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
                                {/* Puasa */}
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Puasa</span>
                                    <span className="text-sm font-bold">{student.stats?.fastingDays || 0}</span>
                                    <span className="text-[9px] opacity-50">Hari</span>
                                </div>
                                {/* Shalat */}
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Shalat</span>
                                    <span className={`text-sm font-bold ${(student.stats?.prayerPercentage || 0) < 80 ? 'text-red-500' : 'text-green-600'}`}>
                                        {student.stats?.prayerPercentage || 0}%
                                    </span>
                                    <span className="text-[9px] opacity-50">5 Waktu</span>
                                </div>
                                {/* Jamaah (Quality) */}
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Jamaah</span>
                                    <span className="text-sm font-bold">{student.stats?.jamaahRatio || 0}%</span>
                                    <span className="text-[9px] opacity-50">Rasio</span>
                                </div>
                                {/* Tilawah */}
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Quran</span>
                                    <span className="text-sm font-bold text-purple-500">Juz {student.stats?.currentJuz || 1}</span>
                                    <span className="text-[9px] opacity-50">Capaian</span>
                                </div>
                            </div>

                            {/* Action Bar (Optional Details) */}
                            <div className="pt-2">
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className="bg-primary h-full" style={{ width: `${student.journalCompletion}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] font-bold text-slate-400">Kelengkapan Jurnal</span>
                                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{student.journalCompletion}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            {/* Bottom Download Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-40 max-w-md mx-auto">
                <button
                    onClick={handleDownloadReport}
                    className="w-full bg-primary text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform active:scale-95"
                >
                    <span className="material-symbols-outlined">download</span>
                    Download Rekap Nilai (CSV)
                </button>
            </div>
        </div>
    );
};

export default TeacherDashboard;