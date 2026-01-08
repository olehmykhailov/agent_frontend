export type SignInResponse = {
    id: string;
    email: string;
    username?: string;
    accessToken: string;
    refreshToken: string;
}