import { RoleEnum } from "./RoleEnum";

export type CreateMessageResponseType = {
    id: string;
    chatId: string;
    content: string;
    role: RoleEnum;
}