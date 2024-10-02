export async function uploadFile(
  formData: FormData,
  token: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const file = formData.get("file") as File;

    const response = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ fileType: file.type }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const { url, key } = await response.json();

    const uploadResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file");
    }

    return { key };
  } catch (error) {
    alert("Upload error:" + error);
    return null;
  }
}
