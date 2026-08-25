// Dish draft editor

import { Controller, useForm } from "react-hook-form";
import {
    Box, Button, Chip, Container, MenuItem, Paper, Stack,
    TextField, Typography, CircularProgress, Grid, Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createDishDraft, updateDishDraft, getOwnerDishes } from "../services/dishService";
import { upsertDish } from "../services/dishStore";
import { PageLayout } from "../components/common";

const DISH_TYPES = ["STARTER", "MAIN", "DESSERT"] as const;
const FOOD_TAG_OPTIONS = ["lactose", "gluten", "vegan", "vegetarian", "nuts", "shellfish"]; // predefined


type FormData = {
    name: string;
    type: string;
    description: string;
    price: number;
    pictureUrl: string;
};

export default function DishDraftEditorPage() {
    const { restaurantId, dishId } = useParams<{ restaurantId: string; dishId?: string }>();
    const navigate = useNavigate();
    const isEditMode = !!dishId; // true when a dishId URL param is present

    const [foodTags, setFoodTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");            // custom tag text field value
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, reset } = useForm<FormData>({
        defaultValues: { name: "", type: "MAIN", description: "", price: 0, pictureUrl: "" },
    });

    // Fetch owner dishes only in edit mode
    const { data: ownerDishes, isLoading } = useQuery({
        queryKey: ["ownerDishes", restaurantId],
        queryFn: () => getOwnerDishes(restaurantId!),
        enabled: isEditMode && !!restaurantId,
    });

    // Sync the fetched dish data
    useEffect(() => {
        if (!ownerDishes || !dishId) return;
        const dish = ownerDishes.find((d) => d.id === dishId);
        if (!dish) return;
        // Prefer pendingDraft
        const draft = dish.pendingDraft ?? dish;
        reset({
            name: draft.name,
            type: draft.type,
            description: draft.description,
            price: draft.price,
            pictureUrl: draft.pictureUrl,
        });
        setFoodTags(draft.foodTags ?? []);
    }, [ownerDishes, dishId, reset]);

    // Adds or removes a predefined food tag
    function toggleTag(tag: string) {
        setFoodTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    }

    // Adds a custom tag typed by the owner; trims and lowercases for consistency
    function addCustomTag() {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !foodTags.includes(trimmed)) setFoodTags((prev) => [...prev, trimmed]);
        setTagInput(""); // clear the input after adding
    }

    // Submit: create a new draft or update an existing one depending on edit mode
    const onSubmit = async (data: FormData) => {
        if (!restaurantId) return;
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                restaurantId,
                name: data.name,
                type: data.type,
                foodTags,
                description: data.description,
                price: Number(data.price), //   gives strings from number inputs
                pictureUrl: data.pictureUrl,
            };

            const result = isEditMode && dishId
                ? await updateDishDraft(dishId, payload)  // update existing draft
                : await createDishDraft(payload);         // create new draft

            upsertDish(restaurantId, result); // update the local localStorage cache to avoid a stale read
            navigate(`/restaurant/${restaurantId}/dishes`); // return to the dish list
        } catch {
            setError("Failed to save dish draft. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Show a loading  while the existing dish data
    if (isEditMode && isLoading) {
        return (
            <PageLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="sm">
                {/*  and subtitle change based on create vs edit mode */}
                <Box sx={{ mb: 4 }}>
                    <Button variant="text" onClick={() => navigate(`/restaurant/${restaurantId}/dishes`)} sx={{ mb: 1, pl: 0 }}>
                        ← Back to dishes
                    </Button>
                    <Typography variant="h5">{isEditMode ? "Edit dish draft" : "New dish draft"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isEditMode
                            ? "Changes will be saved as a pending draft and won't affect the live version until published."
                            : "Drafts are invisible to customers until published."}
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1.5px solid", borderColor: "divider" }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Dish details</Typography>

                        {/* Dish name  */}
                        <Controller name="name" control={control} rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <TextField {...field} label="Dish name" fullWidth required margin="normal"
                                    error={!!fieldState.error} helperText={fieldState.error ? "Required" : ""} />
                            )}
                        />

                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {/*  STARTER, MAIN, or DESSERT */}
                                <Controller name="type" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} select label="Type" fullWidth required margin="normal">
                                            {DISH_TYPES.map((t) => (
                                                <MenuItem key={t} value={t}>
                                                    {t.charAt(0) + t.slice(1).toLowerCase()} {/* e.g. "Starter" */}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                {/* Price — must be ≥ 0, step 0.01 for cents */}
                                <Controller name="price" control={control} rules={{ required: true, min: 0 }}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Price (€)" type="number" fullWidth required margin="normal"
                                            inputProps={{ step: "0.01", min: "0" }}
                                            error={!!fieldState.error} />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* Description */}
                        <Controller name="description" control={control} rules={{ required: true }}
                            render={({ field }) => (
                                <TextField {...field} label="Description" fullWidth required margin="normal" multiline rows={3} />
                            )}
                        />

                        {/* Picture URL   */}
                        <Controller name="pictureUrl" control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Picture URL" fullWidth margin="normal" placeholder="https://..." />
                            )}
                        />

                        <Divider sx={{ my: 3 }} />

                        {/* Food tags section */}
                        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Food tags</Typography>

                        {/* Predefined tags  */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                            {FOOD_TAG_OPTIONS.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    onClick={() => toggleTag(tag)}
                                    color={foodTags.includes(tag) ? "primary" : "default"} // filled = selected
                                    variant={foodTags.includes(tag) ? "filled" : "outlined"}
                                    sx={{ mb: 1, cursor: "pointer" }}
                                />
                            ))}
                        </Stack>

                        {/* Custom tag input   */}
                        <Stack direction="row" spacing={1}>
                            <TextField
                                size="small"
                                label="Custom tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                                sx={{ flex: 1 }}
                            />
                            <Button variant="outlined" onClick={addCustomTag}>Add</Button>
                        </Stack>

                        {/* Display custom   */}
                        {foodTags.filter((t) => !FOOD_TAG_OPTIONS.includes(t)).length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                                {foodTags.filter((t) => !FOOD_TAG_OPTIONS.includes(t)).map((tag) => (
                                    <Chip key={tag} label={tag} onDelete={() => setFoodTags((p) => p.filter((x) => x !== tag))} size="small" />
                                ))}
                            </Stack>
                        )}

                        {/* Backend error message */}
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>
                        )}

                        {/* Submit and cancel buttons */}
                        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                            <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                                {submitting ? <CircularProgress size={22} color="inherit" /> : isEditMode ? "Save changes" : "Save draft"}
                            </Button>
                            <Button variant="outlined" size="large" fullWidth
                                onClick={() => navigate(`/restaurant/${restaurantId}/dishes`)}>
                                Cancel
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </PageLayout>
    );
}
