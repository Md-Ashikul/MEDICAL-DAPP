import { ethers } from 'ethers';
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default async function handler(req, res) {
  const { patientId, doctorId } = req.query; // Get patientId and doctorId from URL query
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

  try {
    // Check if the doctor is authorized for this patient
    const isAuthorized = await contract.isDoctorAuthorized(patientId, doctorId);
    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized access: Doctor is not authorized to view this patient's documents." });
    }

    // Fetch documents for the patient if the doctor is authorized
    const documents = await contract.getPateintDocumentsByDoctor(patientId, doctorId);
    res.status(200).json(documents);

  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Error fetching documents", details: error.message });
  }
}
