import { UploadResult } from "@/types/post";

export async function handleActionError(error: unknown): Promise<UploadResult> {
    return {
        success: false,
        error: String(error),
    };
}

export async function handleUploadError(error: unknown): Promise<UploadResult> {
    return {
        success: false,
        error: String(error),
    };
}
