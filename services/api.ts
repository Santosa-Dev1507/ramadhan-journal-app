import { Student, Goal, JournalEntry, Badge } from '../types';

/**
 * GOOGLE SHEETS BACKEND INSTRUCTION:
 * 
 * 1. Deploy your Apps Script as a Web App (Execute as: Me, Access: Anyone).
 * 2. Paste the Deployment URL below into 'GOOGLE_SCRIPT_URL'.
 * 3. Set USE_MOCK_DATA to false.
 */

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzjgBu9xsuSS-imeJx4VXe06vyLqoSzD86-Viavf0YEmQ3IHnVAEqWtaEHrPBYqZbCbJw/exec';
const USE_MOCK_DATA = false; // ✅ Connected to Google Sheets!

// --- MOCK DATA (Fallback) ---

const MOCK_USER: Student = {
  id: '1',
  name: 'Ahmad Fauzi',
  nis: '2024019',
  class: '9-A (Unggulan)',
  points: 1250,
  streak: 7,
  gender: 'male',
  avatarId: 'male',
  avatarUrl: '/avatars/male.svg',
  journalCompletion: 0,
  startRamadhanDate: '2026-02-18',
  stats: {
    fastingDays: 14,
    prayerPercentage: 98,
    jamaahRatio: 85,
    currentJuz: 14
  }
};

const MOCK_GOALS: Goal[] = [
  { id: '1', title: 'Shalat 5 Waktu', description: 'Putra Berjamaah di Masjid, Putri Tepat Waktu', type: 'mandatory', icon: 'mosque', isSelected: true },
  { id: '2', title: 'Puasa Ramadhan', description: 'Menahan lapar & hawa nafsu', type: 'mandatory', icon: 'no_meals', isSelected: true },
  { id: '3', title: 'Tilawah Al-Quran', description: 'Membaca Al-Quran', type: 'mandatory', icon: 'menu_book', isSelected: true },
  { id: '4', title: 'Shalat Dhuha', description: 'Minimal 2 rakaat', type: 'mandatory', icon: 'wb_sunny', color: 'orange', isSelected: true },
  { id: '5', title: 'Shalat Tarawih', description: 'Menghidupkan malam Ramadhan', type: 'mandatory', icon: 'nights_stay', color: 'blue', isSelected: true },
  { id: '6', title: 'Shalat Witir', description: '1 atau 3 rakaat setelah Tarawih', type: 'mandatory', icon: 'dark_mode', color: 'purple', isSelected: true },
  { id: '7', title: 'Zakat Fitrah', description: '1x dalam bulan Ramadhan', type: 'mandatory', icon: 'payments', color: 'green', isSelected: true },
  { id: '8', title: 'Shalat Jumat', description: '1x dalam 1 pekan (Putra)', type: 'mandatory', icon: 'event', color: 'teal', isSelected: true },
  { id: '9', title: 'Shalat Rawatib', description: 'Sunnah Qobliyah & Ba\'diyah', type: 'optional', icon: 'prayer_times', color: 'zinc', isSelected: false },
  { id: '10', title: 'Iktikaf', description: 'Berdiam diri di masjid (akhir Ramadhan)', type: 'optional', icon: 'accessibility_new', color: 'zinc', isSelected: false },
  { id: '11', title: 'Sedekah', description: 'Infaq atau berbagi takjil', type: 'optional', icon: 'volunteer_activism', color: 'pink', isSelected: true },
  { id: '12', title: 'Membantu Orang Tua', description: 'Menyiapkan sahur/buka', type: 'optional', icon: 'family_restroom', color: 'green', isSelected: true },
  { id: '13', title: 'Ceramah Islami', description: 'Mendengarkan kajian/tausiyah', type: 'optional', icon: 'campaign', color: 'blue', isSelected: false },
  { id: '14', title: 'Shalat Idul Fitri', description: 'Di akhir Ramadhan', type: 'optional', icon: 'celebration', color: 'yellow', isSelected: false },
];

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Early Bird Sahur', icon: 'wb_twilight', color: 'primary', isUnlocked: true },
  { id: '2', name: 'Tadarus Level 1', icon: 'menu_book', color: 'blue', isUnlocked: true },
  { id: '3', name: 'Sedekah Subuh', icon: 'volunteer_activism', color: 'purple', isUnlocked: true },
  { id: '4', name: 'Jamaah Masjid', icon: 'mosque', color: 'zinc', isUnlocked: false },
  { id: '5', name: 'Quran Finisher', icon: 'emoji_events', color: 'zinc', isUnlocked: false },
  { id: '6', name: 'Night Owl', icon: 'nightlight_round', color: 'zinc', isUnlocked: false },
];

