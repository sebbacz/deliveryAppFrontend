import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface BasketItem {
    dishId: string;
    dishName: string;
    price: number;
    quantity: number;
    pictureUrl?: string;
}

interface BasketState {
    restaurantId: string | null;
    restaurantName: string;
    items: BasketItem[];
}

interface BasketContextType {
    basket: BasketState;
    addToBasket: (restaurantId: string, restaurantName: string, item: Omit<BasketItem, "quantity">) => void;
    removeFromBasket: (dishId: string) => void;
    updateQuantity: (dishId: string, delta: number) => void;
    clearBasket: () => void;
    totalItems: number;
    totalPrice: number;
}

// Basket persisted to localStorage so items survive a page refresh or tab close.
const STORAGE_KEY = "kdg_basket";

function loadBasket(): BasketState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore corrupt data
    }
    return { restaurantId: null, restaurantName: "", items: [] };
}

const BasketContext = createContext<BasketContextType>({} as BasketContextType);

export function BasketProvider({ children }: { children: ReactNode }) {
    const [basket, setBasket] = useState<BasketState>(loadBasket);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    }, [basket]);

    const addToBasket = (restaurantId: string, restaurantName: string, item: Omit<BasketItem, "quantity">) => {
        setBasket((prev) => {
            // Adding from a different restaurant clears the previous basket automatically
            if (prev.restaurantId && prev.restaurantId !== restaurantId) {
                return { restaurantId, restaurantName, items: [{ ...item, quantity: 1 }] };
            }
            const existing = prev.items.find((i) => i.dishId === item.dishId);
            if (existing) {
                return {
                    ...prev,
                    items: prev.items.map((i) =>
                        i.dishId === item.dishId ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            }
            return { restaurantId, restaurantName, items: [...prev.items, { ...item, quantity: 1 }] };
        });
    };

    const removeFromBasket = (dishId: string) => {
        setBasket((prev) => {
            const items = prev.items.filter((i) => i.dishId !== dishId);
            return { ...prev, items, restaurantId: items.length === 0 ? null : prev.restaurantId };
        });
    };

    const updateQuantity = (dishId: string, delta: number) => {
        setBasket((prev) => {
            const items = prev.items
                .map((i) => (i.dishId === dishId ? { ...i, quantity: i.quantity + delta } : i))
                .filter((i) => i.quantity > 0);
            return { ...prev, items, restaurantId: items.length === 0 ? null : prev.restaurantId };
        });
    };

    const clearBasket = () => setBasket({ restaurantId: null, restaurantName: "", items: [] });

    const totalItems = basket.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = basket.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <BasketContext.Provider value={{ basket, addToBasket, removeFromBasket, updateQuantity, clearBasket, totalItems, totalPrice }}>
            {children}
        </BasketContext.Provider>
    );
}

export function useBasket() {
    return useContext(BasketContext);
}
