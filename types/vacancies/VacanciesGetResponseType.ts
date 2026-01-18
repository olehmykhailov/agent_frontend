export type VacanciesGetResponse = {
    id: string;
    title: string;
    location: string;
    minSalary: number;
    maxSalary: number;
    techStack: Array<string>;
    description: string;
    companyName: string;
    seniorityLevel: string;
    sourceLink: string;

}