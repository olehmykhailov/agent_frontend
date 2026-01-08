import { PageResponse } from '@/types/common/PageResponse';
import { MessageGetResponseType } from '@/types/messages/MessageGetResponseType';
import api from './api';

export const getMessages = async (
    chatId: string,
    page = 0,
    size = 50
): Promise<PageResponse<MessageGetResponseType>> => {
    const { data } = await api.get(
        `messages/${chatId}`,
        {
            params: {page, size}
        }
    );

    return data;
}