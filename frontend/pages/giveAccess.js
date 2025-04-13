import { useState } from "react";

const GiveAccess = () => {
  const [patientId, setPatientId] = useState("");  // State for patient ID
  const [doctorId, setDoctorId] = useState("");  // State for doctor ID
  const [patientWalletAddress, setPatientWalletAddress] = useState(""); // State for patient's wallet address
  const [patientPrivateKey, setPatientPrivateKey] = useState(""); // State for patient's private key
  const [message, setMessage] = useState("");  // State for success or error message

  const handleGiveAccess = async (e) => {
    e.preventDefault();

    // Validate if the required fields are provided
    if (!patientWalletAddress || !patientPrivateKey) {
      setMessage("Patient wallet address and private key are required.");
      return;
    }

    // API call to give access to the doctor
    const response = await fetch("/api/giveAccess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId,
        doctorId,
        patientWalletAddress,
        patientPrivateKey,  // Passing the private key to sign the transaction
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(`Error: ${data.error}`);
      return;
    }

    setMessage(`Success: ${data.message}`);
  };

  return (
    <div>
      <h1>Give Access to Doctor</h1>
      <form onSubmit={handleGiveAccess}>
        <input
          type="number"
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}  // Track patient ID
        />
        <input
          type="number"
          placeholder="Doctor ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}  // Track doctor ID
        />
        <input
          type="text"
          placeholder="Patient Wallet Address"
          value={patientWalletAddress}
          onChange={(e) => setPatientWalletAddress(e.target.value)}  // Track patient's wallet address
        />
        <input
          type="password"
          placeholder="Patient Private Key"
          value={patientPrivateKey}
          onChange={(e) => setPatientPrivateKey(e.target.value)}  // Track patient's private key
        />
        <button type="submit">Give Access</button>
      </form>

      {message && <p>{message}</p>}  {/* Display success or error message */}
    </div>
  );
};

export default GiveAccess;
