import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMountains, setTotalMountains] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // 1. Total User & User Stats
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setTotalUsers(snapshot.size);
      
      const statsMap: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        let date = new Date(); // fallback to current date if no valid createdAt
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            date = data.createdAt.toDate();
          } else {
            date = new Date(data.createdAt);
          }
        }
        
        if (isNaN(date.getTime())) {
          date = new Date(); // fallback if still invalid
        }

        const monthName = months[date.getMonth()];
        statsMap[monthName] = (statsMap[monthName] || 0) + 1;
      });
      
      // Generate ordered stats for current year
      const orderedStats = months.map(m => ({ name: m, users: statsMap[m] || 0 })).filter(s => s.users > 0 || s.name === months[new Date().getMonth()]);
      if (orderedStats.length === 0) {
          orderedStats.push({ name: months[new Date().getMonth()], users: 0 });
      }
      setUserStats(orderedStats);
    });

    // 2. Total Gunung
    const fetchMountains = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/mountains`);
        const json = await res.json();
        if (json.success) {
          setTotalMountains(json.data.length);
        }
      } catch (error) {
        console.error("Gagal menarik data gunung:", error);
      }
    };
    fetchMountains();

    // 3. Recent Activity Logs
    const qLogs = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const logsData: any[] = [];
      snapshot.forEach(doc => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setRecentLogs(logsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const q = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      
      const docPdf = new jsPDF();
      docPdf.text('Laporan Aktivitas HikingFit', 14, 15);
      
      const tableColumn = ["Tanggal", "Admin", "Aktivitas", "Keterangan", "Status"];
      const tableRows: any[] = [];

      data.forEach(log => {
        const date = new Date(log.createdAt).toLocaleString('id-ID');
        const admin = log.userName || '-';
        const activity = log.action;
        const desc = log.description;
        const status = log.status || 'Success';
        tableRows.push([date, admin, activity, desc, status]);
      });

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      
      docPdf.save(`Laporan_Aktivitas_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const q = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          'Tanggal': new Date(d.createdAt).toLocaleString('id-ID'),
          'Admin': d.userName || '-',
          'Aktivitas': d.action,
          'Keterangan': d.description,
          'Status': d.status || 'Success'
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Aktivitas");
      XLSX.writeFile(workbook, `Laporan_Aktivitas_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getLogIcon = (action: string) => {
    if (action.includes('Create') || action.includes('Tambah')) return { icon: 'add_circle', color: 'text-primary', bg: 'bg-primary/10' };
    if (action.includes('Update') || action.includes('Edit')) return { icon: 'edit', color: 'text-secondary', bg: 'bg-secondary/10' };
    if (action.includes('Delete') || action.includes('Hapus')) return { icon: 'delete', color: 'text-error', bg: 'bg-error/10' };
    if (action.includes('Login')) return { icon: 'login', color: 'text-primary', bg: 'bg-primary/10' };
    if (action.includes('Logout')) return { icon: 'logout', color: 'text-on-surface-variant', bg: 'bg-surface-variant' };
    return { icon: 'info', color: 'text-tertiary', bg: 'bg-tertiary/10' };
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Platform performance and user activity.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExportPDF} disabled={isExporting} className="bg-error/10 hover:bg-error/20 text-error px-4 py-2 rounded-lg font-title-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              PDF
            </button>
            <button onClick={handleExportExcel} disabled={isExporting} className="bg-primary hover:bg-surface-tint text-on-primary px-4 py-2 rounded-lg font-title-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">table_chart</span>
              Excel
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">group</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total User</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">landscape</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Gunung</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{totalMountains}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg h-auto lg:h-[400px]">
        <div className="bg-surface-container-lowest rounded-xl p-lg soft-lift border border-outline-variant/30 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-lg text-title-lg text-on-surface">User Registration Statistics</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfcaba" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#40493d', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#40493d', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#bfcaba', strokeWidth: 1, strokeDasharray: '3 3'}}
                />
                <Line type="monotone" dataKey="users" stroke="#0d631b" strokeWidth={3} dot={{r: 4, fill: '#0d631b', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl soft-lift border border-outline-variant/30 overflow-hidden">
        <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-on-surface">Recent Activity</h3>
          <Link to="/dashboard/laporan" className="font-label-md text-label-md text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {recentLogs.length === 0 ? (
            <div className="p-md text-center text-on-surface-variant text-sm">Belum ada aktivitas.</div>
          ) : recentLogs.map((log) => {
            const iconProps = getLogIcon(log.action);
            return (
            <div key={log.id} className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full ${iconProps.bg} flex items-center justify-center ${iconProps.color} shrink-0 mt-1`}>
                <span className="material-symbols-outlined text-[20px]">{iconProps.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-body-md text-body-md text-on-surface">
                    <strong>{log.userName || 'System'}</strong> {log.description}
                  </p>
                  <span className="font-label-md text-[11px] text-on-surface-variant whitespace-nowrap">{getTimeAgo(log.createdAt)}</span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
