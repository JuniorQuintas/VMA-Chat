import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, User, Settings } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center py-3 flex-1 ${
              item.active ? 'text-primary-500' : 'text-gray-600'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;