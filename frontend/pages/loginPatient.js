import { useState } from "react";
import { useRouter } from "next/router"; // Use Next.js router for navigation

const LoginPatient = () => {
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Fetch request to the backend to check the patient credentials
    const response = await fetch("/api/validatePatient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId,
        patientName,
      }),
    });

    const data = await response.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage(data.message); // Success message
      router.push({
        pathname: "/patientDashboard",
        query: { patientId, patientName },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-teal-600 mb-4">Patient Login</h1>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-6">
          {/* Patient Name Input */}
          <input
            type="text"
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          {/* Patient ID Input */}
          <input
            type="number"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 mt-4 text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* Display Message */}
      {message && (
        <p
          className={`mt-6 text-lg ${
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginPatient;
