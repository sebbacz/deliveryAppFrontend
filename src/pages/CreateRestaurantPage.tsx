import { useForm, Controller } from "react-hook-form";
import {
    TextField,
    Button,
    Box,
    Typography,
    MenuItem,
    Paper,
    Container,
    Grid,
    Divider,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createRestaurant, getMyRestaurant } from "../services/restaurantService";
import PageLayout from "../components/PageLayout";

type CreateRestaurantForm = {
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrl: string;
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
};

const CUISINE_OPTIONS = ["Belgian", "French", "Italian", "Japanese", "Mexican", "Indian", "Greek", "American", "Thai", "Other"];

export default function CreateRestaurantPage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: existingRestaurant, isLoading: checkingRestaurant } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        retry: false,
    });

    useEffect(() => {
        if (!checkingRestaurant && existingRestaurant) {
            navigate("/owner");
        }
    }, [existingRestaurant, checkingRestaurant, navigate]);

    const { control, handleSubmit } = useForm<CreateRestaurantForm>({
        defaultValues: {
            name: "",
            street: "",
            number: "",
            postalCode: "",
            city: "",
            country: "Belgium",
            contactEmail: "",
            pictureUrl: "",
            defaultPreparationTime: 15,
            typeOfCuisine: "",
            openingHours: "",
        },
    });

    const onSubmit = async (data: CreateRestaurantForm) => {
        setSubmitting(true);
        setError(null);
        try {
            await createRestaurant(data);
            navigate("/owner");
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError("You already have a restaurant. Each owner can manage exactly one restaurant.");
            } else {
                setError("Could not create restaurant. Please check your connection and try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingRestaurant) {
        return (
            <PageLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="sm">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Set up your restaurant</Typography>
                    <Typography color="text.secondary" variant="body2">
                        Fill in your restaurant details. You can manage everything else from the dashboard after creation.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1.5px solid", borderColor: "divider" }}>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Basic info */}
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Basic info</Typography>
                        <Controller name="name" control={control} rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <TextField {...field} label="Restaurant name" fullWidth required margin="normal"
                                    error={!!fieldState.error} helperText={fieldState.error ? "Required" : ""} />
                            )}
                        />
                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="typeOfCuisine" control={control} rules={{ required: true }}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} select label="Cuisine type" fullWidth required margin="normal"
                                            error={!!fieldState.error}>
                                            {CUISINE_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller name="defaultPreparationTime" control={control} rules={{ required: true, min: 1 }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Prep time (min)" type="number" fullWidth required margin="normal"
                                            inputProps={{ min: 1 }} />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Controller name="contactEmail" control={control} rules={{ required: true }}
                            render={({ field }) => (
                                <TextField {...field} label="Contact email" type="email" fullWidth required margin="normal" />
                            )}
                        />
                        <Controller name="pictureUrl" control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Picture URL" fullWidth margin="normal" placeholder="https://..." />
                            )}
                        />
                        <Controller name="openingHours" control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Opening hours" fullWidth margin="normal" placeholder="Mon–Fri 11:00–22:00" />
                            )}
                        />

                        <Divider sx={{ my: 3 }} />

                        {/* Address */}
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Address</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 9 }}>
                                <Controller name="street" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Street" fullWidth required />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Controller name="number" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} label="No." fullWidth required />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Controller name="postalCode" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Postal code" fullWidth required />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 8 }}>
                                <Controller name="city" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} label="City" fullWidth required />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller name="country" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Country" fullWidth required />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={submitting}
                            sx={{ mt: 4 }}
                        >
                            {submitting ? <CircularProgress size={22} color="inherit" /> : "Create restaurant"}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </PageLayout>
    );
}
