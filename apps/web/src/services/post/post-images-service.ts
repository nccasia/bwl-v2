import { getUploadUrlAction } from "@/services/post/post-actions-service";
import { UploadResult } from "@/types/post";
import { handleActionError, handleUploadError } from "@/modules/shared/hooks/image-upload/use-image-upload";
import { uploadFile } from "@/libs/upload-client";


export async function uploadPostImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
        const response = await getUploadUrlAction({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
        });

        if (!response.isSuccess || !response.data) {
            return handleActionError(response);
        }

        const { uploadUrl, accessUrl } = response.data;
        await uploadFile(uploadUrl, file, onProgress);

        return { success: true, url: accessUrl };
    } catch (e) {
        return handleUploadError(e)
    }
}

export async function uploadMultiplePostImages(files: File[], onProgress?: (index: number, progress: number) => void) {
    if (!files.length) return [];

    const results = await Promise.all(
        files.map((file, index) => 
            uploadPostImage(file, (progress: number) => {
                if (onProgress) onProgress(index, progress);
            })
        )
    );
    return results
        .filter((res) => res.success && res.url)
        .map((res) => res.url as string);
} 
