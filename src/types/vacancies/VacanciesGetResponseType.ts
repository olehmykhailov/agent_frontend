export type VacanciesGetResponse = {
    id: string;
    jobTitle: string;
    location: string;
    minSalary: number;
    maxSalary: number;
    techStack: Array<string>;
    description: string;
    companyName: string;
    seniorityLevel: string;
    sourceLink: string;

}