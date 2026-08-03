import { useForm, Controller } from "react-hook-form";
import {
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
    MenuItem,
    Paper,
    Container,
    Grid,
    Divider,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState, useRef } from "react";
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
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
};

const CUISINE_OPTIONS = ["Belgian", "French", "Italian", "Japanese", "Mexican", "Indian", "Greek", "American", "Thai", "Other"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DaySchedule = { open: boolean; from: string; to: string };
type WeeklySchedule = Record<string, DaySchedule>;

const DEFAULT_SCHEDULE: WeeklySchedule = Object.fromEntries(
    DAYS.map((d) => [d, { open: d !== "Sun", from: "09:00", to: "22:00" }])
);

function serializeSchedule(schedule: WeeklySchedule): string {
    return DAYS.map((d) =>
        schedule[d].open ? `${d} ${schedule[d].from}–${schedule[d].to}` : `${d} closed`
    ).join(", ");
}

export default function CreateRestaurantPage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
    const [pictureUrls, setPictureUrls] = useState<string[]>([""]);
    const pictureUrlsRef = useRef(pictureUrls);

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

    const { control, handleSubmit, setValue } = useForm<CreateRestaurantForm>({
        defaultValues: {
            name: "",
            street: "",
            number: "",
            postalCode: "",
            city: "",
            country: "Belgium",
            contactEmail: "",
            defaultPreparationTime: 15,
            typeOfCuisine: "",
            openingHours: serializeSchedule(DEFAULT_SCHEDULE),
        },
    });

    const updateDay = (day: string, patch: Partial<DaySchedule>) => {
        setSchedule((prev) => {
            const updated = { ...prev, [day]: { ...prev[day], ...patch } };
            setValue("openingHours", serializeSchedule(updated));
            return updated;
        });
    };

    const onSubmit = async (data: CreateRestaurantForm) => {
        setSubmitting(true);
        setError(null);
        try {
            await createRestaurant({
                ...data,
                pictureUrls: pictureUrlsRef.current.filter((u) => u.trim() !== ""),
            });
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
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Picture URL(s)
                            </Typography>
                            <Stack spacing={1}>
                                {pictureUrls.map((url, i) => (
                                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            value={url}
                                            onChange={(e) => {
                                                const updated = [...pictureUrls];
                                                updated[i] = e.target.value;
                                                setPictureUrls(updated);
                                                pictureUrlsRef.current = updated;
                                            }}
                                            label={`Picture URL${pictureUrls.length > 1 ? ` ${i + 1}` : ""}`}
                                            fullWidth
                                            placeholder="https://..."
                                        />
                                        {pictureUrls.length > 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const updated = pictureUrls.filter((_, j) => j !== i);
                                                    setPictureUrls(updated);
                                                    pictureUrlsRef.current = updated;
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                ))}
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        const updated = [...pictureUrls, ""];
                                        setPictureUrls(updated);
                                        pictureUrlsRef.current = updated;
                                    }}
                                    sx={{ alignSelf: "flex-start" }}
                                >
                                    Add another picture
                                </Button>
                            </Stack>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Opening hours */}
                        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Opening hours</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Set the weekly schedule for your restaurant.
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                                {DAYS.map((day) => (
                                    <Stack key={day} direction="row" alignItems="center" spacing={2}>
                                        <FormControlLabel
                                            sx={{ minWidth: 72, m: 0 }}
                                            control={
                                                <Checkbox
                                                    checked={schedule[day].open}
                                                    onChange={(e) => updateDay(day, { open: e.target.checked })}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{day}</Typography>}
                                        />
                                        {schedule[day].open ? (
                                            <>
                                                <TextField
                                                    type="time"
                                                    size="small"
                                                    value={schedule[day].from}
                                                    onChange={(e) => updateDay(day, { from: e.target.value })}
                                                    inputProps={{ step: 300 }}
                                                    sx={{ width: 130 }}
                                                />
                                                <Typography variant="body2" color="text.secondary">to</Typography>
                                                <TextField
                                                    type="time"
                                                    size="small"
                                                    value={schedule[day].to}
                                                    onChange={(e) => updateDay(day, { to: e.target.value })}
                                                    inputProps={{ step: 300 }}
                                                    sx={{ width: 130 }}
                                                />
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.disabled">Closed</Typography>
                                        )}
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                        {/* Hidden field keeps the serialized value in the form */}
                        <Controller name="openingHours" control={control} render={() => <></>} />

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
