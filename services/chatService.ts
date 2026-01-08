import { PageResponse } from '@/types/common/PageResponse';

import { CreateChatRequestType } from '@/types/chats/CreateChatRequestType';
import { CreateChatResponseType } from '@/types/chats/CreateChatResponseType';
import { ChatGetResponseType } from '@/types/chats/ChatGetResponseType';

import api from './api';


export const createChat = async (
    createChatRequest: CreateChatRequestType
): Promise<CreateChatResponseType> => {
    const {data: newChat} = await api.post<CreateChatResponseType>(
        "chats",
        createChatRequest
    );

    if (typeof window !== "undefined") {
        const storedChats = localStorage.getItem("chats");

        const chats: CreateChatResponseType[] = storedChats
        ? JSON.parse(storedChats)
        : [];

        chats.push(newChat);

        localStorage.setItem("chats", JSON.stringify(chats));
    }

    return newChat;
};

export const getChats = async (
    page = 0,
    size = 50
  ): Promise<PageResponse<ChatGetResponseType>> => {
    const { data } = await api.get<
      PageResponse<ChatGetResponseType>
    >("/chats", {
      params: { page, size },
    });
    
    return data;
}