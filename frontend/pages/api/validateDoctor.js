import { ethers } from "ethers";
import DoctorPatient from "../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json";  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { doctorId, doctorName } = req.body;

    try {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

      // Fetch doctor data from the contract
      const doctor = await contract.doctors(doctorId);  // Assuming this returns a name and address

      if (doctor && doctor.name === doctorName) {
        res.status(200).json({ message: "Login Successful" });
      } else {
        res.status(400).json({ error: "Invalid Doctor ID or Name" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching doctor data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
