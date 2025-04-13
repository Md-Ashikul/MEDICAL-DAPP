import { ethers } from 'ethers';
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default async function handler(req, res) {
  const { patientId } = req.query;  // Get patientId from URL query
  const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // Local Hardhat network provider
  const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);

  try {
    console.log("Fetching documents for Patient ID:", patientId); // Log to ensure backend is triggered

    // Fetch the patient's wallet address from the contract
    const patient = await contract.patients(patientId);
    const patientWalletAddress = patient.wallet;

    if (!patientWalletAddress) {
      console.log("Patient not found in contract:", patientId); // Log if no patient found
      return res.status(404).json({ error: "Patient not found" });
    }

    console.log("Patient wallet address:", patientWalletAddress); // Log the wallet address

    // Get the list of all accounts from Hardhat (local network)
    const accounts = await provider.listAccounts();

    // Find the signer index by comparing the patient's wallet address with available Hardhat accounts
    const signerIndex = accounts.findIndex(account => account.toLowerCase() === patientWalletAddress.toLowerCase());

    if (signerIndex === -1) {
      console.log("Signer not found for patient's wallet address:", patientWalletAddress); // Log if no signer found
      return res.status(403).json({ error: "No matching signer found for the patient's wallet address" });
    }

    // Get the signer from Hardhat network
    const signer = await provider.getSigner(signerIndex);
    console.log("Signer address verified:", await signer.getAddress()); // Log the signer address

    // Initialize contract with the correct signer (this will make msg.sender the patient's wallet address)
    const contractWithSigner = new ethers.Contract(contractAddress, DoctorPatient.abi, signer);

    // Fetch the patient's documents
    const documents = await contractWithSigner.getPatientDocuments(patientId);

    if (documents.length === 0) {
      console.log("No documents found for patient:", patientId); // Log if no documents found
      return res.status(404).json({ error: "No documents found for this patient." });
    }

    res.status(200).json(documents);  // Send the documents back to the frontend

  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Error fetching documents", details: error.message });
  }
}
