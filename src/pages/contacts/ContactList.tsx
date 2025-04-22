import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { User } from '../../types';

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '!=', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data() as User);
        });
        
        setContacts(usersList);
      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [currentUser]);

  const startChat = async (user: User) => {
    if (!currentUser) return;

    navigate('/novo-chat');
  };

  const filteredContacts = contacts.filter(contact => 
    contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Contatos</h2>
      </div>
      
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
            placeholder="Buscar contatos..."
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Carregando contatos...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-gray-500 text-center">
              {searchTerm 
                ? `Nenhum contato encontrado com "${searchTerm}"`
                : 'Nenhum contato disponível'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <li key={contact.uid}>
                <div className="flex items-center p-4 hover:bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-medium">
                    {contact.photoURL ? (
                      <img 
                        src={contact.photoURL} 
                        alt={contact.displayName} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      contact.displayName.charAt(0)
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contact.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => startChat(contact)}
                    className="ml-2 p-2 text-gray-500 hover:text-primary-500 transition-colors"
                    aria-label="Iniciar conversa"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContactList;