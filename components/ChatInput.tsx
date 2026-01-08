"use client";

import { useChat } from "./ChatProvider";
import { useState } from "react";
import { sendMessage as sendSocketMessage } from "@/lib/socket";

export default function ChatInput() {
  const { selectedChatId } = useChat();
  const [text, setText] = useState("");

  if (!selectedChatId) return null;

  const handleSendMessage = () => {
    if (!text.trim()) return;
    
    sendSocketMessage(selectedChatId, { content: text });
    setText("");
  };

  return (
    <div className="border-t p-4 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        className="flex-1 border p-2 rounded"
        placeholder="Type a message..."
      />
      <button 
        onClick={handleSendMessage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
}
