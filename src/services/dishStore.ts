//   localStorage cache for a restaurant's dishes
import type { DishResponse } from "./dishService";

// Generates a unique localStorage key per restaurant
function key(restaurantId: string) {
    return `dishes_${restaurantId}`;
}

// Reads the cached dish list for a restaurant;
function getDishes(restaurantId: string): DishResponse[] {
    try {
        const raw = localStorage.getItem(key(restaurantId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function save(restaurantId: string, dishes: DishResponse[]) {
    localStorage.setItem(key(restaurantId), JSON.stringify(dishes));
}

// Inserts a new dish or replaces an existing one with the same id
export function upsertDish(restaurantId: string, dish: DishResponse): void {
    const dishes = getDishes(restaurantId);
    const idx = dishes.findIndex((d) => d.id === dish.id);
    if (idx >= 0) dishes[idx] = dish; // update existing
    else dishes.push(dish);           // add new
    save(restaurantId, dishes);
}
