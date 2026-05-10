import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import DishDraftEditorPage from "./pages/DishDraftEditorPage";
import DishManagePage from "./pages/DishManagePage";
import OwnerDashboard from "./pages/OwnerDashboard";
import OrdersPage from "./pages/OrdersPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginRegisterPage />} />
                <Route path="/create-restaurant" element={<CreateRestaurantPage />} />
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/restaurant/:restaurantId/dishes" element={<DishManagePage />} />
                <Route path="/restaurant/:restaurantId/dishes/new" element={<DishDraftEditorPage />} />
                <Route path="/restaurant/:restaurantId/orders" element={<OrdersPage />} />
            </Routes>
        </Router>
    );
}

export default App;
