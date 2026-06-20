import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout: React.FC = () => {
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md flex antialiased">
      <Sidebar />
      
      <main className="ml-[280px] flex-1 flex flex-col min-h-screen">
        <Topbar />

        <div className="pt-24 px-container-margin pb-xl flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
