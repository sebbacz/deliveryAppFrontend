//  localStorage cache for a single dish after draft save; prevents a full refetch on the edit page.
import type { DishResponse } from "./dishService";

function key(restaurantId: string) {
    return `dishes_${restaurantId}`;
}

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

export function upsertDish(restaurantId: string, dish: DishResponse): void {
    const dishes = getDishes(restaurantId);
    const idx = dishes.findIndex((d) => d.id === dish.id);
    if (idx >= 0) dishes[idx] = dish;
    else dishes.push(dish);
    save(restaurantId, dishes);
}
