import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hapus Link karena tombol register dihapus
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '../../config/firebase'; 
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
      
      // 1. Proses Autentikasi Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Cek Role di Firestore
      const userDocRef = doc(db, 'users', user.uid); 
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // 3. Validasi Role Admin
        if (userData.role && userData.role.toLowerCase() === 'admin') {
          
          // 4. MINTA TOKEN FRESH KE FIREBASE LALU SIMPAN UNTUK BACKEND NODE.JS
          const token = await user.getIdToken(true);
          localStorage.setItem('token', token); // <--- Kunci Utama agar halaman Manajemen tidak error!
          
          await logActivity("Login Admin", "User berhasil login");
          navigate('/dashboard'); // Sukses masuk ke dashboard
        } else {
          // Jika bukan admin, paksa logout dan tampilkan error
          await signOut(auth);
          setError('Akses ditolak! Anda tidak memiliki izin Admin.');
        }
      } else {
        // Jika data user tidak ada di Firestore
        await signOut(auth);
        setError('Data akun tidak ditemukan di database.');
      }

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
              {/* Lupa Password dihapus, margin bawah disesuaikan */}
              <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant block mb-xs">Password</label>
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

          {/* Footer Text - Register Dihapus */}
          <div className="mt-lg text-center pt-4 border-t border-outline/30">
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