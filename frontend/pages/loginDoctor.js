import { useState } from "react";
import { useRouter } from "next/router"; // Use Next.js router for navigation

const LoginDoctor = () => {
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Fetch request to the backend to check the doctor credentials
    const response = await fetch("/api/validateDoctor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorId,
        doctorName,
      }),
    });

    const data = await response.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage(data.message); // Success message
      router.push({
        pathname: "/doctorDashboard",
        query: { doctorId, doctorName },
      }); // Redirect to doctor dashboard
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-teal-600 mb-4">Doctor Login</h1>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
        <div className="space-y-6">
          {/* Doctor Name Input */}
          <input
            type="text"
            placeholder="Doctor Name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="w-full p-3 bg-sky-100 text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Doctor ID Input */}
          <input
            type="number"
            placeholder="Doctor ID"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-3 bg-sky-100 text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 mt-4 text-white bg-teal-600 rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* Display Message */}
      {message && (
        <p
          className={`mt-4 text-lg ${
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginDoctor;
