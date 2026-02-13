export interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  points: number;
  streak: number;
  avatarUrl: string;
  gender: 'male' | 'female';
  avatarId?: 'male' | 'female'; // User's selected avatar
  journalCompletion: number;
  startRamadhanDate?: string; // Format: 'YYYY-MM-DD' (e.g., '2026-02-18')
  stats?: {
    fastingDays: number;     // Total hari puasa
    prayerPercentage: number; // % Shalat 5 waktu
    jamaahRatio: number;      // % Shalat berjamaah vs Munfarid
    currentJuz: number;       // Posisi tilawah terakhir
  };
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'mandatory' | 'optional';
  icon: string;
  color?: string; // Tailwind color class snippet like 'blue-500'
  isSelected: boolean;
}

export type PrayerStatus = 'none' | 'jamaah' | 'munfarid';

export interface JournalEntry {
  date: string;
  fasting: {
    isFasting: boolean;
    reason: string;
  };
  prayers: {
    subuh: PrayerStatus;
    dzuhur: PrayerStatus;
    ashar: PrayerStatus;
    maghrib: PrayerStatus;
    isya: PrayerStatus;
  };
  ibadahWajib: {
    tilawahPages: number;    // Jumlah halaman yang dibaca
    dhuha: boolean;
    tarawih: boolean;
    witir: boolean;
    zakat: boolean;          // 1x dalam bulan Ramadhan
    jumat: boolean;          // 1x dalam 1 pekan
  };
  ibadahSunnah: {
    iktikaf: boolean;
    sedekah: boolean;
    helpParents: boolean;
    rawatib: boolean;        // Dipindah dari wajib
    ceramahIslami: boolean;
    shalatIdulFitri: boolean;
  };
  reflection: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
}

// App Script Response Wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}