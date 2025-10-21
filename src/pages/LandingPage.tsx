import { useContext } from "react";
import SecurityContext from "../auth/SecurityContext";

export default function LandingPage() {
    const { login } = useContext(SecurityContext);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1 className="text-4xl font-bold mb-6">Keep Dishes Going 🍽️</h1>
            <p className="text-lg mb-8">Choose your role to continue</p>
            <div className="flex gap-4">
                <button
                    onClick={login}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                    Continue as Owner
                </button>

                <button
                    onClick={() => alert("Customer login not implemented yet")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                    Continue as Customer
                </button>


            </div>
        </div>
    );
}
