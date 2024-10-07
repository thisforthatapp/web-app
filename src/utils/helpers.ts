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

export async function verifyNFTs(
  address: string,
  chain: number,
  signature: string,
  token: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      body: JSON.stringify({ address, chain, signature }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (errorText === "Verification failed") {
        return {
          error: errorText,
          validVerifications: 0,
        };
      }
    }

    const { validVerifications } = await response.json();

    console.log("validVerifications", validVerifications);

    return { error: null, validVerifications };
  } catch (error) {
    return {
      error,
      validVerifications: 0,
    };
  }
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}
