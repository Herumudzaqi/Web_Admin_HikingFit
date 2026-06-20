import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Mountain {
  id: string;
  name: string;
}

interface Trail {
  id: string;
  mountainId: string;
  name: string; // Nama Jalur
  startElevation: string; // Ketinggian Pos Awal / Jalur
  elevationGain: string; // Elevasi
  distance: string; // Jarak Tempuh
  estimatedTime: string; // Estimasi Waktu
  description: string; // Deskripsi Jalur
  rules: string; // Informasi & Regulasi
}

const ManajemenJalur: React.FC = () => {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [selectedMountainId, setSelectedMountainId] = useState<string>('');
  
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', startElevation: '', elevationGain: '', distance: '', estimatedTime: '', description: '', rules: ''
  });

  // Fetch mountains for dropdown
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "mountains"), (snapshot) => {
      const data: Mountain[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, name: doc.data().name } as Mountain);
      });
      setMountains(data);
      if (data.length > 0 && !selectedMountainId) {
        setSelectedMountainId(data[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch trails based on selected mountain
  useEffect(() => {
    if (!selectedMountainId) return;

    const q = query(collection(db, "trails"), where("mountainId", "==", selectedMountainId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Trail[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Trail);
      });
      setTrails(data);
    });

    return () => unsubscribe();
  }, [selectedMountainId]);

  const handleOpenModal = (trail?: Trail) => {
    if (!selectedMountainId) {
      alert("Pilih gunung terlebih dahulu.");
      return;
    }
    if (trail) {
      setEditingTrail(trail);
      setFormData({
        name: trail.name, startElevation: trail.startElevation, elevationGain: trail.elevationGain,
        distance: trail.distance, estimatedTime: trail.estimatedTime, description: trail.description, rules: trail.rules
      });
    } else {
      setEditingTrail(null);
      setFormData({
        name: '', startElevation: '', elevationGain: '', distance: '', estimatedTime: '', description: '', rules: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrail(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData, mountainId: selectedMountainId };
      
      if (editingTrail) {
        await updateDoc(doc(db, "trails", editingTrail.id), dataToSave);
      } else {
        await addDoc(collection(db, "trails"), { ...dataToSave, createdAt: new Date().toISOString() });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving trail: ", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jalur ini?")) {
      try {
        await deleteDoc(doc(db, "trails", id));
      } catch (error) {
        console.error("Error deleting trail: ", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-lg relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Manajemen Jalur Gunung</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kelola data jalur pendakian berdasarkan gunung.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-6 py-2.5 rounded-lg font-title-lg text-title-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Jalur
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden flex-1">
        <div className="p-4 border-b border-outline-variant flex items-center gap-4 bg-surface-container/30">
          <label className="font-title-lg text-title-lg font-bold text-on-surface whitespace-nowrap">Pilih Gunung:</label>
          <select 
            className="flex-1 max-w-sm bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={selectedMountainId} onChange={e => setSelectedMountainId(e.target.value)}
          >
            <option value="" disabled>-- Pilih Gunung --</option>
            {mountains.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto flex-1 p-4">
          {!selectedMountainId ? (
            <div className="text-center py-10 text-on-surface-variant">Silakan pilih gunung dari dropdown di atas.</div>
          ) : trails.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">Belum ada jalur terdaftar untuk gunung ini.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trails.map(trail => (
                <div key={trail.id} className="border border-outline-variant rounded-lg p-4 bg-surface hover:border-primary transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-title-lg text-title-lg font-bold text-primary">{trail.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal(trail)} className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button onClick={() => handleDelete(trail.id)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-on-surface-variant mb-4 flex-1">
                    <p><strong className="text-on-surface">Ketinggian Awal:</strong> {trail.startElevation} mdpl</p>
                    <p><strong className="text-on-surface">Elevasi:</strong> {trail.elevationGain}</p>
                    <p><strong className="text-on-surface">Jarak:</strong> {trail.distance} km</p>
                    <p><strong className="text-on-surface">Estimasi Waktu:</strong> {trail.estimatedTime} jam</p>
                  </div>
                  <div className="text-xs text-on-surface-variant bg-surface-container p-2 rounded max-h-24 overflow-y-auto">
                    <strong>Regulasi:</strong> {trail.rules}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingTrail ? 'Edit Jalur' : 'Tambah Jalur'}
              </h3>
              <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama Jalur (Contoh: Jalur Ranu Pani)</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Ketinggian Pos Awal (mdpl)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.startElevation} onChange={e => setFormData({...formData, startElevation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Total Elevasi (m)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.elevationGain} onChange={e => setFormData({...formData, elevationGain: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Jarak Tempuh (km)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Estimasi Waktu (jam)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Deskripsi Jalur</label>
                  <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Informasi & Regulasi Khusus</label>
                  <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-outline-variant rounded-md hover:bg-surface-container">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-surface-tint">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenJalur;
