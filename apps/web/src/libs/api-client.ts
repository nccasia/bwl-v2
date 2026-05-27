import { AxiosRequestConfig, HttpStatusCode } from 'axios'
import type { ApiResponse } from '@/types/shared'
import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5100'
class ApiClient {
    private httpClient: AxiosInstance
    constructor(baseURL: string) {
        this.httpClient = axios.create({
            baseURL,
        })
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const { auth } = await import('@/libs/auth')
        const { headers, cookies } = await import('next/headers')
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (session?.user?.accessToken) {
            return { Authorization: `Bearer ${session.user.accessToken}` }
        }

        const cookieStore = await cookies()
        const mezonCookie = cookieStore.get('mezon_token')
        if (mezonCookie?.value) {
            try {
                const payload = JSON.parse(mezonCookie.value) as { accessToken?: string }
                if (payload.accessToken) {
                    return { Authorization: `Bearer ${payload.accessToken}` }
                }
            } catch {
            }
        }

        return {}
    }


    private async request<T>(
        endpoint: string,
        options: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const authHeaders = await this.getAuthHeaders()
            const config = {
                ...options,
                url: endpoint,
                headers: {
                    ...authHeaders,
                    ...options?.headers,
                },
            }

            const response = await this.httpClient.request(config)

            // Handle empty responses (like 204 No Content)
            const contentType = response.headers['content-type']
            if (contentType && !contentType.includes('application/json')) {
                return {
                    statusCode: response.status,
                    isSuccess: true,
                    message: response.statusText,
                    timestamp: new Date().toISOString(),
                }
            }
            return response.data
        } catch (error: unknown) {
            console.error('API request error:', error)
            return {
                statusCode: HttpStatusCode.InternalServerError,
                isSuccess: false,
                message: 'An unexpected error while processing your request.',
                timestamp: new Date().toISOString(),
                path: endpoint,
            }
        }
    }

    async get<T>(endpoint: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', ...options })
    }

    async post<T>(endpoint: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            data: data,
            ...options
        })
    }

    async put<T>(endpoint: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            data: data,
            ...options
        })
    }

    async patch<T>(endpoint: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            data: data,
            ...options
        })
    }

    async delete<T>(endpoint: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options })
    }
}

// Server-side API client (for server actions and API routes)
export const apiClient = new ApiClient(API_BASE_URL)
