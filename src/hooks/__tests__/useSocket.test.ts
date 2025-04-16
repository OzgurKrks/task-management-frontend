import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../useSocket';
import socketService, { SOCKET_EVENTS } from '../../utils/socket';

// Mock the socket service
jest.mock('../../utils/socket', () => {
  const originalModule = jest.requireActual('../../utils/socket');
  return {
    __esModule: true,
    ...originalModule,
    default: {
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(false),
      joinProject: jest.fn(),
      leaveProject: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    },
    SOCKET_EVENTS: {
      TASK_CREATED: 'task:created',
      TASK_UPDATED: 'task:updated',
      TASK_DELETED: 'task:deleted',
      PROJECT_UPDATED: 'project:updated',
      PROJECT_DELETED: 'project:deleted',
      COMMENT_ADDED: 'comment:added'
    }
  };
});

describe('useSocket hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with isConnected from socketService', () => {
    (socketService.isConnected as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => useSocket({}));
    
    expect(result.current.isConnected).toBe(false);
  });

  it('should call connect method with token', () => {
    const { result } = renderHook(() => useSocket({}));
    
    act(() => {
      result.current.connect('test-token');
    });
    
    expect(socketService.connect).toHaveBeenCalledWith('test-token');
  });

  it('should call disconnect method', () => {
    const { result } = renderHook(() => useSocket({}));
    
    act(() => {
      result.current.disconnect();
    });
    
    expect(socketService.disconnect).toHaveBeenCalled();
  });

  it('should call joinProject when projectId is provided', () => {
    // Mock isConnected to return true to trigger the useEffect
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    renderHook(() => useSocket({ projectId: 'test-project-id' }));
    
    expect(socketService.joinProject).toHaveBeenCalledWith('test-project-id');
  });

  it('should register event listeners for provided callbacks', () => {
    // Mock isConnected to return true to trigger the useEffect
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    const onTaskCreated = jest.fn();
    const onTaskUpdated = jest.fn();
    
    renderHook(() => useSocket({
      onTaskCreated,
      onTaskUpdated
    }));
    
    expect(socketService.on).toHaveBeenCalledWith(SOCKET_EVENTS.TASK_CREATED, onTaskCreated);
    expect(socketService.on).toHaveBeenCalledWith(SOCKET_EVENTS.TASK_UPDATED, onTaskUpdated);
  });

  it('should cleanup event listeners on unmount', () => {
    // Mock isConnected to return true to trigger the useEffect
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    const onTaskCreated = jest.fn();
    const onTaskUpdated = jest.fn();
    
    const { unmount } = renderHook(() => useSocket({
      onTaskCreated,
      onTaskUpdated
    }));
    
    // Trigger unmount
    unmount();
    
    expect(socketService.off).toHaveBeenCalledWith(SOCKET_EVENTS.TASK_CREATED);
    expect(socketService.off).toHaveBeenCalledWith(SOCKET_EVENTS.TASK_UPDATED);
  });
}); 