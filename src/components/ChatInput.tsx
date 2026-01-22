"use client";

import { useChat } from "./ChatProvider";
import { useState } from "react";
// import { sendMessage as sendSocketMessage } from "@/lib/socket"; // Unused
import { sendMessage } from "@/src/services/chatService";
import { RoleEnum } from "@/src/types/messages/RoleEnum";

export default function ChatInput() {
  const { selectedChatId, addMessage, replaceMessage, setMessages } = useChat();
  const [text, setText] = useState("");

  if (!selectedChatId) return null;

  const handleSendMessage = () => {
    if (!text.trim()) return;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    addMessage({
      id: tempId,
      chatId: selectedChatId,
      content: text,
      role: RoleEnum.user
    });

    const messageToSend = text;
    setText("");

    sendMessage(selectedChatId, messageToSend)
      .then((created) => {
        replaceMessage(tempId, {
          id: created.id,
          chatId: created.chatId,
          content: created.content,
          role: created.role, // Use role from response
        });
      })
      .catch((err) => {
        console.error("Failed to send message", err);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      });
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSendMessage}
          disabled={!text.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}
