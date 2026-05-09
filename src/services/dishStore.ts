import type { DishResponse } from "./dishService";

function key(restaurantId: string) {
    return `dishes_${restaurantId}`;
}

export function getDishes(restaurantId: string): DishResponse[] {
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

export function updateDishState(restaurantId: string, dishId: string, state: "DRAFT" | "LIVE"): void {
    const dishes = getDishes(restaurantId);
    const dish = dishes.find((d) => d.id === dishId);
    if (dish) {
        dish.state = state;
        save(restaurantId, dishes);
    }
}

export function updateDishStock(restaurantId: string, dishId: string, inStock: boolean): void {
    const dishes = getDishes(restaurantId);
    const dish = dishes.find((d) => d.id === dishId);
    if (dish) {
        dish.inStock = inStock;
        save(restaurantId, dishes);
    }
}
