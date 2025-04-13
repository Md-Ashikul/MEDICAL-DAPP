import { useState } from "react";
import { useRouter } from "next/router"; // Use Next.js router for navigation

const Admin = () => {
  const [message, setMessage] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [wallet, setWallet] = useState("");
  const [patientId, setPatientId] = useState(null); // Store patient ID
  const router = useRouter();

  // Register Doctor function (calls the backend API to store in smart contract)
  const handleRegisterDoctor = async () => {
    const response = await fetch("/api/registerDoctor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: doctorId,
        _name: doctorName,
        _wallet: wallet,
      }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  // Register Patient function (calls the backend API to store in smart contract)
  const handleRegisterPatient = async () => {
    const response = await fetch("/api/registerPatient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: patientName,
        wallet: wallet,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(`Patient Registered Successfully!`);
      setPatientId(data.patientId); // Set the patient ID returned from backend
    } else {
      setMessage(`Error: ${data.error}`); // Show error message if any
    }
  };

  // Back to home page
  const goHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Heading and sub-heading */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-sky-500 mb-4">Admin - Register</h1>
        <p className="text-lg text-gray-700">Register Doctor or Patient</p>
      </div>

      {/* Doctor Registration */}
      <div className="w-full max-w-md mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-navy-700 mb-4">Register Doctor</h2>
        <div className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg"
            type="number"
            placeholder="Doctor ID"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg"
            type="text"
            placeholder="Doctor Name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg"
            type="text"
            placeholder="Wallet Address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            onClick={handleRegisterDoctor}
            className="w-full py-3 mt-4 text-white bg-sky-500 rounded-lg hover:bg-sky-600 focus:outline-none"
          >
            Register Doctor
          </button>
        </div>
      </div>

      {/* Patient Registration */}
      <div className="w-full max-w-md mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-green-500 mb-4">Register Patient</h2>
        <div className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg"
            type="text"
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg"
            type="text"
            placeholder="Wallet Address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            onClick={handleRegisterPatient}
            className="w-full py-3 mt-4 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none"
          >
            Register Patient
          </button>
        </div>
      </div>

      {/* Display success or error message */}
      {message && <p className="text-lg text-red-500">{message}</p>}

      {/* Display Patient ID after successful registration */}
      {patientId && (
        <div className="mt-6 p-4 bg-gray-200 rounded-lg">
          <p className="text-lg font-semibold text-green-500">Patient ID: {patientId}</p>
          <p className="text-lg">Patient Name: {patientName}</p>
        </div>
      )}

      {/* Back to Home button */}
      <button
        onClick={goHome}
        className="mt-12 py-3 px-6 text-white bg-violet-700 rounded-lg hover:bg-violet-800 focus:outline-none"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Admin;
