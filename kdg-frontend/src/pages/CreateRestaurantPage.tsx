import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    MenuItem,
    Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";

import { createRestaurant } from "../api/restaurantApi";

type FormValues = {
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    email: string;
    pictures: string;
    cuisine: string;
    defaultPrepTime: number;
    openingHours: string;
};

export default function CreateRestaurantPage() {
    const { handleSubmit, control, reset } = useForm<FormValues>();

    const onSubmit = async (data: FormValues): Promise<void> => {
        console.log("Submitting:", data);
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
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Create Your Restaurant
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
                Fill in your restaurant details below to get started.
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
                <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "name"> }) => (
                        <TextField label="Restaurant Name" {...field} fullWidth required />
                    )}
                />

                <Stack direction="row" spacing={2}>
                    <Controller
                        name="street"
                        control={control}
                        defaultValue=""
                        render={({ field }: { field: ControllerRenderProps<FormValues, "street"> }) => (
                            <TextField label="Street" {...field} fullWidth required />
                        )}
                    />
                    <Controller
                        name="number"
                        control={control}
                        defaultValue=""
                        render={({ field }: { field: ControllerRenderProps<FormValues, "number"> }) => (
                            <TextField label="Number" {...field} fullWidth required />
                        )}
                    />
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Controller
                        name="postalCode"
                        control={control}
                        defaultValue=""
                        render={({ field }: { field: ControllerRenderProps<FormValues, "postalCode"> }) => (
                            <TextField label="Postal Code" {...field} fullWidth required />
                        )}
                    />
                    <Controller
                        name="city"
                        control={control}
                        defaultValue=""
                        render={({ field }: { field: ControllerRenderProps<FormValues, "city"> }) => (
                            <TextField label="City" {...field} fullWidth required />
                        )}
                    />
                </Stack>

                <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "country"> }) => (
                        <TextField label="Country" {...field} fullWidth required />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "email"> }) => (
                        <TextField label="Contact Email" type="email" {...field} fullWidth required />
                    )}
                />

                <Controller
                    name="pictures"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "pictures"> }) => (
                        <TextField label="Picture URL" {...field} fullWidth />
                    )}
                />

                <Controller
                    name="cuisine"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "cuisine"> }) => (
                        <TextField select label="Cuisine Type" {...field} fullWidth required>
                            {["Italian", "French", "Japanese", "Mexican", "American"].map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="defaultPrepTime"
                    control={control}
                    defaultValue={15}
                    render={({ field }: { field: ControllerRenderProps<FormValues, "defaultPrepTime"> }) => (
                        <TextField
                            label="Default Preparation Time (minutes)"
                            type="number"
                            {...field}
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="openingHours"
                    control={control}
                    defaultValue=""
                    render={({ field }: { field: ControllerRenderProps<FormValues, "openingHours"> }) => (
                        <TextField
                            label="Opening Hours (e.g. Mon-Fri 10:00–22:00)"
                            {...field}
                            fullWidth
                        />
                    )}
                />

                <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
                    Save Restaurant
                </Button>
            </Box>
        </Container>
    );
}
