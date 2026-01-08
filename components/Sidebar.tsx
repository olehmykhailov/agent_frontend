"use client";

import { useChat } from "./ChatProvider";

export default function ChatSidebar() {
  const { chats, selectChat, selectedChatId } = useChat();
  return (
    <ul>
      {chats.map(chat => (
        <li
          key={chat.id}
          onClick={() => selectChat(chat.id)}
          className={`p-2 cursor-pointer text-black ${
            chat.id === selectedChatId ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          {chat.title}
        </li>
      ))}
    </ul>
  );
}
