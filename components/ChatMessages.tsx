"use client";

import { useEffect, useState } from "react";
import { useChat } from "./ChatProvider";
import { getMessages } from "@/services/messageService";
import { MessageGetResponseType } from "@/types/messages/MessageGetResponseType";
import { subscribeToChat } from "@/lib/socket";

export default function ChatMessages() {
  const { selectedChatId, isSocketConnected } = useChat();
  const [messages, setMessages] = useState<MessageGetResponseType[]>([]);

  useEffect(() => {
    if (selectedChatId) {
      // Загрузка истории сообщений
      getMessages(selectedChatId).then((response) => {
        setMessages(response.content.reverse());
      });
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (selectedChatId && isSocketConnected) {
      // Подписка на новые сообщения
      const subscription = subscribeToChat(selectedChatId, (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedChatId, isSocketConnected]);

  if (!selectedChatId) {
    return <div className="p-4">Choose a chat</div>;
  }
  console.log(messages);
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-2 border rounded max-w-[80%] text-black ${
            msg.senderType === "USER"
              ? "bg-blue-100 self-end"
              : "bg-white self-start"
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
