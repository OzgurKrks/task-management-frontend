import { io, Socket } from 'socket.io-client';
import { Task } from '@/types/task';
import { getAuthToken } from '@/utils/authCookies';

// Socket events
export enum SOCKET_EVENTS {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  PROJECT_UPDATED = 'project:updated',
}

class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.isletmempro.com/api';
  }

  // Connect to socket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          return reject(new Error('No auth token available'));
        }

        this.socket = io(this.url, {
          auth: {
            token
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          resolve();
        });

        this.socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Debug socket connection
  debug(): void {
    console.log('Socket debug info:');
    console.log('- Socket instance exists:', !!this.socket);
    console.log('- Connected:', this.socket?.connected || false);
    console.log('- Socket ID:', this.socket?.id || 'none');
    console.log('- URL:', this.url);
    console.log('- Transport:', this.socket?.io?.engine?.transport?.name || 'none');
    console.log('- Auth token exists:', !!getAuthToken());
  }

  // Join a project room
  joinProject(projectId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:project', { projectId });
      console.log(`Joined project room: ${projectId}`);
    }
  }

  // Leave a project room
  leaveProject(projectId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:project', { projectId });
      console.log(`Left project room: ${projectId}`);
    }
  }

  // Handle connect event
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Task event handlers
  onTaskCreated(callback: (task: Task) => void): void {
    this.on(SOCKET_EVENTS.TASK_CREATED, callback);
  }

  offTaskCreated(callback?: (task: Task) => void): void {
    this.off(SOCKET_EVENTS.TASK_CREATED, callback);
  }

  onTaskUpdated(callback: (task: Task) => void): void {
    this.on(SOCKET_EVENTS.TASK_UPDATED, callback);
  }

  offTaskUpdated(callback?: (task: Task) => void): void {
    this.off(SOCKET_EVENTS.TASK_UPDATED, callback);
  }

  onTaskDeleted(callback: (data: { taskId: string; projectId: string }) => void): void {
    this.on(SOCKET_EVENTS.TASK_DELETED, callback);
  }

  offTaskDeleted(callback?: (data: { taskId: string; projectId: string }) => void): void {
    this.off(SOCKET_EVENTS.TASK_DELETED, callback);
  }

 

  // Connection events
  onConnect(callback: () => void): void {
    this.on('connect', callback);
  }

  offConnect(callback?: () => void): void {
    this.off('connect', callback);
  }

  onDisconnect(callback: () => void): void {
    this.on('disconnect', callback);
  }

  offDisconnect(callback?: () => void): void {
    this.off('disconnect', callback);
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 