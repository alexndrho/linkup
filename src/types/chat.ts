export enum ChatStatus {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}

export interface ChatRoom {
  id: string;
  created_at: string;
}
