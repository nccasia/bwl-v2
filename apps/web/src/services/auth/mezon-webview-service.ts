import axios from 'axios';

const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5100';

export interface MezonWebViewTokenResponse {
  accessToken: string;
  expiresAt: string;
  userId: string;
  email?: string;
  userName: string;
  role: string;
}
const webViewAxios = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
});

export const mezonWebViewService = {

  loginWithWebViewData: async (
    hashData: string,
  ): Promise<MezonWebViewTokenResponse> => {
    const response = await webViewAxios.post<{
      data: MezonWebViewTokenResponse;
    }>('/v1/auth/mezon-webview', { hashData });
    return response.data.data;
  },
};
