"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";
import { ChatGetResponseType } from "@/types/chats/ChatGetResponseType";
import { getChats } from "@/services/chatService";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface ChatContextType {
  chats: ChatGetResponseType[];
  selectedChatId: string | null;
  selectChat: (id: string) => void;
  isSocketConnected: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<ChatGetResponseType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    connectSocket(() => {
      setIsSocketConnected(true);
    });
    return () => {
      disconnectSocket();
      setIsSocketConnected(false);
    };
  }, []);

  useEffect(() => {
    getChats().then((r) => {
      setChats(r.content);
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChatId,
        selectChat: setSelectedChatId,
        isSocketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
