import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import DoctorPatient from "../../artifacts/contracts/DoctorPatient.sol/DoctorPatient.json";  // Contract ABI

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Your contract address

export default function GetDocuments() {
  const router = useRouter();
  const { patientId, doctorId } = router.query; // Get patientId and doctorId from URL query

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDoctor, setIsDoctor] = useState(false); // To track if the user is a doctor

  useEffect(() => {
    if (!patientId) return; // If no patientId, return early

    const fetchDocuments = async () => {
      try {
        let documentsData = [];
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        
        if (doctorId) {
          // This is a doctor accessing patient documents
          setIsDoctor(true); // Set flag to enable delete button
          
          // Fetch documents for the doctor using both patientId and doctorId
          const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);
          documentsData = await contract.getPateintDocumentsByDoctor(patientId, doctorId);
        } else {
          // This is a patient accessing their own documents
          setIsDoctor(false); // Patients can't delete documents
          
          // Fetch documents for the patient using only patientId
          const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);
          
          // Get the patient's wallet address from the contract
          const patient = await contract.patients(patientId);
          const patientWalletAddress = patient.wallet;
          
          // Get all accounts from the provider
          const accounts = await provider.listAccounts();
          
          // Find the index of the account that matches the patient's wallet
          const signerIndex = accounts.findIndex(
            account => account.address.toLowerCase() === patientWalletAddress.toLowerCase()
          );
          
          if (signerIndex === -1) {
            throw new Error("No matching signer found for patient wallet");
          }
          
          // Get the signer
          const signer = await provider.getSigner(signerIndex);
          
          // Create a contract instance with the correct signer
          const contractWithSigner = new ethers.Contract(
            contractAddress, 
            DoctorPatient.abi, 
            signer
          );
          
          // Fetch documents with the proper signer
          documentsData = await contractWithSigner.getPatientDocuments(patientId);
        }

        setDocuments(documentsData);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("An error occurred while fetching the documents: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [patientId, doctorId]);

  const handleDeleteDocument = async (docIndex) => {
    if (!isDoctor || !doctorId) {
      setError("Only doctors can delete documents");
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      
      // Get the doctor's wallet address from the contract
      const contract = new ethers.Contract(contractAddress, DoctorPatient.abi, provider);
      const doctor = await contract.doctors(doctorId);
      const doctorWalletAddress = doctor.wallet;
      
      // Get all accounts from the provider
      const accounts = await provider.listAccounts();
      
      // Find the index of the account that matches the doctor's wallet
      const signerIndex = accounts.findIndex(
        account => account.address.toLowerCase() === doctorWalletAddress.toLowerCase()
      );
      
      if (signerIndex === -1) {
        throw new Error("No matching signer found for doctor wallet");
      }
      
      // Get the doctor signer
      const signer = await provider.getSigner(signerIndex);
      
      // Create a contract instance with the doctor's signer
      const contractWithSigner = new ethers.Contract(
        contractAddress, 
        DoctorPatient.abi, 
        signer
      );

      // Call the contract function to delete the document
      const tx = await contractWithSigner.deleteDocument(patientId, docIndex);
      await tx.wait(); // Wait for the transaction to be mined

      console.log("Document deleted successfully");
      
      // After deletion, remove the document from the local state
      setDocuments((prevDocuments) => prevDocuments.filter((_, index) => index !== docIndex));
    } catch (error) {
      console.error("Error deleting document:", error);
      setError("An error occurred while deleting the document: " + error.message);
    }
  };

  if (loading) return <div className="text-center text-xl text-gray-700">Loading documents...</div>;
  if (error) return <div className="text-center text-xl text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-green-100 p-6">
      <h1 className="text-4xl font-bold text-teal-600 mb-6">Documents for Patient {patientId}</h1>
      
      {documents.length > 0 ? (
        <ul className="w-full max-w-lg space-y-4">
          {documents.map((doc, index) => (
            <li key={index} className="flex flex-col items-center justify-between bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-teal-600">{doc.diseaseName}</h3>
              <p className="text-gray-700 mb-4">{doc.description}</p>
              <img 
              src={`http://localhost:8080/ipfs/${doc.imageCID}`} 
              alt="Document Image" 
              className="mb-4 w-full max-w-xs rounded-lg"
              />
              {isDoctor && (
                <button 
                  onClick={() => handleDeleteDocument(index)} 
                  className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-500">No documents found for this patient.</p>
      )}
    </div>
  );
}
