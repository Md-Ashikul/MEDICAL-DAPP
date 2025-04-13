import { ethers } from "ethers";
import DoctorPatient from "../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address
const provider = new ethers.JsonRpcProvider("http://localhost:8545");  // Hardhat local network

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { patientId, doctorId } = req.body;

        try {
            // Fetch all accounts from Hardhat
            const accounts = await provider.listAccounts();  // This returns an array of signer addresses

            // Fetch the patient's wallet address from the contract
            const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);
            const patient = await contract.patients(patientId);
            const patientWalletAddress = patient.wallet;

            if (!patientWalletAddress) {
                return res.status(404).json({ error: "Patient not found" });
            }

            // Find the index of the matching patient wallet address in Hardhat accounts
            const signerIndex = accounts.findIndex(account => account.address.toLowerCase() === patientWalletAddress.toLowerCase());
            if (signerIndex === -1) {
                return res.status(403).json({ error: "No matching signer found for the patient's wallet address" });
            }

            // Get the signer from the Hardhat network
            const signer = await provider.getSigner(signerIndex);

            // Initialize contract with the correct signer
            const contractWithSigner = new ethers.Contract(contractAddress, DoctorPatient.abi, signer);

            // Call the giveAccess function
            let tx = await contractWithSigner.revokeAccess(patientId, doctorId);
            await tx.wait();  // Wait for the transaction to be confirmed

            res.status(200).json({ success: true, message: "Access revoked successfully" });

        } catch (error) {
            console.error("Error granting access:", error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
