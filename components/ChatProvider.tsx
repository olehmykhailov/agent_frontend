"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from "react";
import { ChatGetResponseType } from "@/types/chats/ChatGetResponseType";
import { MessageGetResponseType } from "@/types/messages/MessageGetResponseType";
import { getChats } from "@/services/chatService";
import { getMessages } from "@/services/messageService";
import { connectSocket, disconnectSocket, subscribeToChat } from "@/lib/socket";

interface ChatContextType {
  chats: ChatGetResponseType[];
  selectedChatId: string | null;
  selectChat: (id: string) => void;
  isSocketConnected: boolean;
  isVacanciesOpen: boolean;
  toggleVacancies: () => void;
  messages: MessageGetResponseType[];
  addMessage: (msg: MessageGetResponseType) => void;
  setMessages: (msgs: MessageGetResponseType[]) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<ChatGetResponseType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isVacanciesOpen, setIsVacanciesOpen] = useState(false);
  const [messages, setMessages] = useState<MessageGetResponseType[]>([]);

  const toggleVacancies = () => setIsVacanciesOpen((prev) => !prev);
  
  const addMessage = useCallback((msg: MessageGetResponseType) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

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

  useEffect(() => {
    if (selectedChatId) {
      // Загрузка истории сообщений
      getMessages(selectedChatId).then((response) => {
        setMessages(response.content.reverse());
      });
    } else {
        setMessages([]);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (selectedChatId && isSocketConnected) {
      // Подписка на новые сообщения
      const subscription = subscribeToChat(selectedChatId, (newMessage) => {
          // Check if message already exists (to avoid duplication if we added it optimistically)
          setMessages((prev) => {
              if (prev.some(m => m.id === newMessage.id)) {
                  return prev;
              }
              return [...prev, newMessage];
          });
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedChatId, isSocketConnected]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChatId,
        selectChat: setSelectedChatId,
        isSocketConnected,
        isVacanciesOpen,
        toggleVacancies,
        messages,
        addMessage,
        setMessages
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