// Shared mock students for Leaderboard and Teacher
const MOCK_STUDENTS_LIST: Student[] = [
  MOCK_USER,
  {
    ...MOCK_USER,
    id: '2',
    name: 'Siti Aminah',
    nis: '2024022',
    points: 1450,
    class: '9-A (Unggulan)',
    gender: 'female',
    avatarId: 'female',
    journalCompletion: 0,
    avatarUrl: '/avatars/female.svg',
    stats: { fastingDays: 14, prayerPercentage: 90, jamaahRatio: 20, currentJuz: 8 }
  },
  {
    ...MOCK_USER,
    id: '3',
    name: 'Budi Santoso',
    nis: '2024041',
    points: 980,
    class: '9-B',
    gender: 'male',
    avatarId: 'male',
    journalCompletion: 0,
    avatarUrl: '/avatars/male.svg',
    stats: { fastingDays: 10, prayerPercentage: 60, jamaahRatio: 15, currentJuz: 2 }
  },
  {
    ...MOCK_USER,
    id: '4',
    name: 'Lia Permata',
    nis: '2024056',
    points: 1320,
    class: '9-A (Unggulan)',
    gender: 'female',
    avatarId: 'female',
    journalCompletion: 0,
    avatarUrl: '/avatars/female.svg',
    stats: { fastingDays: 15, prayerPercentage: 100, jamaahRatio: 90, currentJuz: 15 }
  },
  {
    ...MOCK_USER,
    id: '5',
    name: 'Rizky Ramadhan',
    nis: '2024088',
    points: 850,
    class: '9-B',
    gender: 'male',
    avatarId: 'male',
    journalCompletion: 0,
    avatarUrl: '/avatars/male.svg',
    stats: { fastingDays: 12, prayerPercentage: 80, jamaahRatio: 40, currentJuz: 5 }
  }
];

// --- HELPER: Fetch with Retry Logic ---
// Ini penting untuk 500 siswa. Jika Google Sheets sibuk, dia akan mencoba lagi sampai 3x.
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... attempts left: ${retries}. Waiting ${backoff}ms`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2); // Exponential backoff
    } else {
      throw error;
    }
  }
}

// --- API FUNCTIONS ---

export const loginUser = async (nis: string): Promise<Student | null> => {
  // Hardcoded check for Teacher and specific Students (Bypass Google Sheets for critical users)
  if (nis.toUpperCase() === 'TEACHER01') {
    return { ...MOCK_USER, id: 'teacher', name: 'Pak Budi', class: 'Teacher', nis: 'TEACHER01', role: 'teacher' } as any;
  }
  if (nis === '12345678') {
    return MOCK_USER;
  }

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return null;
  }

  try {
    // Menggunakan fetchWithRetry agar login stabil saat trafik tinggi
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=login&nis=${nis}`);
    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Login failed", error);
    return null;
  }
};

export const getGoals = async (): Promise<Goal[]> => {
  if (USE_MOCK_DATA) return MOCK_GOALS;

  try {
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=getGoals`);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    console.error("Get goals failed", error);
    return [];
  }
};

export const getBadges = async (): Promise<Badge[]> => {
  if (USE_MOCK_DATA) return MOCK_BADGES;
  return MOCK_BADGES;
};

export const getJournalEntry = async (dateIsoString: string): Promise<JournalEntry | null> => {
  const dateKey = dateIsoString.split('T')[0];

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(`journal_${dateKey}`);
    if (stored) return JSON.parse(stored);
    return null;
  }

  try {
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=getJournal&date=${dateKey}`);
    const result = await response.json();
    return result.status === 'success' ? result.data : null;
  } catch (error) {
    console.error("Get journal failed", error);
    return null;
  }
}

