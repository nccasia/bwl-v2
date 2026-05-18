import axios from 'axios';

export async function uploadFile(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
) {
    return axios.put(url, file, {
        headers: {
            "Content-Type": file.type,
            "x-amz-acl": "public-read",
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
            }
        },
    });
}
