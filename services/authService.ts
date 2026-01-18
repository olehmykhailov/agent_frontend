import { SignInRequest } from '../types/auth/SignInRequestType';
import { SignInResponse } from '../types/auth/SignInResponseType';
import { RefreshRequestType } from '@/types/auth/RefreshRequestType';
import { RefreshResponseType } from '@/types/auth/RefreshResponseType';

import api from './api';
import { SignUpRequest } from '@/types/auth/SignUpRequestType';
import { logToServer } from '@/app/actions';

export const signIn = async (
  signInRequest: SignInRequest
): Promise<SignInResponse> => {
  const response = await api.post<SignInResponse>(
    "auth/sign-in",
    signInRequest
  );
  
  await logToServer("SignIn Response Data:", response.data);

  if (!response.data.accessToken) {
      await logToServer("ERROR: AccessToken is missing in response!", response.data);
  }

  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("email", response.data.email);
  localStorage.setItem("userId", response.data.id);
  if (response.data.username) {
    localStorage.setItem("username", response.data.username);
  }

  return response.data;
}

export const signUp = async (
  signUpRequest: SignUpRequest
): Promise<void> => {
  await api.post<void>(
    "auth/sign-up",
    signUpRequest
  );
}

export const refresh = async (
  refreshRequest: RefreshRequestType
): Promise<RefreshResponseType> => {
  const response = await api.post<RefreshResponseType>(
    "auth/refresh-token",
    refreshRequest
  );
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return response.data;
}

