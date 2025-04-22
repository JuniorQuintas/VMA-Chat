import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  status: 'online' | 'offline' | 'away';
  lastActive: Timestamp;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  read: boolean;
  fileURL?: string;
  fileName?: string;
  fileType?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isGroupChat: boolean;
  groupName?: string;
  groupPhoto?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  photoURL?: string;
  members: string[];
  isPrivate: boolean;
}