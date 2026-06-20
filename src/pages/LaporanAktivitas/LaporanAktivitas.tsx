import React, { useState } from 'react';

// Mock Data
const MOCK_LOGS = [
  { id: 1, date: '24 Oct 2023', time: '14:32:01', activity: 'Tambah User', desc: 'Admin system.admin@hikingfit.com added new guide profile "Budi Santoso" to region Mount Rinjani.', status: 'Success', icon: 'person_add', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
  { id: 2, date: '24 Oct 2023', time: '11:15:44', activity: 'Update Rute Gunung', desc: 'Modified GPS coordinates for Pos 3 trail on Mount Semeru due to recent landslide alerts.', status: 'Success', icon: 'location_on', iconColor: 'text-secondary', iconBg: 'bg-secondary/10' },
  { id: 3, date: '23 Oct 2023', time: '09:05:12', activity: 'Suspend User', desc: 'Suspended account ID #88421 for violating community guidelines during booking process.', status: 'Reviewed', icon: 'block', iconColor: 'text-error', iconBg: 'bg-error/10' },
  { id: 4, date: '23 Oct 2023', time: '08:30:00', activity: 'Export Laporan', desc: 'System generated weekly activity digest. Downloaded by admin.super@hikingfit.com.', status: 'Success', icon: 'download', iconColor: 'text-tertiary', iconBg: 'bg-tertiary/10' },
  { id: 5, date: '22 Oct 2023', time: '16:45:22', activity: 'Sync Database', desc: 'Automated sync with regional meteorology API for weather updates on all active trails.', status: 'Failed', icon: 'sync_problem', iconColor: 'text-error', iconBg: 'bg-error/10' },
];

const LaporanAktivitas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col h-full gap-lg">
      {/* Page Header */}
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
          <button className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container font-body-md text-body-md flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Oct 1 - Oct 31, 2023
          </button>
          <button className="w-10 h-10 bg-surface border border-outline-variant rounded-lg text-on-surface flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30">
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Tanggal</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Aktivitas</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Keterangan</th>
                <th className="py-4 px-6 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-body-md text-body-md text-on-surface">{log.date}</div>
                    <div className="font-label-md text-[12px] text-on-surface-variant mt-1">{log.time}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${log.iconBg} ${log.iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[16px]">{log.icon}</span>
                      </div>
                      <span className="font-title-lg text-[14px] font-semibold text-on-surface">{log.activity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed max-w-lg">
                      {log.desc}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      log.status === 'Success' ? 'bg-primary-container/20 text-primary border-primary/20' : 
                      log.status === 'Failed' ? 'bg-error-container/50 text-error border-error/20' : 
                      'bg-surface-variant text-on-surface-variant border-outline-variant'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant bg-surface-container/30 flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing 1 to 5 of 124 entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container bg-surface disabled:opacity-50">
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container bg-surface">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container bg-surface">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1.5 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container bg-surface">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanAktivitas;
