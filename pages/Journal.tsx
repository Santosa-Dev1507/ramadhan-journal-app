import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitJournal, getJournalEntry } from '../services/api';
import { PrayerStatus, JournalEntry } from '../types';
import Toast from '../components/Toast';

const Journal: React.FC = () => {
  const navigate = useNavigate();

  // Date Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ramadhanDay, setRamadhanDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 1. Puasa (Wajib)
  const [fasting, setFasting] = useState({
    isFasting: true,
    reason: ''
  });

  // 2. Shalat 5 Waktu (Wajib)
  const [prayers, setPrayers] = useState<{
    subuh: PrayerStatus;
    dzuhur: PrayerStatus;
    ashar: PrayerStatus;
    maghrib: PrayerStatus;
    isya: PrayerStatus;
  }>({
    subuh: 'none',
    dzuhur: 'none',
    ashar: 'none',
    maghrib: 'none',
    isya: 'none',
  });

  // 3. Ibadah Wajib Sekolah
  const [ibadahWajib, setIbadahWajib] = useState({
    tilawahPages: 0,
    dhuha: false,
    tarawih: false,
    witir: false,
    zakat: false,
    jumat: false
  });

  // 4. Ibadah Tidak Wajib
  const [ibadahSunnah, setIbadahSunnah] = useState({
    iktikaf: false,
    sedekah: false,
    helpParents: false,
    rawatib: false,
    ceramahIslami: false,
    shalatIdulFitri: false
  });

  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  // Load Data Effect
  useEffect(() => {
    const loadEntry = async () => {
      setIsLoading(true);
      const isoDate = currentDate.toISOString();
      const entry = await getJournalEntry(isoDate);

      if (entry) {
        // Populate form with existing data
        setFasting(entry.fasting);
        setPrayers(entry.prayers);
        setIbadahWajib(entry.ibadahWajib);
        setIbadahSunnah(entry.ibadahSunnah);
        setReflection(entry.reflection);
      } else {
        // Reset form to defaults
        setFasting({ isFasting: true, reason: '' });
        setPrayers({ subuh: 'none', dzuhur: 'none', ashar: 'none', maghrib: 'none', isya: 'none' });
        setIbadahWajib({ tilawahPages: 0, dhuha: false, tarawih: false, witir: false, zakat: false, jumat: false });
        setIbadahSunnah({ iktikaf: false, sedekah: false, helpParents: false, rawatib: false, ceramahIslami: false, shalatIdulFitri: false });
        setReflection('');
      }
      setIsLoading(false);
    };

    loadEntry();
  }, [currentDate]);

  // Ramadhan Day Calculation Effect
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const startDateStr = user.startRamadhanDate || '2026-02-18';

      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);

      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);

      const diffTime = checkDate.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setRamadhanDay(diffDays + 1);
    }
  }, [currentDate]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (currentDate.getTime() < today.setHours(0, 0, 0, 0)) {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const cyclePrayerStatus = (key: keyof typeof prayers) => {
    setPrayers(prev => {
      const current = prev[key];
      let next: PrayerStatus = 'none';
      if (current === 'none') next = 'jamaah';
      else if (current === 'jamaah') next = 'munfarid';
      else next = 'none';
      return { ...prev, [key]: next };
    });
  };

  const toggleWajib = (key: keyof typeof ibadahWajib) => {
    setIbadahWajib(p => ({ ...p, [key]: !p[key] }));
  };

  const toggleSunnah = (key: keyof typeof ibadahSunnah) => {
    setIbadahSunnah(p => ({ ...p, [key]: !p[key] }));
  };

  // Calculate Progress
  const mandatoryCompleted =
    (fasting.isFasting ? 1 : 0) +
    Object.values(prayers).filter(p => p !== 'none').length +
    Object.values(ibadahWajib).filter(Boolean).length;

  const totalMandatoryTasks = 1 + 5 + 4;
  const progress = (mandatoryCompleted / totalMandatoryTasks) * 100;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const savedUser = localStorage.getItem('currentUser');
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user || !user.nis) {
      setToast({ show: true, message: 'Gagal: Sesi pengguna tidak valid. Silakan login ulang.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await submitJournal({
        date: currentDate.toISOString(), // Use selected date, not new Date()
        fasting,
        prayers,
        ibadahWajib,
        ibadahSunnah,
        reflection
      }, user.nis);

      if (success) {
        setToast({ show: true, message: 'Jurnal berhasil disimpan!', type: 'success' });
      } else {
        setToast({ show: true, message: 'Gagal menyimpan jurnal. Silakan coba lagi.', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Prayer UI
  const getPrayerUI = (status: PrayerStatus) => {
    switch (status) {
      case 'jamaah':
        return {
          bg: 'bg-primary/10 dark:bg-primary/20',
          border: 'border-primary',
          icon: 'mosque',
          text: 'Berjamaah',
          iconColor: 'bg-primary border-primary text-white'
        };
      case 'munfarid':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'person',
          text: 'Sendiri',
          iconColor: 'bg-orange-400 border-orange-400 text-white'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          border: 'border-transparent',
          icon: '',
          text: '',
          iconColor: 'border-gray-300 dark:border-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111813] dark:text-white pb-24">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all">
        {/* Placeholder for left side to balance */}
        <div className="w-10"></div>

        {/* Date Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 rounded-full p-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
          <button
            onClick={handlePrevDay}
            className="size-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <div className="flex flex-col items-center px-2 min-w-[120px]">
            <span className="text-xs font-bold leading-none">
              {ramadhanDay && ramadhanDay > 0
                ? `Hari ke-${ramadhanDay}`
                : "Persiapan"}
            </span>
            <span className="text-[10px] opacity-50 font-medium leading-tight">
              {currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isToday()}
            className={`size-8 flex items-center justify-center rounded-full transition-all ${isToday() ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-700 shadow-sm'}`}
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Placeholder for right side to balance */}
        <div className="w-10"></div>
      </header>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Points Card */}
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-primary/10 dark:bg-primary/20 border border-primary/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">stars</span>
              <p className="text-base font-semibold">Poin Kebaikan</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="tracking-tight text-3xl font-bold leading-none">150</p>
              <p className="text-[#078829] dark:text-primary text-sm font-bold mb-1">+25 hari ini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4 pt-0">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-base font-bold">Target Wajib</p>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">{mandatoryCompleted}/{totalMandatoryTasks} Selesai</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
          <p className="text-[#61896f] dark:text-primary/70 text-sm font-medium">MasyaAllah, lanjutkan istiqamahmu!</p>
        </div>
      </div>

      {/* 1. Puasa (Wajib) */}
      <section className="mt-2">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h3 className="text-lg font-bold">Puasa Ramadhan</h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">WAJIB</span>
        </div>
        <div className="px-4">
          <div className={`rounded-xl border transition-all duration-200 ${fasting.isFasting
            ? 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
            : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30'
            }`}>
            <div
              onClick={() => setFasting(prev => ({ ...prev, isFasting: !prev.isFasting }))}
              className="flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${fasting.isFasting ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-500'}`}>
                  <span className="material-symbols-outlined">{fasting.isFasting ? 'restaurant_menu' : 'no_meals'}</span>
                </div>
                <div>
                  <p className="text-base font-medium">{fasting.isFasting ? 'Saya Berpuasa' : 'Saya Tidak Berpuasa'}</p>
                  {!fasting.isFasting && <p className="text-xs text-orange-600 dark:text-orange-400">Silakan isi alasan di bawah</p>}
                </div>
              </div>
              <div className={`flex items-center justify-center size-6 rounded-md border-2 transition-colors ${fasting.isFasting ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                {fasting.isFasting && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
              </div>
            </div>

            {!fasting.isFasting && (
              <div className="px-4 pb-4 pt-0 animate-[fadeIn_0.3s_ease-out]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Alasan Tidak Puasa</label>
                <input
                  type="text"
                  value={fasting.reason}
                  onChange={(e) => setFasting(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Contoh: Sedang Haid / Sakit / Musafir"
                  className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Shalat 5 Waktu (Wajib) */}
      <section className="mt-4">
        <div className="flex items-center justify-between px-4 pb-2 pt-2">
          <h3 className="text-lg font-bold">Shalat 5 Waktu</h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">WAJIB</span>
        </div>

        {/* Reminder Banner */}
        <div className="px-4 mb-3">
          <div className="flex flex-col sm:flex-row gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mosque</span>
              <span className="font-bold">Putra:</span> Berjamaah di Masjid
            </div>
            <div className="hidden sm:block w-px h-4 bg-blue-200 dark:bg-blue-700"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-bold">Putri:</span> Shalat Tepat Waktu
            </div>
          </div>
          <p className="text-[10px] text-center mt-1 opacity-50">Tap 2x jika shalat sendiri</p>
        </div>

        <div className="px-4 space-y-1">
          {Object.entries(prayers).map(([key, value]) => {
            const ui = getPrayerUI(value as PrayerStatus);
            return (
              <div
                key={key}
                onClick={() => cyclePrayerStatus(key as keyof typeof prayers)}
                className={`flex items-center justify-between py-3 px-4 rounded-lg group transition-all duration-200 cursor-pointer border ${ui.bg} ${ui.border}`}
              >
                <div className="flex items-center gap-3">
                  <p className="text-base font-medium capitalize">{key}</p>
                  {value !== 'none' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${value === 'jamaah' ? 'bg-primary/20 text-green-800 dark:text-primary' : 'bg-orange-200 text-orange-800'}`}>
                      {ui.text}
                    </span>
                  )}
                </div>

                <div className={`flex items-center justify-center size-7 rounded-md border-2 transition-all ${ui.iconColor}`}>
                  {value !== 'none' && <span className="material-symbols-outlined text-sm font-bold">{ui.icon}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Amalan Wajib Sekolah (Dhuha, Tarawih, Rawatib, Tilawah) */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-lg font-bold">Target Sekolah</h3>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold">DIANJURKAN</span>
        </div>
        <div className="px-4 space-y-3">
          {/* Tilawah */}
          <div className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-500">menu_book</span>
              <div>
                <p className="text-base font-medium">Tilawah Al-Quran</p>
                <p className="text-xs opacity-50">Jumlah halaman</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="604"
                value={ibadahWajib.tilawahPages}
                onChange={(e) => setIbadahWajib(prev => ({ ...prev, tilawahPages: parseInt(e.target.value) || 0 }))}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">hlm</span>
            </div>
          </div>

          {/* Dhuha */}
          <div onClick={() => toggleWajib('dhuha')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-orange-500">wb_sunny</span>
              <p className="text-base font-medium">Shalat Dhuha</p>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahWajib.dhuha ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahWajib.dhuha && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Tarawih */}
          <div onClick={() => toggleWajib('tarawih')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500">nights_stay</span>
              <p className="text-base font-medium">Shalat Tarawih</p>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahWajib.tarawih ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahWajib.tarawih && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Witir */}
          <div onClick={() => toggleWajib('witir')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-500">dark_mode</span>
              <div>
                <p className="text-base font-medium">Shalat Witir</p>
                <p className="text-xs opacity-50">Setelah Tarawih</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahWajib.witir ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahWajib.witir && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Zakat */}
          <div onClick={() => toggleWajib('zakat')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">payments</span>
              <div>
                <p className="text-base font-medium">Zakat Fitrah</p>
                <p className="text-xs opacity-50">1x dalam bulan Ramadhan</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahWajib.zakat ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahWajib.zakat && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Jumat */}
          <div onClick={() => toggleWajib('jumat')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-500">event</span>
              <div>
                <p className="text-base font-medium">Shalat Jumat</p>
                <p className="text-xs opacity-50">1x dalam 1 pekan (Putra)</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahWajib.jumat ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahWajib.jumat && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ibadah Tidak Wajib (Iktikaf, Sedekah, Bantu Ortu) */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-lg font-bold">Amalan Tambahan</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">TIDAK WAJIB</span>
        </div>
        <div className="px-4 space-y-3">
          {/* Iktikaf */}
          <div onClick={() => toggleSunnah('iktikaf')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500">accessibility_new</span>
              <p className="text-base font-medium">Iktikaf di Masjid</p>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.iktikaf ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.iktikaf && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Sedekah */}
          <div onClick={() => toggleSunnah('sedekah')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-pink-500">volunteer_activism</span>
              <p className="text-base font-medium">Sedekah / Infaq</p>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.sedekah ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.sedekah && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Membantu Orang Tua */}
          <div onClick={() => toggleSunnah('helpParents')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">family_restroom</span>
              <p className="text-base font-medium">Membantu Orang Tua</p>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.helpParents ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.helpParents && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Rawatib */}
          <div onClick={() => toggleSunnah('rawatib')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-500">prayer_times</span>
              <div>
                <p className="text-base font-medium">Shalat Rawatib</p>
                <p className="text-xs opacity-50">Qobliyah / Ba'diyah</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.rawatib ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.rawatib && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Ceramah Islami */}
          <div onClick={() => toggleSunnah('ceramahIslami')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500">campaign</span>
              <div>
                <p className="text-base font-medium">Ceramah Islami</p>
                <p className="text-xs opacity-50">Kajian / Tausiyah</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.ceramahIslami ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.ceramahIslami && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>

          {/* Shalat Idul Fitri */}
          <div onClick={() => toggleSunnah('shalatIdulFitri')} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm cursor-pointer bg-white dark:bg-background-dark">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-yellow-500">celebration</span>
              <div>
                <p className="text-base font-medium">Shalat Idul Fitri</p>
                <p className="text-xs opacity-50">Di akhir Ramadhan</p>
              </div>
            </div>
            <div className={`flex items-center justify-center size-6 rounded-md border-2 ${ibadahSunnah.shalatIdulFitri ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {ibadahSunnah.shalatIdulFitri && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Reflection */}
      <section className="mt-6 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
          <h3 className="text-lg font-bold">Refleksi Singkat</h3>
        </div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 text-sm focus:ring-primary focus:border-primary dark:text-white resize-none"
          placeholder="Apa hal terbaik yang kamu lakukan hari ini?"
          rows={4}
        />
      </section>

      {/* Action */}
      <div className="p-4 mt-4 space-y-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-[#102216] font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? 'Menyimpan...' : (
            <>
              Simpan Jurnal {isToday() ? 'Hari Ini' : 'Tanggal Ini'}
              <span className="material-symbols-outlined font-variation-filled">check_circle</span>
            </>
          )}
        </button>
        {isToday() && <p className="text-center text-xs opacity-40 font-medium">Kamu dapat mengedit jurnal ini hingga jam 12 malam.</p>}
      </div>
    </div>
  );
};

export default Journal;