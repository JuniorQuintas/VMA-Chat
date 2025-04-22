import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';
import { ChatRoom } from '../../types';

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const room = { id: doc.id, ...doc.data() } as ChatRoom;
        // Mostra apenas salas públicas ou as que o usuário é membro
        if (!room.isPrivate || room.members.includes(currentUser.uid)) {
          roomList.push(room);
        }
      });
      
      setRooms(roomList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Salas de Chat</h2>
        <button 
          onClick={() => navigate('/nova-sala')}
          className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar salas..."
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Carregando salas...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-gray-500 text-center">Nenhuma sala encontrada</p>
            <button
              onClick={() => navigate('/nova-sala')}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Criar nova sala
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => navigate(`/sala/${room.id}`)}
                  className="w-full text-left block hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center px-4 py-3">
                    <div className="h-12 w-12 rounded-full bg-secondary-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                      {room.name.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {room.name}
                        </h3>
                        {room.isPrivate && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            Privada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {room.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {room.members.length} membros
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoomList;