import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Message, Chat } from '../../types';
import { ArrowLeft, Send, Paperclip, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Buscar informações do chat
  useEffect(() => {
    if (!chatId) return;
    
    const chatRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setChatInfo({ id: doc.id, ...doc.data() } as Chat);
      } else {
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [chatId, navigate]);

  // Buscar mensagens
  useEffect(() => {
    if (!chatId) return;
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      setMessages(messageList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [chatId]);

  // Rolar para o final quando novas mensagens são carregadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatName = (): string => {
    if (!chatInfo) return '';
    
    if (chatInfo.isGroupChat && chatInfo.groupName) {
      return chatInfo.groupName;
    }
    
    // Para chats um-para-um, precisamos buscar o nome do outro participante
    // Esta parte deve ser melhorada com um cache de usuários
    return 'Chat direto';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !chatId) return;
    
    if ((!newMessage.trim() && !file) || isUploading) return;
    
    try {
      let fileURL = '';
      let fileName = '';
      let fileType = '';
      
      if (file) {
        setIsUploading(true);
        const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
        fileName = file.name;
        fileType = file.type;
      }
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        read: false,
        ...(fileURL && { fileURL, fileName, fileType }),
      };
      
      await addDoc(messagesRef, messageData);
      
      // Atualizar o lastMessage no chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text: newMessage.trim() || (fileName ? `Enviou um arquivo: ${fileName}` : 'Enviou um arquivo'),
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
      
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return format(date, 'HH:mm', { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Carregando conversa...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Cabeçalho do chat */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
        <button 
          onClick={() => navigate('/')}
          className="mr-2 text-gray-500 hover:text-gray-700 md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
          {getChatName().charAt(0)}
        </div>
        
        <div className="ml-3 flex-1">
          <h2 className="text-sm font-medium text-gray-900">{getChatName()}</h2>
          <p className="text-xs text-gray-500">
            {chatInfo?.isGroupChat 
              ? `${chatInfo.participants.length} participantes` 
              : 'Online'}
          </p>
        </div>
        
        <button className="text-gray-500 hover:text-gray-700">
          <MoreVertical size={20} />
        </button>
      </div>
      
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Nenhuma mensagem ainda. Envie a primeira mensagem!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSender = message.senderId === currentUser?.uid;
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isSender 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {message.text && (
                      <p className={`text-sm ${isSender ? 'text-white' : 'text-gray-800'}`}>
                        {message.text}
                      </p>
                    )}
                    
                    {message.fileURL && (
                      <div className="mt-2">
                        {message.fileType?.startsWith('image/') ? (
                          <a href={message.fileURL} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={message.fileURL} 
                              alt="Imagem compartilhada" 
                              className="max-w-full rounded"
                            />
                          </a>
                        ) : (
                          <a 
                            href={message.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center text-sm ${
                              isSender ? 'text-white' : 'text-primary-600'
                            } hover:underline`}
                          >
                            <Paperclip size={16} className="mr-1" />
                            {message.fileName || 'Baixar arquivo'}
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${isSender ? 'text-primary-200' : 'text-gray-500'}`}>
                      {message.createdAt && formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Campo de entrada de mensagem */}
      <div className="p-4 border-t border-gray-200">
        {file && (
          <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
            <span className="text-sm truncate">{file.name}</span>
            <button 
              onClick={() => setFile(null)}
              className="ml-2 text-red-500 text-xs"
            >
              Remover
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center">
          <button
            type="button"
            onClick={handleFileClick}
            className="p-2 text-gray-500 hover:text-primary-500"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ml-2"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() && !file}
            className="ml-2 p-2 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;