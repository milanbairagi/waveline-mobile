// TODO: Add more fields to the User
interface User {
  id: number;
  username: string;
  password: string;
}

export type CreateUserDto = Omit<User, "id">;
export type UserResponse = Omit<User, "password">;

export type Tokens = {
  access: string;
  refresh: string;
};

type ParticipantDetails = {
  id: number;
  username: string;
};

type Chat = {
  id: number;
  participants: [number, number];
  participants_detail: ParticipantDetails[];
  last_message: Message | null;
  created_at: string;
  updated_at: string;
};

export type ChatDto = Pick<Chat, "participants">;

export type ChatResponse = Omit<Chat, "participants">;

export type Message = {
  id: number;
  chat: number;
  sender: number;
  content: string;
  status: "sent" | "delivered" | "seen";
  timestamp: string;
};

export type MessageDto = Pick<Message, "content">;
