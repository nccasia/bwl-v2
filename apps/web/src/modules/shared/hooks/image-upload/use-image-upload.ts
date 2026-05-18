import { useState, useCallback } from "react";
import { uploadMultiplePostImages } from "@/services/post";

export interface ImageUploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
    uploadedUrls: string[];
}

export function useImageUpload() {
    const [state, setState] = useState<ImageUploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        uploadedUrls: [],
    });

    const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        setState((prev) => ({
            ...prev,
            isUploading: true,
            progress: 0,
            error: null,
        }));

        try {
            const fileProgresses = new Array(files.length).fill(0);

            const urls = await uploadMultiplePostImages(
                files,
                (index: number, progress: number) => {
                    fileProgresses[index] = progress;
                    const totalProgress = Math.round(
                        fileProgresses.reduce((sum, p) => sum + p, 0) / files.length
                    );
                    setState((prev) => ({ ...prev, progress: totalProgress }));
                }
            );

            setState((prev) => ({
                ...prev,
                isUploading: false,
                progress: 100,
                uploadedUrls: urls,
            }));

            return urls;
        } catch (e) {
            throw e;
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            error: null,
            uploadedUrls: [],
        });
    }, []);

    return {
        ...state,
        uploadImages,
        reset,
    };
}

