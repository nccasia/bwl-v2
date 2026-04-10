import axios from "axios";
import { getUploadUrlAction } from "@/actions/post-actions";
import { UploadResult } from "@/types/post";

export class UploadService {

    async uploadPostImage(file: File): Promise<UploadResult> {
        try {
            const response = await getUploadUrlAction({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            });

            if (!response.isSuccess || !("data" in response) || !response.data) {
                return this.handleActionError(response);
            }

            const { uploadUrl, accessUrl } = response.data;

            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type,
                    "x-amz-acl": "public-read",
                },
            });

            return { success: true, url: accessUrl };
        } catch (e) {
            return this.handleUploadError(e);
        }
    }
    async uploadMultiplePostImages(files: File[]): Promise<string[]> {
        if (!files.length) return [];

        const results = await Promise.all(
            files.map((file) => this.uploadPostImage(file))
        );
        return results
            .filter((res) => res.success && res.url)
            .map((res) => res.url as string);
    }

    private handleActionError(response: any): UploadResult {
        return {
            success: false,
            error: response,
        };
    }

    private handleUploadError(error: any): UploadResult {
        return {
            success: false,
            error: error,
        };
    }
}

export const uploadService = new UploadService();
