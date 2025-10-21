import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Box, Typography, MenuItem, Paper } from "@mui/material";
import { createRestaurant } from "../services/restaurantService";

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

export default function CreateRestaurantPage() {
    const { control, handleSubmit, reset } = useForm<CreateRestaurantForm>({
        defaultValues: {
            name: "",
            street: "",
            number: "",
            postalCode: "",
            city: "",
            country: "",
            contactEmail: "",
            pictureUrl: "",
            defaultPreparationTime: 15,
            typeOfCuisine: "",
            openingHours: "",
        },
    });

    const onSubmit = async (data: CreateRestaurantForm) => {
        try {
            await createRestaurant(data);
            alert("✅ Restaurant created successfully!");
            reset();
        } catch (error) {
            console.error("Error creating restaurant:", error);
            alert("❌ Failed to create restaurant");
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            sx={{ backgroundColor: "#f7f7f7" }}
        >
            <Paper elevation={3} sx={{ p: 4, width: "600px" }}>
                <Typography variant="h5" mb={2}>
                    Create Restaurant
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Restaurant Name" fullWidth margin="normal" required />
                        )}
                    />

                    <Typography variant="h6" mt={2}>
                        Address
                    </Typography>
                    <Controller
                        name="street"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Street" fullWidth margin="normal" required />
                        )}
                    />
                    <Controller
                        name="number"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Number" fullWidth margin="normal" required />
                        )}
                    />
                    <Controller
                        name="postalCode"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Postal Code" fullWidth margin="normal" required />
                        )}
                    />
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="City" fullWidth margin="normal" required />
                        )}
                    />
                    <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Country" fullWidth margin="normal" required />
                        )}
                    />

                    <Controller
                        name="contactEmail"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Contact Email" type="email" fullWidth margin="normal" required />
                        )}
                    />

                    <Controller
                        name="pictureUrl"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Picture URL" fullWidth margin="normal" required />
                        )}
                    />

                    <Controller
                        name="defaultPreparationTime"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Default Preparation Time (minutes)"
                                type="number"
                                fullWidth
                                margin="normal"
                                required
                            />
                        )}
                    />

                    <Controller
                        name="typeOfCuisine"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} select label="Type of Cuisine" fullWidth margin="normal" required>
                                <MenuItem value="Italian">Italian</MenuItem>
                                <MenuItem value="French">French</MenuItem>
                                <MenuItem value="Japanese">Japanese</MenuItem>
                                <MenuItem value="Mexican">Mexican</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        )}
                    />

                    <Controller
                        name="openingHours"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Opening Hours (e.g. Mon-Fri 9:00–21:00)" fullWidth margin="normal" />
                        )}
                    />

                    <Box mt={3}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Create Restaurant
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
