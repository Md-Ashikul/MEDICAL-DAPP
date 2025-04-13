import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();  // Hook for routing

  // Function to handle navigation to Admin page
  const handleAdminConnection = () => {
    // Navigate to the Admin page
    router.push("/admin");
  };
  const handlePatientConnection = () => {
    // Navigate to the Admin page
    router.push("/loginPatient");
  };
  const handleDoctorConnection = () => {
    // Navigate to the Admin page
    router.push("/loginDoctor");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 text-white py-20 px-6">
      {/* Main content container */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-200">
          Welcome to the dApp
        </h1>
        <p className="text-xl font-semibold text-gray-100 mt-4">
          A Patient-centric medical data storing system
        </p>
      </div>

      {/* Buttons for navigating different roles */}
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Button for Admin */}
        <button
          className="w-full py-4 text-lg font-semibold bg-blue-800 text-white rounded-lg shadow-xl hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onClick={handleAdminConnection}
        >
          Connect as Admin
        </button>

        {/* Button for Doctor */}
        <button
          className="w-full py-4 text-lg font-semibold bg-green-700 text-white rounded-lg shadow-xl hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          onClick={handleDoctorConnection}
        >
          Connect as Doctor
        </button>

        {/* Button for Patient */}
        <button
          className="w-full py-4 text-lg font-semibold bg-pink-600 text-white rounded-lg shadow-xl hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          onClick={handlePatientConnection}
        >
          Connect as Patient
        </button>
      </div>
    </div>
  );
}
