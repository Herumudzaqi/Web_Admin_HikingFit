import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

interface Mountain {
  id: string;
  name: string;
  location: string;
  province: string;
  elevation: number | string;
  difficulty?: string;
  status: string;
  imageUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
  description?: string;
}

const ManajemenGunung: React.FC = () => {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);
  const [formData, setFormData] = useState({
    name: '', location: '', province: 'Jawa Tengah', elevation: '', difficulty: 'Medium', status: 'Buka',
    latitude: '', longitude: '', description: '', imageUrl: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "mountains"), (snapshot) => {
      const data: Mountain[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Mountain);
      });
      setMountains(data);
    }, (error) => {
      console.error("Error fetching mountains: ", error);
      toast.error("Gagal memuat data gunung dari Firebase.");
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (mountain?: Mountain) => {
    if (mountain) {
      setEditingMountain(mountain);
      setFormData({
        name: mountain.name, 
        location: mountain.location, 
        province: mountain.province || 'Jawa Tengah',
        elevation: mountain.elevation.toString(), 
        difficulty: mountain.difficulty || 'Medium',
        status: mountain.status,
        latitude: mountain.latitude?.toString() || '', 
        longitude: mountain.longitude?.toString() || '', 
        description: mountain.description || '',
        imageUrl: mountain.imageUrl || '' // Mengambil URL yang sudah ada
      });
    } else {
      setEditingMountain(null);
      setFormData({
        name: '', location: '', province: 'Jawa Tengah', elevation: '', difficulty: 'Medium', status: 'Buka',
        latitude: '', longitude: '', description: '', imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMountain(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const dataToSave = { 
        name: formData.name,
        location: formData.location,
        province: formData.province,
        elevation: Number(formData.elevation),
        difficulty: formData.difficulty,
        status: formData.status,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        description: formData.description,
        imageUrl: formData.imageUrl, // Cukup simpan URL Teksnya saja
        updatedAt: new Date().toISOString()
      };

      if (editingMountain) {
        await updateDoc(doc(db, "mountains", editingMountain.id), dataToSave);
        toast.success("Data gunung berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "mountains"), { ...dataToSave, createdAt: new Date().toISOString() });
        toast.success("Gunung baru berhasil ditambahkan!");
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving mountain: ", error);
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus gunung ini?")) {
      try {
        await deleteDoc(doc(db, "mountains", id));
        toast.success("Gunung berhasil dihapus.");
      } catch (error: any) {
        console.error("Error deleting mountain: ", error);
        toast.error(error.message || "Gagal menghapus data gunung.");
      }
    }
  };

  const filteredMountains = mountains.filter(m => {
    return m.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full gap-lg relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Manajemen Gunung</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kelola data pegunungan dan koordinat cuaca (Database Only).</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-6 py-2.5 rounded-lg font-title-lg text-title-lg flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Gunung
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg flex-1">
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                type="text" placeholder="Cari nama gunung..." 
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md text-on-surface transition-colors"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/30">
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Gunung</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Lokasi</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Ketinggian</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Level</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMountains.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Belum ada data gunung.</td></tr>
                ) : filteredMountains.map((mount) => (
                  <tr key={mount.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {mount.imageUrl ? (
                           <img src={mount.imageUrl} alt={mount.name} className="w-12 h-12 rounded-lg object-cover border border-outline-variant" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined">landscape</span>
                          </div>
                        )}
                        <div>
                          <div className="font-title-lg text-title-lg text-on-surface font-medium">{mount.name}</div>
                          <div className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">{mount.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">{mount.location}</td>
                    <td className="py-4 px-4 font-label-md text-label-md text-on-surface-variant font-bold">{mount.elevation} mdpl</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        mount.difficulty === 'Light' ? 'bg-primary/20 text-primary' : 
                        mount.difficulty === 'Medium' ? 'bg-tertiary/20 text-tertiary' : 
                        'bg-error/20 text-error'
                      }`}>
                        {mount.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(mount)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(mount.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Hapus">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled text-[24px]">landscape</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase">Total Gunung</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{mountains.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingMountain ? 'Edit Gunung' : 'Tambah Gunung'}
              </h3>
              <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* BAGIAN GAMBAR (HANYA URL MANUAL) */}
              <div className="sm:col-span-2 bg-surface-container p-4 rounded-lg border border-outline-variant">
                <label className="block text-sm font-bold text-on-surface mb-2">Link Gambar Gunung</label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 border rounded-md text-sm mb-2" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  placeholder="Paste URL gambar dari Google di sini..." 
                />
                
                {/* Preview Gambar */}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-on-surface-variant mb-1">Preview:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="h-24 w-auto rounded-lg object-cover border border-outline"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Link+Rusak')}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama Gunung</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth: Gunung Prau" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Ketinggian (Angka saja)</label>
                  <input type="number" required className="w-full px-3 py-2 border rounded-md" value={formData.elevation} onChange={e => setFormData({...formData, elevation: e.target.value})} placeholder="2565" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Lokasi Detail</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Dieng, Jawa Tengah" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Tingkat Kesulitan</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="Light">Light (Mudah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="Hard">Hard (Sulit)</option>
                  </select>
                </div>
                
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 mb-[-10px]">
                    <p className="text-xs text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cloud</span> Koordinat Cuaca (Wajib)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Latitude</label>
                    <input type="number" step="any" required className="w-full px-3 py-2 border rounded-md bg-white" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="-7.1895" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Longitude</label>
                    <input type="number" step="any" required className="w-full px-3 py-2 border rounded-md bg-white" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="109.9213" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Status Operasional</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Buka">Buka / Aktif</option>
                    <option value="Tutup">Ditutup Sementara</option>
                    <option value="Waspada">Waspada Cuaca</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Deskripsi Gunung</label>
                  <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded-md hover:bg-surface-container">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-surface-tint disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? 'Menyimpan...' : 'Simpan Gunung'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenGunung;