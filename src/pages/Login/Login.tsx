import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { logActivity } from '../../utils/activityLogger';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan isi email dan password.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      
      await logActivity("Login", "User berhasil login");
      
      // Jika berhasil, Firebase akan menyimpan sesi secara otomatis (IndexedDB/LocalStorage)
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-hidden flex items-center justify-center font-body-md w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-surface/40 backdrop-blur-sm z-10 mix-blend-overlay"></div>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZOXr3bHeu-2YeCdKPMKaFudgtPpl0ufgxUjUMms0ijreLyaGc2sw6aFWqU5zYsjxDaMOV5kR16fAVUUPD0v8fxWbHAvSV6x4eh3BMh1r891oZZVYBU1Bb9qJbpgYUM-wNLwt2PQrTZghu4LbgodD2iZg8DJcaaLJfiB--5z5PfEUP4ug6zMFhl48gWvWSiAEAVNWuq6dBhpsSncR_qdvZsnVnrvGhpdCoh5c93oPBAD2S9AuYNdlhKPdqpwM4EIpqa_ZkvVPXqUo" 
          alt="Majestic mountain landscape at dawn" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Login Card Container */}
      <div className="relative z-20 w-full max-w-md px-md">
        {/* Brand / Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface mb-md shadow-sm">
            <span className="material-symbols-outlined text-4xl text-primary filled">landscape</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-inverse-surface mb-xs drop-shadow-md">HikingFit</h1>
          <p className="font-body-md text-body-md text-inverse-surface/80 drop-shadow-sm font-medium">Admin Console</p>
        </div>

        {/* Glassmorphic Login Form */}
        <div className="glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.12)] p-lg transition-transform duration-300 hover:-translate-y-1">
          <h2 className="font-title-lg text-title-lg text-on-surface mb-lg">Welcome back</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-md">
            {/* Email Field */}
            <div className="relative group">
              <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant block mb-xs">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant z-10 pointer-events-none">mail</span>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="admin@hikingfit.com" 
                  required 
                  className="w-full bg-surface-container-lowest border border-outline rounded-lg py-sm pl-10 pr-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-xs">
                <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant block">Password</label>
                <a href="#" className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors">Forgot password?</a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant z-10 pointer-events-none">lock</span>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full bg-surface-container-lowest border border-outline rounded-lg py-sm pl-10 pr-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Keep me logged in */}
            <div className="flex items-center mt-sm mb-xl">
              <input 
                type="checkbox" 
                id="remember-me" 
                name="remember-me" 
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary bg-surface-container-lowest" 
              />
              <label htmlFor="remember-me" className="ml-2 block font-body-md text-body-md text-on-surface-variant">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-sm px-4 border border-transparent rounded-lg shadow-sm font-title-lg text-title-lg text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Sign in to Workspace'}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-lg text-center">
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-2">
              Belum punya akun? <Link to="/register" className="text-primary hover:underline font-medium">Daftar di sini</Link>
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs opacity-80">
              Protected by secure systems. Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
