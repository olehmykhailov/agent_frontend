import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import VacanciesSidebar from "./VacanciesSidebar";

export default function ChatsLayout() {
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
      <aside className="border-r h-full overflow-y-auto">
        <ChatSidebar />
      </aside>

      <main className="flex flex-col relative h-full min-w-0">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
        <VacanciesSidebar />
      </main>
    </div>
  );
}
