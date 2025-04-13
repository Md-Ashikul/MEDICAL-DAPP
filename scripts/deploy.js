const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const DoctorPatient = await hre.ethers.getContractFactory("DoctorPatient");
    const doctorPatient = await DoctorPatient.deploy(); // Deploy contract

    await doctorPatient.waitForDeployment(); // ✅ FIX: Correct method to wait for deployment

    console.log("DoctorPatient contract deployed to:", await doctorPatient.getAddress()); // ✅ FIX: Get contract address correctly
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
