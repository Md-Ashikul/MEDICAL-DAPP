// pages/api/registerPatient.js

import { ethers } from 'ethers';
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Replace with your deployed contract address

export default async function handler(req, res) {
    if (req.method === "POST"  || req.method === "GET") {
        const { name, wallet } = req.body;

        try {
            // Connect to Ethereum provider
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            const blockNumber = await provider.getBlockNumber();
            console.log("Current block number:", blockNumber);
            const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Your private key
            const walletSigner = new ethers.Wallet(privateKey, provider);
            
            // Initialize contract with proper initialization check
            const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, walletSigner);
            
            // Verify contract is properly deployed
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Contract not deployed');
            }

            // Register the patient
            const tx = await contract.registerPatient(name, wallet);
            await tx.wait();

            // Get the latest patientId with proper error handling
            try {
                const patientIdBN = await contract.patientIdCounter();
                const patientId = patientIdBN.toString();
                
                // Verify the value is valid
                if (!patientId || isNaN(parseInt(patientId))) {
                    throw new Error('Invalid patientId returned');
                }

                res.status(200).json({
                    message: "Patient registered successfully",
                    patientId,
                    txHash: tx.hash,
                });
            } catch (error) {
                console.error('Error getting patientId:', error);
                res.status(500).json({ 
                    error: "Error getting patientId", 
                    details: error.message 
                });
            }
        } catch (error) {
            console.error("Error registering patient:", error);
            res.status(500).json({ 
                error: "Error registering patient", 
                details: error.message 
            });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
