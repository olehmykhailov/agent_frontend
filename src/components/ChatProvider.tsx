"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { ChatGetResponseType } from "@/src/types/chats/ChatGetResponseType";
import { MessageGetResponseType } from "@/src/types/messages/MessageGetResponseType";
import { RoleEnum } from "@/src/types/messages/RoleEnum";
import { getChats, createChat as createChatService } from "@/src/services/chatService";
import { getMessages } from "@/src/services/messageService";
import { connectSocket, disconnectSocket, subscribeToChat, subscribeToVacancies } from "@/src/lib/socket";

interface ChatContextType {
  chats: ChatGetResponseType[];
  selectedChatId: string | null;
  selectChat: (id: string) => void;
  isSocketConnected: boolean;
  isVacanciesOpen: boolean;
  toggleVacancies: () => void;
  messages: MessageGetResponseType[];
  addMessage: (msg: MessageGetResponseType) => void;
  setMessages: Dispatch<SetStateAction<MessageGetResponseType[]>>;
  replaceMessage: (tempId: string, newMsg: MessageGetResponseType) => void;
  createChat: () => Promise<void>;
  isLoadingAnswer: boolean;
  setIsLoadingAnswer: Dispatch<SetStateAction<boolean>>;
  hasNewVacancies: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatGetResponseType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isVacanciesOpen, setIsVacanciesOpen] = useState(false);
  const [messages, setMessages] = useState<MessageGetResponseType[]>([]);
  const [hasNewVacancies, setHasNewVacancies] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  const toggleVacancies = () => {
    setIsVacanciesOpen((prev) => {
      if (!prev) setHasNewVacancies(false);
      return !prev;
    });
  };
  
  const addMessage = useCallback((msg: MessageGetResponseType) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const replaceMessage = useCallback((tempId: string, newMsg: MessageGetResponseType) => {
    setMessages((prev) => {
      const exists = prev.some(m => m.id === newMsg.id);
      if (exists) {
        return prev.filter(m => m.id !== tempId);
      }
      return prev.map(m => (m.id === tempId ? newMsg : m));
    });
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
    // Reset loading state when changing chats
    setIsLoadingAnswer(false);
    
    const fetchMessages = async () => {
      if (selectedChatId) {
        try {
          const response = await getMessages(selectedChatId);
          setMessages(response.content.reverse());
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 401 || status === 403) {
            router.push("/auth");
          } else {
            console.error("Failed to load messages", e);
          }
        }
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChatId, router]);

  useEffect(() => {
    if (selectedChatId && isSocketConnected) {
      // Подписка на новые сообщения
      const subscription = subscribeToChat(selectedChatId, (newMessage) => {
        // Stop loading if we receive a message from assistant
        if (newMessage.role === RoleEnum.assistant) {
          setIsLoadingAnswer(false);
        }

        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      const vacanciesSubscription = subscribeToVacancies(selectedChatId, () => {
        if (!isVacanciesOpen) {
          setHasNewVacancies(true);
        }
      });

      return () => {
        subscription?.unsubscribe();
        vacanciesSubscription?.unsubscribe();
      };
    }
  }, [selectedChatId, isSocketConnected, isVacanciesOpen]);

  const createChat = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const newChat = await createChatService({ userId });
      setChats((prev) => [{ id: newChat.id, title: newChat.title }, ...prev]);
      setSelectedChatId(newChat.id);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  }, []);

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
        setMessages,
        replaceMessage,
        createChat,
        isLoadingAnswer,
        setIsLoadingAnswer,
        hasNewVacancies
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
