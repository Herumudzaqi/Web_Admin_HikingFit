import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { logActivity } from '../../utils/activityLogger';

// --- IMPORT LEAFLET UNTUK PETA INTERAKTIF ---
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix bug icon bawaan Leaflet di React/Vite
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- INTERFACES ---
interface Segment {
  id: string;
  name: string;
  distance: number | string; 
  estimatedTime: string | number; 
  geoJsonUrl?: string; 
}

interface Trail {
  id: string;
  mountainId: string;
  name: string;
  difficulty: string; 
  description: string;
  requirements: string; 
  prohibitions: string; 
  sourceUrl: string; 
  imageUrl?: string; 
  latitude?: number | string; 
  longitude?: number | string; 
  segments: Segment[]; 
}

interface Mountain {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface WeatherHistory {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  wind_speed_10m_max: number[];
}

// --- KOMPONEN PETA CERDAS PENGGANTI IFRAME ---
const TrailMap = ({ trail, lat, lon }: { trail: Trail, lat: number, lon: number }) => {
  const [geoJsons, setGeoJsons] = useState<any[]>([]);

  useEffect(() => {
    // Mengekstrak dan mendownload semua file GeoJSON dari setiap segmen
    const fetchGeoJsons = async () => {
      const fetchedData: any[] = [];
      if (trail.segments && trail.segments.length > 0) {
        for (const seg of trail.segments) {
          if (seg.geoJsonUrl) {
            try {
              const res = await fetch(seg.geoJsonUrl);
              const data = await res.json();
              fetchedData.push(data);
            } catch (e) {
              console.error(`Gagal meload GeoJSON untuk segmen ${seg.name}`, e);
            }
          }
        }
      }
      setGeoJsons(fetchedData);
    };
    
    fetchGeoJsons();
  }, [trail]);

  return (
    <MapContainer 
      center={[lat, lon]} 
      zoom={13} 
      style={{ height: '100%', width: '100%', zIndex: 0 }} 
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      <Marker position={[lat, lon]}>
        <Popup className="font-bold">Basecamp {trail.name}</Popup>
      </Marker>
      
      {/* Menggambar semua lintasan merah dari file GeoJSON yang berhasil di-load */}
      {geoJsons.map((geo, idx) => (
        <GeoJSON 
          key={idx}
          data={geo} 
          style={{ color: '#ef4444', weight: 4, opacity: 0.8 }} 
        />
      ))}
    </MapContainer>
  );
};

// --- KOMPONEN UTAMA ---
const ManajemenJalur: React.FC = () => {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [formData, setFormData] = useState<Omit<Trail, 'id'>>({
    mountainId: '', name: '', difficulty: 'Light', description: '', requirements: '', prohibitions: '', sourceUrl: 'https://muncak.id', imageUrl: '', latitude: '', longitude: '', segments: []
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherHistory | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // --- 1. FETCH DATA DARI BACKEND NODE.JS ---
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const resMount = await fetch(`${apiUrl}/mountains`);
      const dataMount = await resMount.json();
      if (dataMount.success) setMountains(dataMount.data);

      const resTrail = await fetch(`${apiUrl}/trails`);
      const dataTrail = await resTrail.json();
      if (dataTrail.success) setTrails(dataTrail.data);

    } catch (error) {
      console.error(error);
      toast.error("Gagal menarik data dari server backend.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIKA FORM ---
  const handleOpenForm = (trail?: Trail) => {
    if (trail) {
      setEditingTrail(trail);
      setFormData({ 
        ...trail,
        description: trail.description || '',
        requirements: trail.requirements || '',
        prohibitions: trail.prohibitions || '',
        sourceUrl: trail.sourceUrl || 'https://muncak.id',
        imageUrl: trail.imageUrl || '',
        latitude: trail.latitude || '',
        longitude: trail.longitude || '',
        difficulty: trail.difficulty || 'Light'
      });
    } else {
      setEditingTrail(null);
      setFormData({ mountainId: '', name: '', difficulty: 'Light', description: '', requirements: '', prohibitions: '', sourceUrl: 'https://muncak.id', imageUrl: '', latitude: '', longitude: '', segments: [] });
    }
    setIsFormOpen(true);
  };

  const addSegment = () => {
    const newSegment: Segment = { id: Date.now().toString(), name: `Segmentasi ${formData.segments.length + 1}`, distance: 0, estimatedTime: '' };
    setFormData({ ...formData, segments: [...formData.segments, newSegment] });
  };

  const updateSegment = (id: string, field: keyof Segment, value: any) => {
    const updated = formData.segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg);
    setFormData({ ...formData, segments: updated });
  };

  const removeSegment = (id: string) => {
    setFormData({ ...formData, segments: formData.segments.filter(seg => seg.id !== id) });
  };

  // --- 2. SIMPAN DATA KE BACKEND NODE.JS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.segments.length === 0) return toast.error("Minimal harus ada 1 Segmen!");
    
    try {
      const payloadToSave = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : '',
        longitude: formData.longitude ? Number(formData.longitude) : ''
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      const url = editingTrail ? `${apiUrl}/trails/${editingTrail.id}` : `${apiUrl}/trails`;
      const method = editingTrail ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSave)
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(editingTrail ? "Jalur berhasil diperbarui!" : "Jalur baru berhasil ditambahkan!");
        
        if (editingTrail) {
          await logActivity("Update Jalur", `Mengubah jalur ${payloadToSave.name}`);
        } else {
          const mnt = mountains.find((m: Mountain) => m.id === payloadToSave.mountainId);
          await logActivity("Create Jalur", `Menambahkan jalur ${payloadToSave.name} pada gunung ${mnt ? mnt.name : payloadToSave.mountainId}`);
        }
        
        fetchData(); 
        setIsFormOpen(false);
      } else {
        toast.error(resData.message || "Gagal menyimpan data.");
      }
    } catch (e) {
      toast.error("Gagal terhubung ke server.");
    }
  };

