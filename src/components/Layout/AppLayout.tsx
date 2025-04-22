import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '../../context/AuthContext';

const AppLayout: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden md:block w-64 h-full border-r border-gray-200">
        <Sidebar />
      </div>
      
      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
      
      {/* Navegação mobile */}
      <div className="block md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default AppLayout;