import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import DishDraftEditorPage from "./pages/DishDraftEditorPage.tsx";
import OwnerDashboard from "./pages/OwnerDashboard";





function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginRegisterPage />} />
                <Route path="/create-restaurant" element={<CreateRestaurantPage />} />
                <Route path="/restaurant/:restaurantId/dishes/new" element={<DishDraftEditorPage />} />
                <Route path="/owner" element={<OwnerDashboard />}/>
            </Routes>
        </Router>
    );
}

export default App;
