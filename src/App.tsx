import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas de autenticação
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout e componentes principais
import AppLayout from './components/Layout/AppLayout';

// Páginas do app
import ChatList from './pages/chat/ChatList';
import ChatRoom from './pages/chat/ChatRoom';
import NewChat from './pages/chat/NewChat';
import RoomList from './pages/rooms/RoomList';
import ContactList from './pages/contacts/ContactList';

// Componente que verifica autenticação
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/cadastro" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Rotas privadas */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route index element={<ChatList />} />
          <Route path="chat/:chatId" element={<ChatRoom />} />
          <Route path="novo-chat" element={<NewChat />} />
          <Route path="salas" element={<RoomList />} />
          <Route path="contatos" element={<ContactList />} />
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;