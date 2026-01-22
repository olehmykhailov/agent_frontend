import { RoleEnum } from "./RoleEnum";

export type MessageGetResponseType = {
    id: string;
    chatId: string;
    content: string;
    role: RoleEnum;
}