import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

interface Mountain {
  id: string;
  name: string;
  location: string;
  province: string;
  elevation: string;
  status: string;
  imageUrl?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
}

const ManajemenGunung: React.FC = () => {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);
  const [formData, setFormData] = useState({
    name: '', location: '', province: 'Jawa Timur', elevation: '', status: 'Aktif',
    latitude: '', longitude: '', description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        name: mountain.name, location: mountain.location, province: mountain.province || 'Jawa Timur',
        elevation: mountain.elevation, status: mountain.status,
        latitude: mountain.latitude || '', longitude: mountain.longitude || '', description: mountain.description || ''
      });
    } else {
      setEditingMountain(null);
      setFormData({
        name: '', location: '', province: 'Jawa Timur', elevation: '', status: 'Aktif',
        latitude: '', longitude: '', description: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMountain(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      
      // Karena keterbatasan Firebase Spark Plan, kita tidak melakukan unggah ke Storage.
      // Jika ada file yang dipilih, kita hanya akan menyimpan nama filenya saja sebagai placeholder URL
      // atau membuat URL objek lokal/dummy untuk tampilan UI.
      let imageUrl = editingMountain?.imageUrl || '';

      if (imageFile) {
        // Hanya simpan nama file atau path dummy karena storage tidak tersedia
        imageUrl = `placeholder://image/${imageFile.name}`;
      }

      const dataToSave = { ...formData, imageUrl };

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
      // Toast notification for proper error handling
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data gunung.");
    } finally {
      setIsUploading(false); // Pastikan tombol kembali aktif meskipun gagal
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
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = filterProvince ? m.province === filterProvince : true;
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="flex flex-col h-full gap-lg relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Manajemen Gunung</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kelola data pegunungan, gambar (Opsional), rute, dan status operasional.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-6 py-2.5 rounded-lg font-title-lg text-title-lg flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Gunung
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg flex-1">
        {/* Left Column: Table */}
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
            <select 
              className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            >
              <option value="">Semua Provinsi</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="NTB">NTB</option>
            </select>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/30">
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Gunung</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Lokasi</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Ketinggian</th>
                  <th className="py-3 px-4 font-title-lg text-title-lg text-on-surface-variant">Status</th>
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
                        {mount.imageUrl && !mount.imageUrl.startsWith('placeholder://') ? (
                          <img src={mount.imageUrl} alt={mount.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                        ) : mount.imageUrl && mount.imageUrl.startsWith('placeholder://') ? (
                          <div className="w-12 h-12 rounded-lg bg-secondary/20 text-secondary flex flex-col items-center justify-center font-bold relative group/tooltip" title={mount.imageUrl.replace('placeholder://image/', '')}>
                            <span className="material-symbols-outlined text-[20px]">image</span>
                          </div>
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        mount.status === 'Aktif' ? 'bg-primary-container/20 text-primary border-primary/20' : 
                        'bg-error-container/50 text-error border-error/20'
                      }`}>
                        {mount.status}
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

        {/* Right Column: Status Summary */}
        <div className="flex flex-col gap-lg">
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled text-[24px]">landscape</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase">Total Gunung Terdaftar</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{mountains.length}</h3>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center text-error">
              <span className="material-symbols-outlined filled text-[24px]">block</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase">Ditutup Sementara</p>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                {mountains.filter(m => m.status === 'Ditutup Sementara').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama Gunung</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Ketinggian (mdpl)</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.elevation} onChange={e => setFormData({...formData, elevation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Lokasi Detail</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Provinsi</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="NTB">NTB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Latitude</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="-8.107717" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Longitude</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="112.922363" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Status Operasional</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Aktif">Aktif</option>
                    <option value="Ditutup Sementara">Ditutup Sementara</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Deskripsi Gunung</label>
                  <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Gambar Gunung (Opsional)</label>
                  <input type="file" accept="image/*" className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
                  {editingMountain?.imageUrl && !imageFile && (
                    <div className="mt-2 text-xs text-on-surface-variant">Gambar saat ini: {editingMountain.imageUrl.replace('placeholder://image/', '')}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded-md hover:bg-surface-container">Batal</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-surface-tint disabled:opacity-50">
                  {isUploading ? 'Menyimpan...' : 'Simpan Data'}
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
