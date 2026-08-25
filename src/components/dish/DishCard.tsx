// dish card: shows image, name, price, description, food tags
import { Box, Button, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import type { DishResponse } from "../../services/dishService";

interface DishCardProps {
    dish: DishResponse;
    restaurantClosed: boolean;
    onAddToBasket: () => void;
}

export default function DishCard({ dish, restaurantClosed, onAddToBasket }: DishCardProps) {
    // add button is disabled when the dish is out of stock OR the restaurant is closed
    const isDisabled = !dish.inStock || restaurantClosed;

    return (
        <Paper
            variant="outlined"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                opacity: dish.inStock ? 1 : 0.6, //  entire card when out of stock
            }}
        >
            {/* Dish thumbnail  */}
            {dish.pictureUrl ? (
                <Box
                    component="img"
                    src={dish.pictureUrl}
                    alt={dish.name}
                    sx={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                />
            ) : (
                <Box sx={{ height: 140, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.disabled">No image</Typography>
                </Box>
            )}

            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Name + price row */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2" sx={{ flexGrow: 1, mr: 1 }}>{dish.name}</Typography>
                    <Typography variant="subtitle2" color="primary">€{dish.price.toFixed(2)}</Typography>
                </Stack>

                {/* Outofstock  */}
                {!dish.inStock && <Chip label="Out of stock" size="small" color="warning" />}

                {/*   description  */}
                {dish.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {dish.description}
                    </Typography>
                )}

                {/* Food tag chips   */}
                {dish.foodTags?.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {dish.foodTags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                    </Stack>
                )}

                {/*   button is disabled  */}
                <Tooltip title={restaurantClosed ? "Restaurant is closed" : !dish.inStock ? "Out of stock" : ""}>
                    <span>
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<AddShoppingCartIcon />}
                            disabled={isDisabled}
                            onClick={onAddToBasket}
                        >
                            Add to basket
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Paper>
    );
}
