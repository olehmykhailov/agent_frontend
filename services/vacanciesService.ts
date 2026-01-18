import { PageResponse } from "@/types/common/PageResponse";
import api from "./api";

import { VacanciesGetResponse } from "@/types/vacancies/VacanciesGetResponseType";

export const getVacancies = async (
    chatId: string,
    page = 0,
    size = 50
): Promise<PageResponse<VacanciesGetResponse>> => {
    const response = await api.get<PageResponse<VacanciesGetResponse>>(
        `vacancies/${chatId}`,
        {
            params: {page, size}
        }
    )
    console.log(response.data);
    return response.data;
}