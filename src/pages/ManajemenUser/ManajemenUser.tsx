import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { logActivity } from '../../utils/activityLogger';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

const ManajemenUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User', status: 'Aktif' });

  // Real-time listener for users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'User', status: 'Aktif' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        await updateDoc(doc(db, "users", editingUser.id), formData);
        await logActivity("Update User", `Mengubah data user ${formData.name}`);
      } else {
        // Add new user (Note: This only adds to Firestore, not Firebase Auth)
        await addDoc(collection(db, "users"), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        await logActivity("Create User", `Menambahkan user ${formData.name}`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user: ", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await deleteDoc(doc(db, "users", user.id));
        await logActivity("Delete User", `Menghapus user ${user.name}`);
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    }
  };

  const handleSuspend = async (user: User) => {
    try {
      const newStatus = user.status === 'Suspended' ? 'Aktif' : 'Suspended';
      await updateDoc(doc(db, "users", user.id), { status: newStatus });
      await logActivity("Update User", `Mengubah status user ${user.name} menjadi ${newStatus}`);
    } catch (error) {
      console.error("Error suspending user: ", error);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-lg relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Manajemen User</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kelola data user dan administrator sistem.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-6 py-2.5 rounded-lg font-title-lg text-title-lg flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah User
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md text-on-surface transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30">
                <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">User</th>
                <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Role</th>
                <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Status</th>
                <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant">Belum ada data user.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-title-lg text-title-lg text-on-surface">{user.name || 'Unknown User'}</div>
                        <div className="font-body-md text-[13px] text-on-surface-variant">{user.email || 'No Email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">{user.role}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.status === 'Aktif' ? 'bg-primary-container/20 text-primary border-primary/20' : 
                      user.status === 'Suspended' ? 'bg-error-container/50 text-error border-error/20' : 
                      'bg-surface-variant text-on-surface-variant border-outline-variant'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(user)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Hapus">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                      <button onClick={() => handleSuspend(user)} className="p-1.5 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-md transition-colors" title="Suspend / Unsuspend">
                        <span className="material-symbols-outlined text-[20px]">{user.status === 'Suspended' ? 'check_circle' : 'block'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingUser ? 'Edit User' : 'Tambah User'}
              </h3>
              <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-primary focus:border-primary"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                <input 
                  type="email" required disabled={!!editingUser}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-primary focus:border-primary disabled:bg-surface-container"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Role</label>
                <select 
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-primary focus:border-primary"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-primary focus:border-primary"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded-md hover:bg-surface-container">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-surface-tint">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenUser;
