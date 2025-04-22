import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chat } from '../../types';
import { Edit, Search } from 'lucide-react';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        chatList.push({ id: doc.id, ...doc.data() } as Chat);
      });
      
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return format(date, 'HH:mm', { locale: ptBR });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return format(date, 'EEEE', { locale: ptBR });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    }
  };

  const getChatName = (chat: Chat): string => {
    if (chat.isGroupChat && chat.groupName) {
      return chat.groupName;
    }
    
    // Para chats um-para-um, precisamos buscar o nome do outro participante
    // Esta parte deve ser melhorada com um cache de usuários
    return 'Chat direto';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Mensagens</h2>
        <button 
          onClick={() => navigate('/novo-chat')}
          className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
        >
          <Edit size={20} />
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
            placeholder="Buscar conversas..."
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-gray-500 text-center">Nenhuma conversa encontrada</p>
            <button
              onClick={() => navigate('/novo-chat')}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Iniciar nova conversa
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  to={`/chat/${chat.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center px-4 py-3">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-medium">
                      {getChatName(chat).charAt(0)}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getChatName(chat)}
                        </h3>
                        {chat.updatedAt && (
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(chat.updatedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.text || 'Nenhuma mensagem'}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;