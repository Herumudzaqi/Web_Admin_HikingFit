import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { logActivity } from '../../utils/activityLogger';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('User'); // Default to User
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Silakan isi semua field.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save extra user data (like name and role) to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      });

      await updateProfile(user, { displayName: name });

      // Log activity
      await logActivity("Tambah User", "User baru berhasil didaftarkan");

      // Redirect to login or dashboard
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan registrasi');
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

      {/* Register Card Container */}
      <div className="relative z-20 w-full max-w-md px-md py-xl">
        {/* Brand / Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface mb-md shadow-sm">
            <span className="material-symbols-outlined text-4xl text-primary filled">landscape</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-inverse-surface mb-xs drop-shadow-md">HikingFit</h1>
          <p className="font-body-md text-body-md text-inverse-surface/80 drop-shadow-sm font-medium">Buat Akun Baru</p>
        </div>

        {/* Glassmorphic Form */}
        <div className="glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.12)] p-lg transition-transform duration-300 hover:-translate-y-1">
          <h2 className="font-title-lg text-title-lg text-on-surface mb-lg">Register</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-md">
            {/* Name Field */}
            <div className="relative group">
              <label htmlFor="name" className="font-label-md text-label-md text-on-surface-variant block mb-xs">Nama Lengkap</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant z-10 pointer-events-none">person</span>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Nama Lengkap" 
                  required 
                  className="w-full bg-surface-container-lowest border border-outline rounded-lg py-sm pl-10 pr-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

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

            {/* Role Selection */}
            <div className="relative group">
              <label htmlFor="role" className="font-label-md text-label-md text-on-surface-variant block mb-xs">Role</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant z-10 pointer-events-none">badge</span>
                <select
                  id="role"
                  name="role"
                  className="w-full bg-surface-container-lowest border border-outline rounded-lg py-sm pl-10 pr-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-sm px-4 border border-transparent rounded-lg shadow-sm font-title-lg text-title-lg text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-lg text-center">
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Sudah punya akun? <Link to="/login" className="text-primary hover:underline font-medium">Login di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
