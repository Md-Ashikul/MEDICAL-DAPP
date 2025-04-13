import { ethers } from "ethers";
import DoctorPatient from "../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json"; // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your contract address

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      console.log("Connecting to provider...");
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

      console.log("Fetching doctor count...");
      const doctorCount = await contract.doctorIdCounter();
      console.log("Total Doctors:", doctorCount.toString());

      const doctors = [];

      for (let i = 1; i <= doctorCount; i++) {
        console.log(`Fetching doctor with ID: ${i}`);
        const doctor = await contract.doctors(i);

        console.log(`Doctor ${i}:`, doctor);
        
        // ✅ Convert BigInt to Number instead of String
        doctors.push({
          id: Number(doctor[0]),  // Convert BigInt to number
          name: doctor[1],
          wallet: doctor[2],
        });
      }

      console.log("Final Doctors List:", doctors);
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
