"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "./ChatProvider";
import { RoleEnum } from "@/src/types/messages/RoleEnum";

export default function ChatMessages() {
  const { selectedChatId, messages, isLoadingAnswer } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChatId, isLoadingAnswer]);

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg font-medium">Select a chat to start messaging</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-6 flex flex-col gap-4 bg-slate-50 scroll-vertical">
      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className={`p-4 rounded-2xl max-w-[80%] shadow-sm transition-all text-sm leading-relaxed ${
            msg.role === RoleEnum.user
              ? "bg-blue-600 text-white self-end rounded-br-none"
              : "bg-white text-slate-800 border border-slate-100 self-start rounded-bl-none"
          }`}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for elements inside markdown
              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{children}</a>,
              code: ({className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !className;
                return isInline 
                  ? <code className="bg-black/10 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                  : <code className="block bg-black/10 p-2 rounded font-mono text-xs overflow-x-auto my-2" {...props}>{children}</code>;
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ))}
      {isLoadingAnswer && (
        <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 self-start">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
      {messages.length === 0 && (
         <div className="text-center text-slate-400 my-auto text-sm">No messages here yet. Say hello! 👋</div>
      )}
    </div>
  );
}
