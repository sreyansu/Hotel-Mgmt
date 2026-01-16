/**
 * Uploads an image to ImgBB and returns the display URL.
 * @param file The file object to upload
 * @param apiKey The ImgBB API Key
 * @returns Promise resolving to the image URL
 */
export const uploadImageToImgBB = async (file: File, apiKey: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error?.message || 'Failed to upload image');
    }

    return data.data.url;
};
