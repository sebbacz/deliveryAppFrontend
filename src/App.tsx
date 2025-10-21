import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginRegisterPage />} />
                <Route path="/create-restaurant" element={<CreateRestaurantPage />} />
            </Routes>
        </Router>
    );
}

export default App;
