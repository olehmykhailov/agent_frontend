"use client";

import { useChat } from "./ChatProvider";

export default function ChatHeader() {
  const { selectedChatId, chats, toggleVacancies, isVacanciesOpen } = useChat();

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  if (!selectedChatId) return null;

  return (
    <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
           {(selectedChat?.title || "C").charAt(0).toUpperCase()}
        </div>
        <div className="font-bold text-slate-800 text-lg">
           {selectedChat?.title || "Chat"}
        </div>
      </div>
      
      <button
        onClick={toggleVacancies}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border flex items-center gap-2
          ${isVacanciesOpen 
            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-inner" 
            : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm hover:shadow"
          }`}
      >
        <span className="text-lg">💼</span>
        {isVacanciesOpen ? "Hide Vacancies" : "Show Vacancies"}
      </button>
    </div>
  );
}
