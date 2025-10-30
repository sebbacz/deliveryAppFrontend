import { Button } from "@mui/material";
import { applyPendingDishChanges } from "../services/dishService";
import { useState } from "react";

export default function ApplyChangesButton({ restaurantId }: { restaurantId: string }) {
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        try {
            await applyPendingDishChanges(restaurantId);
            alert("All pending changes applied successfully!");
        } catch (err) {
            console.error("Error applying dish changes:", err);
            alert("Failed to apply changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            color="success"
            disabled={loading}
            onClick={handleApply}
        >
            {loading ? "Applying..." : "Apply All Changes"}
        </Button>
    );
}
