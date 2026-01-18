"use client";

import { useEffect, useRef } from "react";
import { useChat } from "./ChatProvider";

export default function ChatMessages() {
  const { selectedChatId, messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg font-medium">Select a chat to start messaging</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50 scroll-smooth">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-2xl max-w-[80%] shadow-sm transition-all text-sm leading-relaxed ${
            msg.role === "user"
              ? "bg-blue-600 text-white self-end rounded-br-none"
              : "bg-white text-slate-800 border border-slate-100 self-start rounded-bl-none"
          }`}
        >
      <div ref={messagesEndRef} />
          {msg.content}
        </div>
      ))}
      {messages.length === 0 && (
         <div className="text-center text-slate-400 my-auto text-sm">No messages here yet. Say hello! 👋</div>
      )}
    </div>
  );
}
