import { ethers } from 'ethers';
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

const contractABI = DoctorPatient.abi;
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Contract address

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { patientId, docIndex, doctorPrivateKey } = req.body;

    try {
      // Connect to Ethereum provider
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const walletSigner = new ethers.Wallet(doctorPrivateKey, provider);  // Use the doctor's private key
      const contract = new ethers.Contract(contractAddress, contractABI, walletSigner);

      // Delete the document
      const tx = await contract.deleteDocument(patientId, docIndex);
      await tx.wait();  // Wait for the transaction to be mined

      res.status(200).json({ message: "Document deleted successfully", txHash: tx.hash });
    } catch (error) {
      res.status(500).json({ error: "Error deleting document", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
