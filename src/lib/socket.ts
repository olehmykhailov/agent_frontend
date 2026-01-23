// lib/socket.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { refresh } from "@/src/services/authService";

let stompClient: Client | null = null;
let retryCount = 0;

export const connectSocket = (onConnect?: () => void) => {
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (e) {
      console.error(e);
    }
  }

  const token = localStorage.getItem("accessToken");

  if (!token) {
    return;
  }

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws-chat?token=${token}`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    connectionTimeout: 3000,
    reconnectDelay: 0,
    debug: () => {},

    onConnect: () => {
      console.log("WS connected");
      retryCount = 0;
      onConnect?.();
    },

    onWebSocketError: () => {
      handleConnectionError(onConnect);
    },
  });

  stompClient.activate();
};

const handleConnectionError = async (onConnect?: () => void) => {
  if (retryCount >= 1) {
    window.location.href = "/auth";
    return;
  }

  retryCount++;

  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem("userId");

    if (refreshToken && userId) {
      await refresh({ refreshToken, userId });
      connectSocket(onConnect);
    } else {
      window.location.href = "/auth";
    }
  } catch (error) {
    window.location.href = "/auth";
  }
};

export const disconnectSocket = () => {
  stompClient?.deactivate();
};

export const subscribeToChat = (
  chatId: string,
  callback: (msg: any) => void
) => {
  if (!stompClient) return;
  
  return stompClient.subscribe(
    `/topic/chat/${chatId}`,
    message => {
      callback(JSON.parse(message.body));
      // optionally console.log here in client only
      // console.log("WS message", message.body);
    }
  );
};

export const sendMessage = (
  chatId: string,
  payload: any
) => {
  stompClient?.publish({
    destination: `/app/chat/${chatId}`,
    body: JSON.stringify({
      chatId,
      ...payload,
    }),
  });
};

export const subscribeToVacancies = (
  chatId: string,
  callback: (msg: any) => void
) => {
  if (!stompClient) return;

  return stompClient.subscribe(
    `/topic/vacancies/${chatId}`,
    message => {
      callback(JSON.parse(message.body));
    }
  );
};

