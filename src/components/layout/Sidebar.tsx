import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "bg-primary/10 border-l-4 border-primary text-primary-fixed font-bold flex items-center px-4 py-3 rounded-r-lg transition-transform"
      : "text-surface-variant hover:text-on-primary-fixed-variant flex items-center px-4 py-3 hover:bg-surface-variant/10 transition-colors duration-200 rounded-lg active:scale-[0.98]";
  };

  const getIconClass = ({ isActive }: { isActive: boolean }) => {
    return `material-symbols-outlined mr-3 ${isActive ? 'filled' : ''}`;
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-inverse-surface shadow-md flex flex-col py-lg z-50">
      <div className="px-lg mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined filled">landscape</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary-fixed">HikingFit</h2>
            <p className="font-label-md text-label-md text-outline">Admin Console</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-md space-y-2">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass({ isActive })}>dashboard</span>
              <span className="font-title-lg text-title-lg">Dashboard</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/users" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass({ isActive })}>group</span>
              <span className="font-title-lg text-title-lg">Manajemen User</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/mountains" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass({ isActive })}>landscape</span>
              <span className="font-title-lg text-title-lg">Manajemen Gunung</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/trails" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass({ isActive })}>route</span>
              <span className="font-title-lg text-title-lg">Manajemen Jalur</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/reports" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass({ isActive })}>assessment</span>
              <span className="font-title-lg text-title-lg">Laporan Aktivitas</span>
            </>
          )}
        </NavLink>
      </div>
      
      <div className="px-md mt-auto pt-4 border-t border-surface-variant/20">
        <Link to="/login" className="text-surface-variant hover:text-on-primary-fixed-variant flex items-center px-4 py-3 hover:bg-surface-variant/10 transition-colors duration-200 rounded-lg active:scale-[0.98]">
          <span className="material-symbols-outlined mr-3">logout</span>
          <span className="font-title-lg text-title-lg">Logout</span>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
