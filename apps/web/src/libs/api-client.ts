import { headers } from 'next/headers'
import { HttpStatusCode } from 'axios'
import type { ApiResponse } from '@/types/shared'
import 'server-only'


class ApiClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const { auth } = await import('@/libs/auth')
        const session = await auth.api.getSession({ 
            headers: await headers() 
        })

        const token = session?.user?.accessToken

        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    // private async getLocaleHeaders(): Promise<Record<string, string>> {
    //     const cookiesStore = await cookies();
    //     const locale = cookiesStore.get('locale')?.value || 'en';
    //     return {
    //         'Accept-Language': locale
    //     }
    // }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = new URL(endpoint, this.baseURL).toString()
            const authHeaders = await this.getAuthHeaders()
            // const localeHeaders = await this.getLocaleHeaders()

            // Don't set Content-Type for FormData, let browser handle it
            const headers: Record<string, string> = options.body instanceof FormData 
                ? { 
                    ...authHeaders,
                 }
                : { 
                    'Content-Type': 'application/json', 
                    ...authHeaders,
                }
            
            const config: RequestInit = {
                headers: {
                    ...headers,
                    ...options.headers,
                },
                ...options,
            }

            const response = await fetch(url, config)
            if (response.status === HttpStatusCode.Unauthorized) {
                //  return signOut({
                //     redirectTo: '/auth/signin',
                //     redirect: true
                // })
            }

            // Handle empty responses (like 204 No Content)
            const contentType = response.headers.get('content-type')
            if (contentType && !contentType.includes('application/json')) {
                return {
                    statusCode: response.status,
                    isSuccess: response.ok,
                    message: response.statusText,
                    timestamp: new Date().toISOString(),
                }
            }
            const result = await response.json()
            
            // If the response is already in ApiResponse format, return it
            if (result && typeof result === 'object' && 'isSuccess' in result) {
                return result as ApiResponse<T>
            }

            // Otherwise, wrap it in ApiResponse
            return {
                statusCode: response.status,
                isSuccess: response.ok,
                data: result as T,
                timestamp: new Date().toISOString(),
                path: endpoint,
            }
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

    // private async requestExternal<T>(
    //     url: string,
    //     options: RequestInit = {}
    // ): Promise<T> {
    //     const config: RequestInit = {
    //         headers: {
    //             ...options.headers,
    //         },
    //         ...options,
    //     }

    //     const response = await fetch(url, config)
    //     if (!response.ok) {
    //         throw new Error(`External API error: ${response.status} ${response.statusText}`)
    //     }
    //     return response.json()
    // }

    // async getExternal<T>(url: string, options?: RequestInit): Promise<T> {
    //     return this.requestExternal<T>(url, { method: 'GET', ...options })
    // }

    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', ...options })
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        })
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        })
    }

    async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        })
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options })
    }

    // async uploadFile<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    //     const authHeaders = await this.getAuthHeaders()
    //     return this.request<T>(endpoint, {
    //         method: 'POST',
    //         headers: {
    //             ...authHeaders,
    //             // Don't set Content-Type for FormData, let browser set it with boundary
    //         },
    //         body: formData,
    //         ...options
    //     })
    // }
}

// Server-side API client (for server actions and API routes)
export const apiClient = new ApiClient(process.env.API_BASE_URL as string)
