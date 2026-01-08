import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./Sidebar";


export default function ChatsLayout() {
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen">
      <aside className="border-r">
        <ChatSidebar />
      </aside>

      <main className="flex flex-col">
        <ChatMessages />
        <ChatInput />
      </main>
    </div>
  );
}
