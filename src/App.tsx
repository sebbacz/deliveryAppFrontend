// Root component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import DishDraftEditorPage from "./pages/DishDraftEditorPage";
import DishManagePage from "./pages/DishManagePage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OrdersPage from "./pages/OrdersPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import BasketPage from "./pages/BasketPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PriceRangeCriteriaPage from "./pages/PriceRangeCriteriaPage";
import { BasketProvider } from "./context/BasketContext"; // provides basket state to all pages
import { ProtectedRoute } from "./components/common"; // wraps owner routes to require auth

function App() {
    return (
        // BasketProvider
        <BasketProvider>
            <Router>
                <Routes>
                    {/*  Public   */}
                    <Route path="/" element={<LandingPage />} />                                          // role-selection landing page
                    <Route path="/login" element={<LoginRegisterPage />} />                               // Keycloak sign-in / register
                    <Route path="/restaurants" element={<RestaurantsPage />} />                           // browse all restaurants
                    <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />        // single restaurant menu
                    <Route path="/basket" element={<BasketPage />} />                                     // review basket before checkout
                    <Route path="/checkout" element={<CheckoutPage />} />                                 // delivery details + Stripe payment
                    <Route path="/order/:orderId/track" element={<OrderTrackingPage />} />                // live order status tracker

                    {/* Owner routes  */}
                    <Route path="/create-restaurant" element={<ProtectedRoute><CreateRestaurantPage /></ProtectedRoute>} />                              // first-time restaurant setup
                    <Route path="/owner" element={<ProtectedRoute><OwnerDashboardPage /></ProtectedRoute>} />                                               // owner home dashboard
                    <Route path="/restaurant/:restaurantId/dishes" element={<ProtectedRoute><DishManagePage /></ProtectedRoute>} />                      // manage all dishes
                    <Route path="/restaurant/:restaurantId/dishes/new" element={<ProtectedRoute><DishDraftEditorPage /></ProtectedRoute>} />             // create a new dish draft
                    <Route path="/restaurant/:restaurantId/dishes/:dishId/edit" element={<ProtectedRoute><DishDraftEditorPage /></ProtectedRoute>} />    // edit an existing dish draft
                    <Route path="/restaurant/:restaurantId/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />                          // accept / reject incoming orders
                    <Route path="/price-range/criteria" element={<ProtectedRoute><PriceRangeCriteriaPage /></ProtectedRoute>} />                        // adjust price range thresholds
                </Routes>
            </Router>
        </BasketProvider>
    );
}

export default App;
