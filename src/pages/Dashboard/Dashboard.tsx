import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const userStatsData = [
  { name: 'Week 1', users: 4000 },
  { name: 'Week 2', users: 3000 },
  { name: 'Week 3', users: 5000 },
  { name: 'Week 4', users: 2780 },
];

const systemActivityData = [
  { name: 'M', activity: 40 },
  { name: 'T', activity: 60 },
  { name: 'W', activity: 30 },
  { name: 'T', activity: 80 },
  { name: 'F', activity: 50 },
  { name: 'S', activity: 90 },
  { name: 'S', activity: 70 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Platform performance and user activity.</p>
        </div>
        <button className="bg-primary hover:bg-surface-tint text-on-primary px-4 py-2 rounded-lg font-title-lg text-title-lg transition-all shadow-sm hover:translate-y-[-2px] active:translate-y-[0px] flex items-center gap-2">
          <span className="material-symbols-outlined">download</span>
          Export Report
        </button>
      </div>

      {/* Top Section: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">group</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total User</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">12,450</h3>
            <p className="font-body-md text-body-md text-primary flex items-center mt-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              +12% <span className="text-on-surface-variant ml-1">vs last month</span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">landscape</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Gunung</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">142</h3>
            <p className="font-body-md text-body-md text-primary flex items-center mt-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              +3 <span className="text-on-surface-variant ml-1">new this week</span>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">hiking</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Active Expeditions</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">38</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center mt-1 text-sm">
              Currently on trails
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-md soft-lift flex items-center gap-4 border border-outline-variant/30 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-error/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error z-10 shrink-0">
            <span className="material-symbols-outlined filled text-[24px]">warning</span>
          </div>
          <div className="z-10">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Open Reports</p>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">5</h3>
            <p className="font-body-md text-body-md text-error flex items-center mt-1 text-sm">
              Needs attention
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg h-auto lg:h-[400px]">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg soft-lift border border-outline-variant/30 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-lg text-title-lg text-on-surface">User Statistics</h3>
            <select className="bg-surface-container-low border-none rounded-md text-sm font-label-md text-on-surface-variant focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userStatsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfcaba" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#40493d', fontSize: 12}} dy={10} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#bfcaba', strokeWidth: 1, strokeDasharray: '3 3'}}
                />
                <Line type="monotone" dataKey="users" stroke="#0d631b" strokeWidth={3} dot={{r: 4, fill: '#0d631b', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-lg soft-lift border border-outline-variant/30 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-lg text-title-lg text-on-surface">System Activity</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemActivityData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfcaba" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#40493d', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#40493d', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f3f3f3'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                <Bar dataKey="activity" fill="#0d631b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="bg-surface-container-lowest rounded-xl soft-lift border border-outline-variant/30 overflow-hidden">
        <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-on-surface">Recent Activity</h3>
          <a href="#" className="font-label-md text-label-md text-primary hover:underline">View All</a>
        </div>
        <div className="divide-y divide-outline-variant/20">
          <div className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-body-md text-body-md text-on-surface"><strong>Admin Budi</strong> approved new user registration <span className="text-primary font-medium">@joko_hiker</span></p>
                <span className="font-label-md text-[11px] text-on-surface-variant whitespace-nowrap">2 mins ago</span>
              </div>
            </div>
          </div>

          <div className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0 mt-1">
              <span className="material-symbols-outlined text-[20px]">edit_location</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-body-md text-body-md text-on-surface"><strong>Admin Siti</strong> updated trail conditions for <span className="text-tertiary font-medium">Gunung Rinjani</span></p>
                <span className="font-label-md text-[11px] text-on-surface-variant whitespace-nowrap">1 hour ago</span>
              </div>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                Trail Closed - Bad Weather
              </div>
            </div>
          </div>

          <div className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-1">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-body-md text-body-md text-on-surface">System automated verification completed for <strong>12 new guides</strong></p>
                <span className="font-label-md text-[11px] text-on-surface-variant whitespace-nowrap">3 hours ago</span>
              </div>
            </div>
          </div>

          <div className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline shrink-0 mt-1">
              <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-body-md text-body-md text-on-surface">Database backup completed successfully.</p>
                <span className="font-label-md text-[11px] text-on-surface-variant whitespace-nowrap">Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
