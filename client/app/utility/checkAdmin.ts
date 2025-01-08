import axios from "axios";
interface ApiResponse {
    status: number;
    message?: string;
}

export const checkIsAdmin = async (id: string|null|undefined, roomcode: string|undefined): Promise<boolean> => {
    try {
        if (!id) {
            console.error("Invalid id:", id);
            return false;
        }
        const userId=parseInt(id,10);
        const apiurl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.post<ApiResponse>(`${apiurl}/api/checkadminstatus`, {
            id: userId,
            roomId: roomcode,
        });
        return response.status == 200;
    } catch (error) {
        console.error("Error while checking admin status:", error);
        return false;
    }
};
