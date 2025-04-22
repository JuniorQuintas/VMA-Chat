import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { User } from '../../types';

const NewChat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '!=', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data() as User);
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  const handleUserSelect = (user: User) => {
    if (selectedUsers.some(u => u.uid === user.uid)) {
      setSelectedUsers(selectedUsers.filter(u => u.uid !== user.uid));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      
      // Se é apenas um usuário e não é um grupo, podemos criar o chat diretamente
      if (!isGroupChat && selectedUsers.length === 0) {
        createChat([user]);
      }
    }
  };

  const handleToggleGroupChat = () => {
    setIsGroupChat(!isGroupChat);
    if (!isGroupChat) {
      // Alterar para chat em grupo
      setSelectedUsers([]);
    }
  };

  const createChat = async (chatUsers: User[] = selectedUsers) => {
    if (!currentUser) return;
    
    try {
      if (isGroupChat && (!groupName || chatUsers.length === 0)) {
        return;
      }
      
      // Para chats normais, precisamos verificar se já existe um chat entre esses usuários
      if (!isGroupChat && chatUsers.length === 1) {
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', currentUser.uid),
          where('isGroupChat', '==', false)
        );
        
        const querySnapshot = await getDocs(q);
        
        let existingChatId = null;
        querySnapshot.forEach((doc) => {
          const chat = doc.data();
          if (chat.participants.includes(chatUsers[0].uid)) {
            existingChatId = doc.id;
          }
        });
        
        if (existingChatId) {
          navigate(`/chat/${existingChatId}`);
          return;
        }
      }
      
      // Criar novo chat
      const chatData = {
        participants: [currentUser.uid, ...chatUsers.map(u => u.uid)],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isGroupChat,
        ...(isGroupChat && { groupName }),
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      navigate(`/chat/${chatRef.id}`);
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
        <button 
          onClick={() => navigate('/')}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h2 className="text-lg font-medium text-gray-900">Nova conversa</h2>
        
        <button 
          onClick={handleToggleGroupChat}
          className={`ml-auto p-2 rounded-full ${
            isGroupChat ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <Users size={20} />
        </button>
      </div>
      
      {isGroupChat && (
        <div className="px-4 py-3 border-b border-gray-200">
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do grupo
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Digite o nome do grupo"
          />
        </div>
      )}
      
      {selectedUsers.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selecionados ({selectedUsers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <div
                key={user.uid}
                className="bg-primary-100 text-primary-700 text-sm rounded-full px-3 py-1 flex items-center"
              >
                {user.displayName}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 text-primary-500 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar usuários..."
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-gray-500 text-center">
              Nenhum usuário encontrado com "{searchTerm}"
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.uid}>
                <button
                  onClick={() => handleUserSelect(user)}
                  className="w-full text-left block hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center px-4 py-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-medium">
                      {user.displayName.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    {selectedUsers.some(u => u.uid === user.uid) && (
                      <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {(isGroupChat || selectedUsers.length > 1) && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => createChat()}
            disabled={isGroupChat && (!groupName.trim() || selectedUsers.length === 0)}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGroupChat ? 'Criar grupo' : 'Iniciar conversa'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewChat;