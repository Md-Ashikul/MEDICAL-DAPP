// /pages/api/getPatientData.js
import { ethers } from "ethers";
import DoctorPatient from "../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json";  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    try {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

      // Fetch patient data using the patientId
      const patient = await contract.patients(patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Fetch the doctorAccess array using the getPatientDoctorAccess function
      const doctorAccess = await contract.getPatientDoctorAccess(patientId); // Fetch the actual array

      // Convert BigInt values to regular numbers for serialization
      res.status(200).json({
        id: Number(patient.id),  // Convert BigInt to Number
        name: patient.name,
        wallet: patient.wallet,
        doctorAccess: doctorAccess.map((access) => Number(access)),  // Convert doctorAccess IDs to numbers
      });
    } catch (error) {
      console.error("Error fetching patient data:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
