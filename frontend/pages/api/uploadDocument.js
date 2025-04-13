import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import DoctorPatient from '../../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json';  // Contract ABI

// Connect to IPFS with explicit error handling
const connectToIPFS = () => {
  try {
    // Connect to local IPFS node
    return create({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    });
  } catch (error) {
    console.error('IPFS connection error:', error);
    throw new Error('Failed to connect to IPFS node');
  }
};

const contractABI = DoctorPatient.abi;
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default async function handler(req, res) {
  const { patientId, doctorId, diseaseName, description, imageFile } = req.body;

  try {
    // Step 1: Connect to IPFS
    const ipfsClient = connectToIPFS();
    console.log("Connected to IPFS node");

    // Step 2: Upload image to IPFS
    const imageBuffer = Buffer.from(imageFile, 'base64');
    console.log("Image buffer created, size:", imageBuffer.length);

    // Attempt to upload to IPFS
    const imageResult = await ipfsClient.add(imageBuffer, {
      progress: (prog) => console.log(`Upload progress: ${prog}`)
    });

    if (!imageResult || !imageResult.path) {
      throw new Error("IPFS upload failed to return a valid CID");
    }

    console.log("IPFS Image CID:", imageResult.path);
    const imageCID = imageResult.path;

    // Step 3: Connect to Ethereum provider
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");  // Local Hardhat node
    console.log("Connected to Ethereum provider");

    // Step 4: Fetch the Doctor's Address from the contract using Doctor ID
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const doctor = await contract.doctors(doctorId);  // Fetch doctor details from the contract
    const doctorWalletAddress = doctor.wallet;

    if (!doctorWalletAddress) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Step 5: Find the signer corresponding to the doctor's wallet address
    const accounts = await provider.listAccounts();  // Get available accounts from the local Hardhat node
    const signerIndex = accounts.findIndex(account => account.address.toLowerCase() === doctorWalletAddress.toLowerCase());

    if (signerIndex === -1) {
      return res.status(403).json({ error: "No matching signer found for the doctor's wallet address" });
    }

    const signer = await provider.getSigner(signerIndex);  // Get signer from Hardhat network

    // Step 6: Create contract instance with the signer
    const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Contract instance created with signer");

    // Step 7: Call the uploadDocument function to store data in the smart contract
    console.log("Sending transaction to store document data...");
    const tx = await contractWithSigner.uploadDocument(patientId, doctorId, imageCID, diseaseName, description, imageCID);
    console.log("Transaction sent, hash:", tx.hash);

    await tx.wait();  // Wait for the transaction to be mined
    console.log("Transaction confirmed");

    // Return success response with transaction details
    res.status(200).json({
      message: "Document uploaded successfully",
      txHash: tx.hash,
      imageCID: imageCID
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      error: "Error uploading document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