  // --- 3. HAPUS DATA ---
  const handleDelete = async (trail: Trail) => {
    if(!window.confirm("Apakah Anda yakin ingin menghapus jalur ini?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/trails/${trail.id}`, {
        method: 'DELETE',
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success("Jalur berhasil dihapus!");
        await logActivity("Delete Jalur", `Menghapus jalur ${trail.name}`);
        fetchData();
      }
    } catch (e) {
      toast.error("Gagal terhubung ke server.");
    }
  };

  // --- LOGIKA DETAIL (PETA & CUACA PRIORITAS BASECAMP) ---
  const handleOpenDetail = async (trail: Trail) => {
    setSelectedTrail(trail);
    const mountain = mountains.find(m => m.id === trail.mountainId);
    setSelectedMountain(mountain || null);
    setIsDetailOpen(true);
    setWeatherData(null);

    const targetLat = trail.latitude || mountain?.latitude;
    const targetLon = trail.longitude || mountain?.longitude;

    if (targetLat && targetLon) {
      setIsLoadingWeather(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max&past_days=7&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.daily) setWeatherData(data.daily);
      } catch (err) {
        console.error("Gagal load cuaca", err);
      } finally {
        setIsLoadingWeather(false);
      }
    }
  };

  const getTotalDistance = (segments: Segment[]) => segments.reduce((acc, curr) => acc + Number(curr.distance || 0), 0);

  return (
    <div className="flex flex-col h-full gap-lg p-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold">Manajemen Jalur & Segmen</h2>
          <p className="text-on-surface-variant">Kelola rute spesifik, koordinat basecamp, dan cuaca Open-Meteo.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="bg-surface border border-outline-variant text-on-surface px-4 py-2.5 rounded-lg hover:bg-surface-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">refresh</span> Refresh
          </button>
          <button onClick={() => handleOpenForm()} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-title-lg shadow-sm hover:bg-surface-tint">
            Tambah Jalur
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container/30 border-b border-outline-variant">
            <tr>
              <th className="py-4 px-6">Nama Jalur (Basecamp)</th>
              <th className="py-4 px-6">Gunung</th>
              <th className="py-4 px-6">Level</th>
              <th className="py-4 px-6">Total Jarak</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {trails.map(trail => (
              <tr key={trail.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                <td className="py-4 px-6 font-bold text-primary flex items-center gap-3">
                  {trail.imageUrl ? (
                     <img src={trail.imageUrl} alt={trail.name} className="w-10 h-10 rounded-lg object-cover border border-outline-variant" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Img')} />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">landscape</span>
                    </div>
                  )}
                  {trail.name}
                </td>
                <td className="py-4 px-6">{mountains.find(m => m.id === trail.mountainId)?.name || 'Unknown'}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${trail.difficulty === 'Light' ? 'bg-primary/20 text-primary' : trail.difficulty === 'Medium' ? 'bg-tertiary/20 text-tertiary' : 'bg-error/20 text-error'}`}>
                    {trail.difficulty}
                  </span>
                </td>
                <td className="py-4 px-6">{getTotalDistance(trail.segments || [])} m</td>
                <td className="py-4 px-6 text-right">
                   <button onClick={() => handleOpenDetail(trail)} className="text-secondary mr-4 hover:underline font-medium">Detail & Cuaca</button>
                   <button onClick={() => handleOpenForm(trail)} className="text-primary mr-4 hover:underline">Edit</button>
                   <button onClick={() => handleDelete(trail)} className="text-error hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {trails.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Belum ada jalur. Klik Tambah Jalur.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleSave} className="bg-surface p-6 rounded-xl w-full max-w-5xl space-y-4 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3 sticky top-0 bg-surface z-10">
              <h3 className="font-headline-md font-bold">{editingTrail ? 'Edit Jalur' : 'Tambah Jalur Baru'}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-on-surface-variant hover:bg-surface-container rounded-full p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Link/URL Gambar Jalur</label>
                    <div className="flex gap-2">
                      <input type="url" placeholder="Paste URL gambar..." className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary text-sm" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="preview" className="w-10 h-10 rounded border object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=Err')} />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Gunung Terkait</label>
                    <select required className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary" value={formData.mountainId} onChange={e => setFormData({...formData, mountainId: e.target.value})}>
                      <option value="">-- Pilih Gunung --</option>
                      {mountains.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tingkat Kesulitan</label>
                    <select className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                      <option value="Light">Light (Mudah)</option>
                      <option value="Medium">Medium (Sedang)</option>
                      <option value="Hard">Hard (Sulit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nama Jalur (Basecamp)</label>
                  <input required placeholder="Cth: Jalur Patak Banteng" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="bg-secondary/5 p-3 rounded-lg border border-secondary/20 grid grid-cols-2 gap-4">
                  <div className="col-span-2 mb-[-10px]">
                    <p className="text-xs text-secondary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">pin_drop</span> Titik Koordinat Basecamp
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Latitude</label>
                    <input type="number" step="any" className="w-full px-3 py-1.5 border rounded-md bg-white text-sm" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="-7.1234" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Longitude</label>
                    <input type="number" step="any" className="w-full px-3 py-1.5 border rounded-md bg-white text-sm" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="109.1234" />
                  </div>
                  <div className="col-span-2">
                     <p className="text-[10px] text-on-surface-variant italic">*Kosongkan jika ingin menggunakan koordinat puncak gunung induk.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tentang Jalur (Deskripsi)</label>
                  <textarea rows={3} placeholder="Jalur ini merupakan rute favorit karena..." className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant space-y-3">
                  <h5 className="text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">gavel</span> Regulasi</h5>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1 text-on-surface-variant">Syarat Pendakian Resmi</label>
                    <textarea rows={2} placeholder="- Wajib membawa KTP Asli" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary text-xs" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1 text-on-surface-variant">Aturan & Larangan Utama</label>
                    <textarea rows={2} placeholder="- Dilarang membawa tisu basah" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary text-xs" value={formData.prohibitions} onChange={e => setFormData({...formData, prohibitions: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-on-surface-variant">Sumber Referensi / Scrape URL</label>
                    <input type="url" placeholder="https://muncak.id/..." className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary text-xs" value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Kanan: Segmentasi */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="font-title-md font-bold text-tertiary">Daftar Segmentasi</h4>
                  <button type="button" onClick={addSegment} className="bg-tertiary text-on-tertiary px-2 py-1 rounded text-xs flex items-center gap-1 hover:opacity-90">
                    <span className="material-symbols-outlined text-[14px]">add</span> Tambah
                  </button>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                  {formData.segments.length === 0 ? (
                    <p className="text-sm text-center text-on-surface-variant py-4 bg-surface border border-dashed border-outline-variant rounded-lg">Belum ada segmen. Klik tambah.</p>
                  ) : (
                    formData.segments.map((seg, idx) => (
                      <div key={seg.id} className="p-3 border border-outline-variant rounded-lg bg-surface relative group shadow-sm">
                        <div className="absolute top-2 left-2 w-5 h-5 bg-tertiary/20 text-tertiary rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                        <button type="button" onClick={() => removeSegment(seg.id)} className="absolute top-2 right-2 text-error opacity-50 hover:opacity-100" title="Hapus">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="text-[10px] text-on-surface-variant">Nama Segmen</label>
                            <input required className="w-full p-1.5 text-xs border rounded" value={seg.name} onChange={e => updateSegment(seg.id, 'name', e.target.value)} placeholder="Basecamp - Pos 1" />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant">Jarak (Meter)</label>
                            <input type="number" required className="w-full p-1.5 text-xs border rounded" value={seg.distance} onChange={e => updateSegment(seg.id, 'distance', e.target.value)} placeholder="448" />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant">Estimasi Waktu (Menit)</label>
                            <input type="number" required className="w-full p-1.5 text-xs border rounded" value={seg.estimatedTime} onChange={e => updateSegment(seg.id, 'estimatedTime', e.target.value)} placeholder="120" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-on-surface-variant">GeoJSON URL (Opsional)</label>
                            <input className="w-full p-1.5 text-xs border rounded bg-surface-container-low" value={seg.geoJsonUrl || ''} onChange={e => updateSegment(seg.id, 'geoJsonUrl', e.target.value)} placeholder="https://..." />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4 sticky bottom-0 bg-surface">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md hover:bg-surface-container">Batal</button>
              <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-md hover:bg-surface-tint font-bold">Simpan ke Backend</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DETAIL JALUR */}
      {isDetailOpen && selectedTrail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-surface rounded-xl w-full max-w-5xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-primary text-on-primary flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-headline-md font-bold">Detail & Analisis Rute: {selectedTrail.name}</h3>
                <p className="text-sm opacity-90 flex items-center gap-3 mt-1">
                  <span><span className="material-symbols-outlined text-[14px] align-middle">landscape</span> Gunung {selectedMountain?.name}</span>
                  <span><span className="material-symbols-outlined text-[14px] align-middle">route</span> {getTotalDistance(selectedTrail.segments)} meter</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{selectedTrail.difficulty}</span>
                </p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-on-primary hover:bg-primary-container p-1 rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-surface-container-lowest">
              
              <div className="space-y-6">
                {selectedTrail.imageUrl && (
                  <div className="w-full rounded-xl overflow-hidden shadow-sm border border-outline-variant relative">
                    <img src={selectedTrail.imageUrl} alt={selectedTrail.name} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">{selectedTrail.name}</h3>
                  </div>
                )}
                
                <div>
                  <h4 className="font-title-lg font-bold text-on-surface mb-2">Tentang {selectedTrail.name}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {selectedTrail.description || 'Belum ada deskripsi untuk jalur ini.'}
                  </p>
                </div>

                <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-4 border-b pb-2">
                    <h4 className="font-title-md font-bold text-on-surface">Informasi & Regulasi</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-bold flex items-center gap-2 text-secondary mb-1">
                        <span className="material-symbols-outlined text-[18px]">info</span> Syarat Pendakian Resmi
                      </h5>
                      <div className="text-xs text-on-surface-variant whitespace-pre-line pl-6">
                        {selectedTrail.requirements || '- Tidak ada data'}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-bold flex items-center gap-2 text-error mb-1">
                        <span className="material-symbols-outlined text-[18px]">warning</span> Aturan & Larangan Utama
                      </h5>
                      <div className="text-xs text-on-surface-variant whitespace-pre-line pl-6">
                        {selectedTrail.prohibitions || '- Tidak ada data'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- PETA LEAFLET DITAMPILKAN DI SINI --- */}
                <div>
                  <h4 className="font-title-md font-bold text-on-surface mb-2">Peta Lokasi Basecamp & Rute</h4>
                  <div className="w-full h-48 bg-surface-container rounded-xl border border-outline-variant overflow-hidden relative shadow-sm">
                    {(() => {
                      const lat = selectedTrail.latitude || selectedMountain?.latitude;
                      const lon = selectedTrail.longitude || selectedMountain?.longitude;
                      return lat && lon ? (
                         <TrailMap trail={selectedTrail} lat={Number(lat)} lon={Number(lon)} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">map</span>
                          <p className="text-xs">Koordinat basecamp/gunung belum disetting.</p>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-title-md font-bold text-on-surface mb-2 flex items-center justify-between">
                    <span>Kondisi Cuaca (Koordinat Basecamp)</span>
                  </h4>
                  
                  {isLoadingWeather ? (
                    <div className="py-6 text-center text-on-surface-variant animate-pulse border rounded-xl">Memuat data satelit Open-Meteo...</div>
                  ) : weatherData ? (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/30 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Prakiraan Hari Ini</p>
                          <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-secondary">{weatherData.temperature_2m_max[6]}°C</span>
                            <span className="text-sm text-on-surface-variant mb-1">/ {weatherData.temperature_2m_min[6]}°C</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="material-symbols-outlined text-[32px] text-secondary mb-1">air</span>
                          <p className="text-sm font-bold text-on-surface">{weatherData.wind_speed_10m_max[6]} km/h</p>
                          <p className="text-[10px] text-on-surface-variant">Max Wind Speed</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto bg-surface border border-outline-variant rounded-xl shadow-sm">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-container-low text-on-surface font-bold">
                            <tr>
                              <th className="py-2 px-3 border-b">Tanggal (7 Hari)</th>
                              <th className="py-2 px-3 border-b">Suhu (Min/Max)</th>
                              <th className="py-2 px-3 border-b">Angin Max</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/30">
                            {weatherData.time.slice(0, 6).map((t, idx) => (
                              <tr key={t} className="hover:bg-surface-container-lowest">
                                <td className="py-2 px-3">{new Date(t).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                <td className="py-2 px-3">{weatherData.temperature_2m_min[idx]}°C - {weatherData.temperature_2m_max[idx]}°C</td>
                                <td className="py-2 px-3 text-on-surface-variant">{weatherData.wind_speed_10m_max[idx]} km/h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-error-container/50 text-on-error-container p-4 rounded-xl border border-error/20 text-xs">
                      Data cuaca Open-Meteo tidak tersedia.
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-title-md font-bold text-on-surface mb-3">Trail Route (Segmentasi)</h4>
                  <div className="bg-surface border border-outline-variant rounded-xl p-4">
                    {selectedTrail.segments.length === 0 && <p className="text-xs italic text-on-surface-variant">Tidak ada data segmen.</p>}
                    
                    <div className="relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-outline-variant"></div>
                      
                      <div className="space-y-4 relative z-10">
                        {selectedTrail.segments.map((seg, i) => (
                          <div key={seg.id} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-md">
                              {i+1}
                            </div>
                            <div className="flex-1 bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-sm text-on-surface">{seg.name}</h5>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">{seg.estimatedTime} Menit</span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-1">Jarak tempuh: {seg.distance} meter</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenJalur;