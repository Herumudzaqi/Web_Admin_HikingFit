import React, { useState, useEffect } from 'react';

export default function ManajemenGunung() {
  const [mountains, setMountains] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // STATE TANPA INPUT MANUAL CUACA
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    province: '',
    latitude: '',
    longitude: '',
    difficulty: 'Medium',
    elevation: '',
    status: 'Buka',
    imageUrl: '',
    description: '',
    estimatedDuration: '', 
    distance: ''
  });

  const fetchMountains = async () => {
    setIsLoading(true);
    try {
      // VITE_API_URL ini akan mengarah ke localhost Abang dari file .env
      const res = await fetch(`${import.meta.env.VITE_API_URL}/mountains`); 
      const json = await res.json();
      if (json.success) {
        setMountains(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMountains();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', location: '', province: '', latitude: '', longitude: '', 
      difficulty: 'Medium', elevation: '', status: 'Buka', imageUrl: '', description: '',
      estimatedDuration: '', distance: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mountain: any) => {
    setEditingId(mountain.id);
    setFormData({
      name: mountain.name || '',
      location: mountain.location || '',
      province: mountain.province || '',
      latitude: mountain.latitude || '',
      longitude: mountain.longitude || '',
      difficulty: mountain.difficulty || 'Medium',
      elevation: mountain.elevation || '',
      status: mountain.status || 'Buka',
      imageUrl: mountain.imageUrl || '',
      description: mountain.description || '',
      estimatedDuration: mountain.estimatedDuration || '', 
      distance: mountain.distance || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus gunung ini?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/mountains/${id}`, { method: 'DELETE' });
        fetchMountains();
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/mountains/${editingId}`
        : `${import.meta.env.VITE_API_URL}/mountains`;
        
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setIsModalOpen(false);
      fetchMountains();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Gunung</h1>
        <button 
          onClick={handleAdd}
          className="bg-[#4A7C59] hover:bg-[#3b6347] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Tambah Gunung
        </button>
      </div>

      {/* TABEL DATA GUNUNG */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Foto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama Gunung</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Lokasi & Ketinggian</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Durasi, Jarak & Cuaca Real-time</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading data...</td></tr>
              ) : mountains.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Belum ada data gunung.</td></tr>
              ) : (
                mountains.map((mountain) => (
                  <tr key={mountain.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mountain.imageUrl ? (
                        <img 
                          src={mountain.imageUrl} 
                          alt={mountain.name} 
                          className="w-16 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">No Image</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{mountain.name}</div>
                      <div className="text-xs text-gray-500">{mountain.difficulty}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{mountain.location}, {mountain.province}</div>
                      <div className="text-xs text-gray-500">{mountain.elevation} mdpl</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">⏱️ {mountain.estimatedDuration || '-'} | 📏 {mountain.distance || '-'}</div>
                      <div className="text-xs text-blue-600 font-bold mt-1">☁️ Cuaca Saat Ini: {mountain.weather}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${mountain.status === 'Buka' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {mountain.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(mountain)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(mountain.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
                          Hapus
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Data Gunung' : 'Tambah Gunung Baru'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* KOLOM 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Gunung</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Provinsi</label>
                    <input type="text" required placeholder="Contoh: Jawa Tengah" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi Detail</label>
                    <input type="text" required placeholder="Contoh: Dieng" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat Kesulitan</label>
                    <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none">
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* KOLOM 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ketinggian (mdpl)</label>
                    <input type="number" required value={formData.elevation} onChange={e => setFormData({...formData, elevation: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estimasi Durasi</label>
                    <input type="text" required placeholder="Contoh: 5h 30m" value={formData.estimatedDuration} onChange={e => setFormData({...formData, estimatedDuration: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jarak Pendakian</label>
                    <input type="text" required placeholder="Contoh: 6.5 km" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none">
                      <option value="Buka">Buka</option>
                      <option value="Tutup">Tutup</option>
                    </select>
                  </div>
                </div>

                {/* KOLOM 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                    <input type="text" required placeholder="-7.1895" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                    <input type="text" required placeholder="109.9213" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">URL Gambar</label>
                    <input type="url" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4A7C59] outline-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium bg-[#4A7C59] text-white hover:bg-[#3b6347] transition-colors shadow-sm">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Gunung'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}