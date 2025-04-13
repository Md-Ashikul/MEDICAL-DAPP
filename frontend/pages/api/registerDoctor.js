// pages/api/registerDoctor.js

import { ethers } from "ethers";
import DoctorData from "./doctorData"; // Import doctor data
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

      
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = DoctorPatient.abi ;

export default async function handler(req, res) {
  let { _id, _name, _wallet } = req.body;

  // Log the received data
  console.log("Received data:", { _id, _name, _wallet });

  // Ensure _id is a number for correct comparison
  _id = parseInt(_id, 10); // Convert _id to an integer

  // Check if the doctor data exists for the given ID
  if (!DoctorData[_id]) {
    console.log(`Doctor with ID ${_id} not found in doctorData`);
    return res.status(400).json({ error: `Doctor with ID ${_id} not found` });
  }

  // Validate doctor ID and name
  if (DoctorData[_id] !== _name) {
    console.log(`Mismatch: Expected name ${DoctorData[_id]}, but got ${_name}`);
    return res.status(400).json({ error: "Invalid doctor ID or name" });
  }

  // Connect to Ethereum provider
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const blockNumber = await provider.getBlockNumber();
  console.log("Latest block number:", blockNumber);
  
  // Create a wallet with a private key
  // Replace with your actual Hardhat private key
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // This is Hardhat's default first account private key
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Connect contract with wallet instead of signer
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  //console.log("ABI Type:", typeof contractABI);
  //console.log("ABI Data:", contractABI);
  console.log(contract.functions);

  try {
    // First, register doctor data (ID and name) to the validDoctors mapping
    const registerDataTx = await contract.registerDoctorData(_id, _name);
    await registerDataTx.wait(); // Wait for this transaction to be mined

    // Then, register the doctor in the smart contract
    const formattedWalletAddress = ethers.getAddress(_wallet); // Ensure the wallet address is correctly formatted
    const tx = await contract.registerDoctor(_name, _id, formattedWalletAddress);
    await tx.wait();  // Wait for transaction confirmation
    res.status(200).json({ message: "Doctor registered successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error registering doctor:", error);  // Log the error
    res.status(500).json({ error: "Error registering doctor", details: error.message });
  }
}