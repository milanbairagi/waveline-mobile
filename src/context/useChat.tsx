import type { Chat, Message } from "@/types";
import { createContext, useContext, useState } from "react";

const ChatContext = createContext<{
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  getChatById: (id: number) => Chat | null;
}>({
  chats: [],
  setChats: () => {},
  messages: [],
  setMessages: () => {},
  getChatById: () => null,
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
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
