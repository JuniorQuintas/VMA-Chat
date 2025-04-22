import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Search 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const navItems = [
    { 
      to: '/', 
      icon: <MessageSquare size={20} />, 
      label: 'Mensagens',
      active: location.pathname === '/' 
    },
    { 
      to: '/salas', 
      icon: <Users size={20} />, 
      label: 'Salas',
      active: location.pathname === '/salas' 
    },
    { 
      to: '/contatos', 
      icon: <User size={20} />, 
      label: 'Contatos',
      active: location.pathname === '/contatos' 
    },
    { 
      to: '/configuracoes', 
      icon: <Settings size={20} />, 
      label: 'Configurações',
      active: location.pathname === '/configuracoes' 
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo e título */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <img src="/src/img/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Chat Interno</p>
      </div>

      {/* Busca */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#cc1b00]"
            placeholder="Buscar..."
          />
        </div>
      </div>

      {/* Perfil do usuário */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
          {currentUser?.displayName?.charAt(0) || 'U'}
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium truncate">{currentUser?.displayName}</p>
          <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  item.active
                    ? 'bg-red-50 text-[#cc1b00]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botão de logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;