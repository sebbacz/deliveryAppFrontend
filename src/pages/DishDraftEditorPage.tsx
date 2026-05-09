import { Controller, useForm } from "react-hook-form";
import {
    Box,
    Button,
    Chip,
    Container,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveDishDraft } from "../services/dishService";
import { upsertDish } from "../services/dishStore";

const DISH_TYPES = ["STARTER", "MAIN", "DESSERT"] as const;
const FOOD_TAG_OPTIONS = ["lactose", "gluten", "vegan", "vegetarian", "nuts", "shellfish"];

type FormData = {
    name: string;
    type: string;
    description: string;
    price: number;
    pictureUrl: string;
};

export default function DishDraftEditorPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const [foodTags, setFoodTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const { control, handleSubmit, reset } = useForm<FormData>({
        defaultValues: { name: "", type: "MAIN", description: "", price: 0, pictureUrl: "" },
    });

    function addTag(tag: string) {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !foodTags.includes(trimmed)) {
            setFoodTags((prev) => [...prev, trimmed]);
        }
        setTagInput("");
    }

    function removeTag(tag: string) {
        setFoodTags((prev) => prev.filter((t) => t !== tag));
    }

    const onSubmit = async (data: FormData) => {
        if (!restaurantId) return;
        try {
            const created = await saveDishDraft({
                restaurantId,
                name: data.name,
                type: data.type,
                foodTags,
                description: data.description,
                price: Number(data.price),
                pictureUrl: data.pictureUrl,
            });
            upsertDish(restaurantId, created);
            reset();
            setFoodTags([]);
            navigate(`/restaurant/${restaurantId}/dishes`);
        } catch {
            alert("Error saving dish draft");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" mb={3}>
                    New Dish Draft
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField {...field} label="Dish Name" fullWidth required margin="normal" />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField {...field} select label="Type" fullWidth required margin="normal">
                                {DISH_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                        {t.charAt(0) + t.slice(1).toLowerCase()}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField {...field} label="Description" fullWidth required margin="normal" multiline rows={2} />
                        )}
                    />

                    <Controller
                        name="price"
                        control={control}
                        rules={{ required: true, min: 0 }}
                        render={({ field }) => (
                            <TextField {...field} label="Price (€)" type="number" fullWidth required margin="normal"
                                inputProps={{ step: "0.01", min: "0" }} />
                        )}
                    />

                    <Controller
                        name="pictureUrl"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Picture URL" fullWidth margin="normal" />
                        )}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Food Tags
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                            {FOOD_TAG_OPTIONS.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    onClick={() => addTag(tag)}
                                    color={foodTags.includes(tag) ? "primary" : "default"}
                                    variant={foodTags.includes(tag) ? "filled" : "outlined"}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <TextField
                                size="small"
                                label="Custom tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTag(tagInput);
                                    }
                                }}
                            />
                            <Button variant="outlined" size="small" onClick={() => addTag(tagInput)}>
                                Add
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {foodTags.map((tag) => (
                                <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} size="small" sx={{ mb: 0.5 }} />
                            ))}
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button type="submit" variant="contained" fullWidth>
                            Save Draft
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate(`/restaurant/${restaurantId}/dishes`)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
