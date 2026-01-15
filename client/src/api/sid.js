import axios from "axios";

export async function getUuid() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/uuid`,
      {
        withCredentials: false,
      }
    );

    return response.data.sessionId || response.data.uuid || response.data;
  } catch (error) {
    console.error("UUID 가져오기 실패:", error);
    throw error;
  }
}
