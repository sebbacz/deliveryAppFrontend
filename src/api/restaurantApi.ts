import axiosClient from "./axiosClient";

export async function createRestaurant(data: any) {
    const res = await axiosClient.post("/restaurant", data);
    return res.data;
}
