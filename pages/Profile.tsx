import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../types';
import { AVATARS, AvatarId } from '../config/avatars';
import { updateUserProfile, loginUser } from '../services/api';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<Student | null>(null);
    const [startDate, setStartDate] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setUser(u);
            setStartDate(u.startRamadhanDate || '2026-02-18');
        } else {
            navigate('/login');
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    const savePreferences = async () => {
        if (!user) return;

        try {
            const updatedUser = { ...user, startRamadhanDate: startDate };
            const success = await updateUserProfile(updatedUser);

            if (success) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                // Simpan terpisah per-NIS agar tidak hilang saat logout
                localStorage.setItem(`ramadhan_start_${user.nis}`, startDate);
                setUser(updatedUser);
                alert('Pengaturan berhasil disimpan');
            } else {
                alert('Gagal menyimpan pengaturan. Periksa koneksi internet Anda.');
            }
        } catch (error) {
            console.error('Save preferences error:', error);
            alert('Terjadi kesalahan saat menyimpan pengaturan.');
        }
    };

    const handleAvatarChange = async (avatarId: AvatarId) => {
        if (!user) return;

        try {
            const updatedUser = {
                ...user,
                avatarId,
                avatarUrl: AVATARS[avatarId]
            };

            const success = await updateUserProfile(updatedUser);

            if (success) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setShowAvatarPicker(false);
                alert('Avatar berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui avatar. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Avatar update error:', error);
            alert('Terjadi kesalahan saat memperbarui avatar.');
        }
    };

    if (!user) return null;

    const activeDays = user.stats?.fastingDays ?? 0;
    const remainingDays = Math.max(0, 30 - activeDays);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined">edit</span>
                </button>
            </header>

            {/* Profile Section */}
            <div className="px-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                        />
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-white dark:border-slate-900">
                            <span className="material-symbols-outlined text-xs">verified</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                        {user.name || (user as any).nama || (user as any).Nama || user.nis || "Nama Tidak Ditemukan"}
                    </h2>
                    <p className="text-sm text-slate-500 mb-2">{user.nis}</p>
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                        {user.class || (user as any).kelas || (user as any).Kelas || "Kelas ?"}
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="px-6 mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Statistik Ibadah
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary rounded-xl p-4 text-white shadow-md shadow-primary/20">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                            <span className="text-xs font-semibold uppercase tracking-wide">Hari Aktif</span>
                        </div>
                        <p className="text-3xl font-bold">{activeDays}</p>
                        <p className="text-[10px] opacity-75 mt-1">Sisa {remainingDays} hari lagi!</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <span className="material-symbols-outlined text-lg">stars</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Poin</span>
                        </div>
                        <p className="text-3xl font-bold">{user.points.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] text-slate-400 mt-1">🔥 Streak {user.streak} hari</p>
                    </div>
                </div>
            </div>

            {/* Ramadhan Date Settings */}
            <div className="px-6 mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">settings</span>
                    Tanggal Mulai Puasa
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setStartDate('2026-02-18')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${startDate === '2026-02-18' ? 'bg-primary/20 border-primary text-primary' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                            18 Feb (Muhammadiyah)
                        </button>
                        <button
                            onClick={() => setStartDate('2026-02-19')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${startDate === '2026-02-19' ? 'bg-primary/20 border-primary text-primary' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                            19 Feb (Pemerintah)
                        </button>
                    </div>
                    <button
                        onClick={savePreferences}
                        className="w-full mt-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>

            {/* Removed Account Settings Section - Not implemented yet */}

            {/* Logout Button */}
            <div className="px-6 mt-8">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold py-4 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Keluar
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4">v1.0.0 • Build 2026</p>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowAvatarPicker(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">Pilih Avatar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pilih avatar yang sesuai</p>
                            </div>
                            <button onClick={() => setShowAvatarPicker(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Male Avatar */}
                            <button
                                onClick={() => handleAvatarChange('male')}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-105 ${user.avatarId === 'male'
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <img src={AVATARS.male} alt="Avatar Laki-laki" className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md" />
                                <div className="text-center">
                                    <p className="text-sm font-bold">Laki-laki</p>
                                    {user.avatarId === 'male' && (
                                        <div className="mt-1 flex items-center justify-center gap-1 text-primary">
                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                            <span className="text-[10px] font-bold">Aktif</span>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* Female Avatar */}
                            <button
                                onClick={() => handleAvatarChange('female')}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-105 ${user.avatarId === 'female'
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <img src={AVATARS.female} alt="Avatar Perempuan" className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md" />
                                <div className="text-center">
                                    <p className="text-sm font-bold">Perempuan</p>
                                    {user.avatarId === 'female' && (
                                        <div className="mt-1 flex items-center justify-center gap-1 text-primary">
                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                            <span className="text-[10px] font-bold">Aktif</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;