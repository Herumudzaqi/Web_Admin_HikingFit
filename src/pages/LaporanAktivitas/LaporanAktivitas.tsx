import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  status: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

const LaporanAktivitas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: ActivityLog[] = [];
      snapshot.forEach(doc => {
        logsData.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });
      setLogs(logsData);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconProps = (action: string) => {
    if (action.includes('Create') || action.includes('Tambah')) return { icon: 'add_circle', color: 'text-primary', bg: 'bg-primary/10' };
    if (action.includes('Update') || action.includes('Edit')) return { icon: 'edit', color: 'text-secondary', bg: 'bg-secondary/10' };
    if (action.includes('Delete') || action.includes('Hapus')) return { icon: 'delete', color: 'text-error', bg: 'bg-error/10' };
    if (action.includes('Login')) return { icon: 'login', color: 'text-primary', bg: 'bg-primary/10' };
    if (action.includes('Logout')) return { icon: 'logout', color: 'text-on-surface-variant', bg: 'bg-surface-variant' };
    return { icon: 'info', color: 'text-tertiary', bg: 'bg-tertiary/10' };
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full gap-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Laporan Aktivitas</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review system logs and user actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md text-on-surface transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30">
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Tanggal</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Admin</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Aktivitas</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Keterangan</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-on-surface-variant font-bold text-[14px]">Belum ada aktivitas.</td>
                 </tr>
              ) : filteredLogs.map((log) => {
                const iconProps = getIconProps(log.action);
                return (
                <tr key={log.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-body-md text-body-md text-on-surface">{formatDate(log.createdAt)}</div>
                    <div className="font-label-md text-[12px] text-on-surface-variant mt-1">{formatTime(log.createdAt)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-title-md text-[14px] font-semibold text-on-surface">{log.userName || '-'}</div>
                    <div className="font-body-md text-[12px] text-on-surface-variant mt-1">{log.userEmail || '-'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${iconProps.bg} ${iconProps.color} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[16px]">{iconProps.icon}</span>
                      </div>
                      <span className="font-title-lg text-[14px] font-semibold text-on-surface">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed max-w-lg">
                      {log.description}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      log.status === 'Success' ? 'bg-primary-container/20 text-primary border-primary/20' : 
                      log.status === 'Failed' ? 'bg-error-container/50 text-error border-error/20' : 
                      'bg-surface-variant text-on-surface-variant border-outline-variant'
                    }`}>
                      {log.status || 'Success'}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanAktivitas;
