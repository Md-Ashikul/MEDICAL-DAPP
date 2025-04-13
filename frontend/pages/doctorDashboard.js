import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import DoctorPatient from "../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json";  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

const DoctorDashboard = () => {
  const router = useRouter();
  const { doctorId } = router.query;  // Get the doctorId from URL query

  const [doctorName, setDoctorName] = useState("");
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);  // To control the visibility of the modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);  // Store selected patient ID
  const [selectedAction, setSelectedAction] = useState("");  // Store selected action (upload or get)

  useEffect(() => {
    if (!doctorId) return; // If doctorId is not set, return early

    const fetchDoctorData = async () => {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

      // Fetch doctor's name and patients who have granted access
      try {
        const doctorDetails = await contract.doctors(doctorId);
        setDoctorName(doctorDetails.name);

        // Fetch the patients associated with the doctor
        const patientIds = await contract.getPatientsByDoctor(doctorId);
        console.log("Patients granted access:", patientIds);
        if (patientIds.length === 0) {
            console.log("No patients found for this doctor.");
        }

        // Map the BigNumbers to regular numbers if needed
        const normalizedIds = patientIds.map(id => Number(id));
        
        const patientDetails = await Promise.all(
          normalizedIds.map(async (patientId) => {
            const patient = await contract.patients(patientId);
            return {
              id: Number(patient.id),
              name: patient.name,
            };
          })
        );

        // Filter out duplicate patients
        const uniquePatients = patientDetails.filter(
          (value, index, self) =>
            index === self.findIndex((t) => (
              t.id === value.id
            ))
        );

        setPatients(uniquePatients);  // Set the unique patients list
      } catch (error) {
        console.error("Error fetching doctor or patient data:", error);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  const handlePatientClick = (patientId) => {
    // Set the selected patient ID and open the modal for choosing action
    setSelectedPatientId(patientId);
    setShowModal(true);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setShowModal(false);  // Close modal after action selection
    if (action === "upload") {
      // Redirect to upload document page with doctor and patient ID
      router.push(`/uploadDocument?patientId=${selectedPatientId}&doctorId=${doctorId}`);
    } else if (action === "get") {
      // Redirect to get document page with patient ID
      router.push(`/getDocument?patientId=${selectedPatientId}&doctorId=${doctorId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-sky-500 text-white p-6">
      <h1 className="text-5xl font-bold mb-4">{doctorName}'s Dashboard</h1>
      <h2 className="text-2xl mb-8">Doctor ID: {doctorId}</h2>

      <h3 className="text-xl mb-6">Patients Granted Access:</h3>
      {patients.length > 0 ? (
        <ul className="space-y-4 w-full max-w-lg">
          {patients.map((patient) => (
            <li key={patient.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
              <span className="text-gray-800">{patient.name} (ID: {patient.id})</span>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none"
                onClick={() => handlePatientClick(patient.id)}
              >
                View / Upload Records
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-200">No patients found.</p>
      )}

      {/* Modal for Upload or Get Document */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="text-2xl mb-4">Select Action</h3>
            <button
              onClick={() => handleActionSelect("upload")}
              className="mb-4 py-2 px-6 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 focus:outline-none"
            >
              Upload Document
            </button>
            <button
              onClick={() => handleActionSelect("get")}
              className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 focus:outline-none"
            >
              Get Document
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 py-2 px-6 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal Styling */}
      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }
        button {
          margin: 10px;
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
