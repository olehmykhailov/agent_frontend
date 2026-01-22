import { ChatProvider } from "@/src/components/ChatProvider";
import ChatsLayout from "@/src/components/ChatLayout";

export default function ChatsPage() {
  return (
    <ChatProvider>
      <ChatsLayout />
    </ChatProvider>
  );
}
