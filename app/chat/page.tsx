import { ChatProvider } from "@/components/ChatProvider";
import ChatsLayout from "../../components/ChatLayout";

export default function ChatsPage() {
  return (
    <ChatProvider>
      <ChatsLayout />
    </ChatProvider>
  );
}
