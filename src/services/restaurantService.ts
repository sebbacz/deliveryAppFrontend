import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type CreateRestaurantRequest = {
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrl: string;
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
};

export async function createRestaurant(data: CreateRestaurantRequest) {
    const response = await axios.post(`${BACKEND_URL}/api/restaurants`, data);
    return response.data;
}