export const submitJournal = async (entry: JournalEntry): Promise<boolean> => {
  const dateKey = entry.date.split('T')[0];

  if (USE_MOCK_DATA) {
    console.log("Mock Submit:", entry);
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(`journal_${dateKey}`, JSON.stringify(entry));
    return true;
  }

  try {
    // Menggunakan fetchWithRetry untuk submit data
    const response = await fetchWithRetry(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submitJournal', ...entry }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    const result = await response.json();
    console.log("Submit Response:", result); // Debugging

    if (result.status === 'success') {
      return true;
    } else {
      console.error("Submit failed with status:", result.status, result.message);
      return false;
    }
  } catch (error) {
    console.error("Submit journal failed", error);
    return false;
  }
};

export const updateUserProfile = async (student: Student): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update local storage simulation if needed
    return true;
  }

  try {
    await fetchWithRetry(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateProfile', ...student }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });
    return true;
  } catch (error) {
    console.error("Update profile failed", error);
    return false;
  }
};

export const getStudentHistory = async (studentId: string): Promise<JournalEntry[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const history: JournalEntry[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isGoodStudent = studentId === '1' || studentId === '4';
      const randomFactor = isGoodStudent ? 0.9 : 0.5;

      history.push({
        date: date.toISOString(),
        fasting: {
          isFasting: Math.random() < randomFactor,
          reason: Math.random() < randomFactor ? '' : 'Sakit'
        },
        prayers: {
          subuh: Math.random() < randomFactor ? 'jamaah' : 'munfarid',
          dzuhur: 'jamaah',
          ashar: Math.random() < randomFactor ? 'jamaah' : 'none',
          maghrib: Math.random() < randomFactor ? 'jamaah' : 'munfarid',
          isya: Math.random() < randomFactor ? 'jamaah' : 'none',
        },
        ibadahWajib: {
          tilawahPages: Math.floor(Math.random() * 21), // 0-20 halaman
          dhuha: Math.random() < randomFactor,
          tarawih: Math.random() < randomFactor,
          witir: Math.random() < randomFactor,
          zakat: i === 0 && Math.random() < randomFactor, // Hanya hari ini (simulasi 1x/bulan)
          jumat: date.getDay() === 5 && Math.random() < randomFactor // Hanya Jumat
        },
        ibadahSunnah: {
          iktikaf: false,
          sedekah: Math.random() > 0.7,
          helpParents: true,
          rawatib: Math.random() < randomFactor,
          ceramahIslami: Math.random() > 0.8,
          shalatIdulFitri: false // Hanya di akhir Ramadhan
        },
        reflection: 'Alhamdulillah hari ini lancar.'
      });
    }
    return history;
  }
  try {
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=getHistory&studentId=${studentId}`);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    console.error("Get student history failed", error);
    return [];
  }
}

export const getTeacherStats = async () => {
  if (USE_MOCK_DATA) {
    return {
      avgCompletion: 85.4,
      totalPoints: 12400,
      students: MOCK_STUDENTS_LIST
    }
  }

  try {
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=getTeacherStats`);
    const result = await response.json();
    return result.status === 'success' ? result.data : {
      avgCompletion: 0,
      totalPoints: 0,
      students: []
    };
  } catch (error) {
    console.warn("Fetch teacher stats failed, using empty data", error);
    return {
      avgCompletion: 0,
      totalPoints: 0,
      students: []
    };
  }
}

export const getLeaderboard = async (): Promise<Student[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Sort by points descending
    return [...MOCK_STUDENTS_LIST].sort((a, b) => b.points - a.points);
  }

  try {
    const response = await fetchWithRetry(`${GOOGLE_SCRIPT_URL}?action=getLeaderboard`);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    return [];
  }
}