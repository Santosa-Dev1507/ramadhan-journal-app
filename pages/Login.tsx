import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login: React.FC = () => {
  const [nis, setNis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis) return;

    setIsLoading(true);
    setError('');


    const user = await loginUser(nis);
    setIsLoading(false);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirect based on user role (case-insensitive + support 'Guru')
      const userClass = (user.class || '').toLowerCase();
      if (userClass === 'teacher' || userClass === 'guru') {
        navigate('/teacher');
      } else {
        navigate('/goal-setup');
      }
    } else {
      setError('NIS tidak ditemukan. Coba "12345678" atau "TEACHER01"');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-[#111813] dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-6">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-center">
          Jurnal Ramadhan<br />
          <span className="text-xs">SMP Negeri 5 Klaten</span>
        </h2>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 w-full">
        <div className="relative w-full aspect-square max-w-[280px] mb-8">
          {/* Islamic Pattern Effect using CSS Radial Gradient dots */}
          <div className="absolute inset-0 rounded-full opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#13ec5b 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
          </div>

          <div className="relative w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-white dark:border-background-dark shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiG7giGwQ3wghRMzrtL8C4wwHik23P4wcXQdRmZFtqabRkXsEZSG_fqgV_YlBe9UD-E-lIFE9Js_DWWkyyBGIPLMWOakQEQg2tlG01NKbO9CkMYE-EGI2VlUc4nY6wZ82G7j7Fps-07uvtZSSGHeW1S1KtZ4DKIx-sF6n23gwOUbpk4GXWm05OeMH5oKUj4NuU1qVT99tuVPfwN3cZ_zAnKaVVmZIpGTmd4epPBRpTPBNlDSwCRcKkfm_fS-Rn6d_MapXFr6s0BbCu"
              alt="Mosque 3D Illustration"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img
              src="/logo.png"
              alt="Logo SMP Negeri 5 Klaten"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold leading-tight mb-3">Marhaban ya Ramadhan</h1>
          <p className="opacity-70 text-base">Masukkan NIS kamu untuk mulai mencatat ibadah dan targetmu.</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="nis" className="block text-sm font-semibold opacity-80 ml-1">
              Nomor Induk Siswa (NIS)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined opacity-40">badge</span>
              </div>
              <input
                id="nis"
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Masukkan NIS kamu"
                className="block w-full h-16 pl-12 pr-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-lg font-medium focus:ring-primary focus:border-primary placeholder:opacity-30 transition-all dark:text-white"
              />
            </div>
            {error && <p className="text-red-500 text-sm ml-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-[#102216] text-lg font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? 'Memuat...' : (
              <>
                Masuk
                <span className="material-symbols-outlined font-bold">login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm opacity-60">
            Tidak tahu NIS kamu? <a href="https://wa.me/6285742499081" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Tanya gurumu</a>
          </p>
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;