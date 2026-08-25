//  page for managing price range criteria (event-sourced thresholds).
// Each saved entry creates a new criteria event; the most recent one determines the current € / €€ / €€€ / €€€€ classification.
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Container,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Divider,
} from "@mui/material";
import { PageLayout } from "../components/common";
import { getCriteriaEvents, addCriteriaEvent } from "../services/priceRangeService";


type CriteriaForm = {
    effectiveAt: string;
    cheapMax: number;
    regularMax: number;
    expensiveMax: number;
};

export default function PriceRangeCriteriaPage() {
    const queryClient = useQueryClient();

    // Fetch all past criteria events for the history table
    const { data: events, isLoading } = useQuery({
        queryKey: ["criteriaEvents"],
        queryFn: getCriteriaEvents,
    });

    //  a new criteria event and resets the form on success
    const mutation = useMutation({
        mutationFn: addCriteriaEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["criteriaEvents"] }); // refresh history table
            reset(); // clear the form so the owner can add another entry easily
        },
    });

    //  sensible defaults: "now" for effective date
    const { control, handleSubmit, reset } = useForm<CriteriaForm>({
        defaultValues: {
            effectiveAt: new Date().toISOString().slice(0, 16), // "YYYY-MM-DDTHH:MM"
            cheapMax: 10,
            regularMax: 30,
            expensiveMax: 60,
        },
    });


    // Append ":00" because datetime-local gives "YYYY-MM-DDTHH:MM" but the backend expects seconds
    const onSubmit = (data: CriteriaForm) => {
        mutation.mutate({
            effectiveAt: data.effectiveAt + ":00",
            cheapMax: Number(data.cheapMax),
            regularMax: Number(data.regularMax),
            expensiveMax: Number(data.expensiveMax),
        });
    };

    return (
        <PageLayout>
            <Container maxWidth="md">
                {/* Page header  */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Price Range Criteria</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Adjust criteria price ranges (€, €€, €€€, €€€€).
                        Each entry takes effect from the specified date and affects how price range history is displayed.
                    </Typography>
                </Box>

                {/* Add new criteria form  */}
                <Paper elevation={0} sx={{ p: 3, mb: 4, border: "1.5px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Add new criteria</Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Effective-from datetime  */}
                            <Controller
                                name="effectiveAt"
                                control={control}
                                rules={{ required: true }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Effective from"
                                        type="datetime-local"
                                        fullWidth
                                        required
                                        error={!!fieldState.error}
                                        InputLabelProps={{ shrink: true }} //  prevents label overlap with the date value
                                    />
                                )}
                            />

                            {/*  fields side by side: cheapMax, regularMax, expensiveMax */}
                            <Box sx={{ display: "flex", gap: 2 }}>
                                {/* cheapMax: avg price ≤ this → restaurant shows as € */}
                                <Controller
                                    name="cheapMax"
                                    control={control}
                                    rules={{ required: true, min: 1 }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="€ max (cheap)"
                                            type="number"
                                            fullWidth
                                            required
                                            error={!!fieldState.error}
                                            inputProps={{ min: 1, step: 0.5 }}
                                            helperText="Average price ≤ this → €"
                                        />
                                    )}
                                />
                                {/*  avg price between cheapMax and this → €€ */}
                                <Controller
                                    name="regularMax"
                                    control={control}
                                    rules={{ required: true, min: 1 }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="€€ max (regular)"
                                            type="number"
                                            fullWidth
                                            required
                                            error={!!fieldState.error}
                                            inputProps={{ min: 1, step: 0.5 }}
                                            helperText="Average price ≤ this → €€"
                                        />
                                    )}
                                />
                                {/*   avg price between regularMax and this → €€€, above → €€€€ */}
                                <Controller
                                    name="expensiveMax"
                                    control={control}
                                    rules={{ required: true, min: 1 }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="€€€ max (expensive)"
                                            type="number"
                                            fullWidth
                                            required
                                            error={!!fieldState.error}
                                            inputProps={{ min: 1, step: 0.5 }}
                                            helperText="Average price ≤ this → €€€, else €€€€"
                                        />
                                    )}
                                />
                            </Box>

                            {/* Backend error or success feedback */}
                            {mutation.isError && (
                                <Alert severity="error">Failed to save criteria. Please try again.</Alert>
                            )}
                            {mutation.isSuccess && (
                                <Alert severity="success">New criteria added successfully.</Alert>
                            )}

                            {/* Submit button   */}
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={mutation.isPending}
                                sx={{ alignSelf: "flex-start" }}
                            >
                                {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Save criteria"}
                            </Button>
                        </Box>
                    </form>
                </Paper>

                <Divider sx={{ mb: 4 }} />

                {/* Criteria history table  */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Criteria history</Typography>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : events && events.length > 0 ? (
                    <Paper elevation={0} sx={{ border: "1.5px solid", borderColor: "divider" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Effective from</TableCell>
                                    <TableCell align="right">€ max</TableCell>
                                    <TableCell align="right">€€ max</TableCell>
                                    <TableCell align="right">€€€ max</TableCell>
                                    <TableCell align="right">€€€€</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/*   recent event appears at the top */}
                                {[...events].reverse().map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            {new Date(e.effectiveAt).toLocaleString()} {/* format with  */}
                                        </TableCell>
                                        <TableCell align="right">≤ €{e.cheapMax}</TableCell>
                                        <TableCell align="right">≤ €{e.regularMax}</TableCell>
                                        <TableCell align="right">≤ €{e.expensiveMax}</TableCell>
                                        <TableCell align="right">&gt; €{e.expensiveMax}</TableCell> {/* open */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">No criteria events found.</Typography>
                )}
            </Container>
        </PageLayout>
    );
}
