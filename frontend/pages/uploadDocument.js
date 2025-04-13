import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function UploadDocument() {
  const router = useRouter();
  const { patientId: queryPatientId, doctorId } = router.query;  // Get the doctorId and patientId from URL query

  const [patientId, setPatientId] = useState(queryPatientId || "");  // Initialize with queryPatientId or empty string
  const [diseaseName, setDiseaseName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  // Effect to update patientId if it's available in query
  useEffect(() => {
    if (queryPatientId) {
      setPatientId(queryPatientId);
    }
  }, [queryPatientId]);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1]; // Get the base64 image part

      const response = await fetch("/api/uploadDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          diseaseName,
          description,
          imageFile: base64Image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      setMessage(`Success: ${data.message}`);
    };

    reader.readAsDataURL(imageFile);  // Convert image file to base64
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-6">
      <h1 className="text-4xl font-extrabold text-teal-600 mb-6">Upload Document</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg space-y-4">
        <input
          type="number"
          placeholder="Patient ID"
          value={patientId}  // Controlled input
          onChange={(e) => setPatientId(e.target.value)}  // Ensure value is controlled
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="number"
          placeholder="Doctor ID"
          value={doctorId || ""}  // Controlled input, ensure doctorId is passed correctly
          onChange={(e) => setDoctorId(e.target.value)}  // Controlled input
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          placeholder="Disease Name"
          value={diseaseName}
          onChange={(e) => setDiseaseName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
        >
          Upload Document
        </button>
      </form>

      {message && <p className="mt-4 text-lg text-gray-800">{message}</p>}
    </div>
  );
}
