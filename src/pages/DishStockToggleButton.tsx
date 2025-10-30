import { Button } from "@mui/material";
import { markDishOutOfStock, markDishBackInStock } from "../services/dishService";
import { useState } from "react";

export default function DishStockToggleButton({ dishId, initialStock }: { dishId: string; initialStock: boolean }) {
    const [inStock, setInStock] = useState(initialStock);
    const [loading, setLoading] = useState(false);

    const toggleStock = async () => {
        setLoading(true);
        try {
            if (inStock) {
                await markDishOutOfStock(dishId);
            } else {
                await markDishBackInStock(dishId);
            }
            setInStock(!inStock);
        } catch (err) {
            console.error("Failed to update stock status:", err);
            alert("Error updating stock status.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            color={inStock ? "warning" : "success"}
            onClick={toggleStock}
            disabled={loading}
        >
            {loading
                ? "Processing..."
                : inStock
                    ? "Mark Out of Stock"
                    : "Mark Back In Stock"}
        </Button>
    );
}
