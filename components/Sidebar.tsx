"use client";

import { useChat } from "./ChatProvider";

export default function ChatSidebar() {
  const { chats, selectChat, selectedChatId } = useChat();
  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-xl font-bold text-slate-800">Chats</h2>
      </div>
      <ul className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => selectChat(chat.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
              chat.id === selectedChatId
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-700 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${chat.id === selectedChatId ? "bg-blue-300" : "bg-slate-300"}`} />
            <span className="font-medium truncate">{chat.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
