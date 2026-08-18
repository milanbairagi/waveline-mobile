import type { ChatResponse, Message } from "@/types";
import { createContext, useContext, useState } from "react";

const ChatContext = createContext<{
  chats: ChatResponse[];
  setChats: React.Dispatch<React.SetStateAction<ChatResponse[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  getChatById: (id: number) => ChatResponse | null;
}>({
  chats: [],
  setChats: () => {},
  messages: [],
  setMessages: () => {},
  getChatById: () => null,
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const getChatById = (id: number) => {
    return chats.find((chat) => chat.id === id) || null;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        messages,
        setMessages,
        getChatById,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
