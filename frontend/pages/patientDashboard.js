import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import DoctorPatient from "../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json"; // Contract ABI

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Your contract address

const PatientDashboard = () => {
  const router = useRouter();
  const { patientId } = router.query; // Get patientId from query parameters

  const [patientData, setPatientData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [accessStatus, setAccessStatus] = useState({});
  const [walletAddress, setWalletAddress] = useState(""); // To store the wallet address

  useEffect(() => {
    if (!patientId) return; // Return early if no patientId

    console.log("✅ useEffect triggered! Checking patientId:", patientId);

    // Fetch patient data from the backend (optional for more info)
    fetch(`/api/getPatientData?patientId=${patientId}`)
      .then((res) => res.json())
      .then((data) => setPatientData(data))
      .catch((err) => console.log("⚠️ Error fetching patient data:", err));

    // Fetch list of doctors from the backend
    fetch("/api/getDoctors")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Doctors Data:", data);
        setDoctors(data);
        fetchDoctorAccessStatus();
      })
      .catch((err) => console.error("⚠️ Error fetching doctors:", err));
  }, [patientId]);

  const fetchDoctorAccessStatus = async () => {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

    try {
      const doctorAccessList = await contract.getPatientDoctorAccess(patientId);
      const accessMap = {};
      doctorAccessList.forEach((doctorId) => {
        accessMap[doctorId] = "revoke"; // Patient has access to this doctor
      });

      setAccessStatus(accessMap);
    } catch (err) {
      console.error("Error fetching doctor access status:", err);
    }
  };

  // Handle access (grant/revoke) for doctors
  const handleAccess = async (doctorId, action) => {
    const apiEndpoint = action === "giveAccess" ? "/api/giveAccess" : "/api/revokeAccess";

    // Prevent duplicate requests (e.g., granting access when it's already granted)
    if (accessStatus[doctorId] === action) {
      console.log("⚠️ Access already granted or revoked. No action needed.");
      return;
    }

    // Sending the patient's wallet address to the backend along with the patientId and doctorId
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId,
        doctorId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      // Toggle the button state after a successful API call
      setAccessStatus((prev) => ({
        ...prev,
        [doctorId]: action === "giveAccess" ? "revoke" : "giveAccess", // Toggle between give and revoke
      }));
    } else {
      console.error(data.error); // If any error comes from the backend
    }
  };

  // Handle the redirection to the Get Documents page for the patient
  const handleGetDocuments = () => {
    // Route to Get Document page with patientId
    router.push(`/getDocument?patientId=${patientId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Render Patient Info if data exists */}
      {patientData ? (
        <>
          <h1 className="text-4xl font-bold mb-4">{patientData.name}</h1>
          <p className="text-lg mb-8">Patient ID: {patientData.id}</p>
        </>
      ) : (
        <p>Loading patient data...</p>
      )}

      {/* Button to get documents */}
      <button onClick={handleGetDocuments} className="mb-8 bg-blue-600 text-white px-4 py-2 rounded-lg">
        Get Documents
      </button>

      {/* Render Doctor List if data exists */}
      {doctors.length > 0 ? (
        <div className="space-y-4 w-full max-w-lg">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
              <span>{doctor.name}</span>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() =>
                  handleAccess(
                    doctor.id,
                    accessStatus[doctor.id] === "revoke" ? "revokeAccess" : "giveAccess"
                  )
                }
              >
                {accessStatus[doctor.id] === "revoke" ? "Revoke Access" : "Give Access"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No doctors available.</p>
      )}
    </div>
  );
};

export default PatientDashboard;
