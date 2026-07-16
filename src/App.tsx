import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import DishDraftEditorPage from "./pages/DishDraftEditorPage";
import DishManagePage from "./pages/DishManagePage";
import OwnerDashboard from "./pages/OwnerDashboard";
import OrdersPage from "./pages/OrdersPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import BasketPage from "./pages/BasketPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PriceRangeCriteriaPage from "./pages/PriceRangeCriteriaPage";
import { BasketProvider } from "./context/BasketContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BasketProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginRegisterPage />} />
                    <Route path="/restaurants" element={<RestaurantsPage />} />
                    <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
                    <Route path="/basket" element={<BasketPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order/:orderId/track" element={<OrderTrackingPage />} />

                    <Route path="/create-restaurant" element={<ProtectedRoute><CreateRestaurantPage /></ProtectedRoute>} />
                    <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
                    <Route path="/restaurant/:restaurantId/dishes" element={<ProtectedRoute><DishManagePage /></ProtectedRoute>} />
                    <Route path="/restaurant/:restaurantId/dishes/new" element={<ProtectedRoute><DishDraftEditorPage /></ProtectedRoute>} />
                    <Route path="/restaurant/:restaurantId/dishes/:dishId/edit" element={<ProtectedRoute><DishDraftEditorPage /></ProtectedRoute>} />
                    <Route path="/restaurant/:restaurantId/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/price-range/criteria" element={<ProtectedRoute><PriceRangeCriteriaPage /></ProtectedRoute>} />
                </Routes>
            </Router>
        </BasketProvider>
    );
}

export default App;
