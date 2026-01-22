import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import VacanciesSidebar from "./VacanciesSidebar";

export default function ChatsLayout() {
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
      <aside className="border-r h-full overflow-hidden min-h-0">
        <ChatSidebar />
      </aside>

      <main className="flex flex-col relative h-full min-w-0 min-h-0">
        <ChatHeader />
        <div className="flex-1 min-h-0 h-full flex flex-col">
          <ChatMessages />
        </div>
        <ChatInput />
        <VacanciesSidebar />
      </main>
    </div>
  );
}
