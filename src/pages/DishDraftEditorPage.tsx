import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { saveDishDraft } from "../services/dishService";
import { useNavigate, useParams } from "react-router-dom";

type FormData = {
    name: string;
    description: string;
    price: number;
};

export default function DishDraftEditorPage() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, reset } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            await saveDishDraft({
                ...data,
                restaurantId,
            });
            alert("✅ Draft saved!");
            reset();
            navigate(`/restaurant/${restaurantId}/dishes`);
        } catch (e) {
            alert("❌ Error saving draft");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Typography variant="h5">Create Dish Draft</Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField {...register("name")} label="Dish Name" fullWidth required margin="normal" />
                    <TextField
                        {...register("description")}
                        label="Description"
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        {...register("price")}
                        label="Price"
                        type="number"
                        fullWidth
                        required
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Save Draft
                    </Button>
                </form>
            </Box>
        </Container>
    );
}
