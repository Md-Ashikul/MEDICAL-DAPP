// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DoctorPatient {
    struct Doctor {
        uint256 id;
        string name;
        address wallet;
    }

    struct Patient {
        uint256 id;
        string name;
        address wallet;
        uint256[] doctorAccess;
    }

    struct Document {
        uint256 patientId;
        uint256 doctorId;
        string cid;
        string diseaseName;
        string description;
        string imageCID;
        uint256 timestamp;
    }

    mapping(uint256 => Doctor) public doctors;
    mapping(uint256 => Patient) public patients;
    mapping(uint256 => Document[]) public patientDocuments;
    mapping(uint256 => uint256[]) public doctorPatients;
    mapping(uint256 => string) public validDoctors;

    uint256 public doctorIdCounter;
    uint256 public patientIdCounter = 0 ;

    event DoctorRegistered(uint256 doctorId, string name, address wallet);
    event PatientRegistered(uint256 patientId, string name, address wallet);
    event DocumentUploaded(uint256 patientId, uint256 doctorId, string cid, string diseaseName, uint256 timestamp);
    event DocumentDeleted(uint256 patientId, uint256 doctorId, uint256 timestamp);
    event AccessGranted(uint256 patientId, uint256 doctorId);
    event AccessRevoked(uint256 patientId, uint256 doctorId);

    function registerDoctorData(uint256 _id, string memory _name) public {
        validDoctors[_id] = _name;
    }

    function registerDoctor(string memory _name, uint256 _id, address _wallet) public {
        require(keccak256(bytes(validDoctors[_id])) == keccak256(bytes(_name)), "Invalid doctor ID or name");
        doctorIdCounter++;
        doctors[doctorIdCounter] = Doctor(doctorIdCounter, _name, _wallet);
        emit DoctorRegistered(doctorIdCounter, _name, _wallet);
    }

    function registerPatient(string memory _name, address _wallet) public {
        patientIdCounter++;
        patients[patientIdCounter] = Patient(patientIdCounter, _name, _wallet, new uint256[](0));
        emit PatientRegistered(patientIdCounter, _name, _wallet);
    }

    function getPatientDoctorAccess(uint256 _patientId) public view returns (uint256[] memory) {
    return patients[_patientId].doctorAccess;
    }

    function uploadDocument(
        uint256 _patientId,
        uint256 _doctorId,
        string memory _cid,
        string memory _diseaseName,
        string memory _description,
        string memory _imageCID
    ) public {
        require(msg.sender == doctors[_doctorId].wallet, "Only assigned doctor can upload");
        require(isDoctorAuthorized(_patientId, _doctorId), "Doctor does not have access");

        patientDocuments[_patientId].push(Document({
            patientId: _patientId,
            doctorId: _doctorId,
            cid: _cid,
            diseaseName: _diseaseName,
            description: _description,
            imageCID: _imageCID,
            timestamp: block.timestamp
        }));

        doctorPatients[_doctorId].push(_patientId);
        emit DocumentUploaded(_patientId, _doctorId, _cid, _diseaseName, block.timestamp);
    }

    function getPatientDocuments(uint256 _patientId) public view returns (Document[] memory documents) {
        // Verify the patient by checking if msg.sender matches the patient's wallet address
        if (msg.sender == patients[_patientId].wallet) {
            // If verified, return the documents associated with the patient
            return patientDocuments[_patientId];
        } else {
            revert("Unauthorized access: Only the patient can access their documents.");
        }
    }


    function getPateintDocumentsByDoctor (uint _patientId , uint _doctorId) public view returns (Document[] memory documents) {
        if (isDoctorAuthorized(_patientId,_doctorId)) {
            return patientDocuments[_patientId];
        }
    }

    // Delete a document from both the smart contract and IPFS (Doctor only)
    function deleteDocument(uint256 _patientId, uint256 _docIndex) public {
        require(_docIndex < patientDocuments[_patientId].length, "Invalid document index");
        
        // Ensure the doctor has permission to delete the document
        uint256 doctorId = patientDocuments[_patientId][_docIndex].doctorId;
        require(msg.sender == doctors[doctorId].wallet, "Only assigned doctor can delete");

        // Remove the document from the array
        patientDocuments[_patientId][_docIndex] = patientDocuments[_patientId][patientDocuments[_patientId].length - 1];
        patientDocuments[_patientId].pop();

        // Emit the event with the correct doctor ID
        emit DocumentDeleted(_patientId, doctorId, block.timestamp);
    }


    function getPatientsByDoctor(uint256 _doctorId) public view returns (uint256[] memory) {
        return doctorPatients[_doctorId];
    }

    function giveAccess(uint256 _patientId, uint256 _doctorId) public {
        require(msg.sender == patients[_patientId].wallet, "Only patient can give access");
        require(!isDoctorAuthorized(_patientId, _doctorId), "Doctor already has access");

        patients[_patientId].doctorAccess.push(_doctorId);
        doctorPatients[_doctorId].push(_patientId);

        emit AccessGranted(_patientId, _doctorId);
    }

    function revokeAccess(uint256 _patientId, uint256 _doctorId) public {
        require(msg.sender == patients[_patientId].wallet, "Only patient can revoke access");
        uint256 index = findDoctorIndex(_patientId, _doctorId);
        require(index < patients[_patientId].doctorAccess.length, "Doctor not found");

        patients[_patientId].doctorAccess[index] = patients[_patientId].doctorAccess[patients[_patientId].doctorAccess.length - 1];
        patients[_patientId].doctorAccess.pop();

        uint256[] storage patientList = doctorPatients[_doctorId];
        for (uint256 i = 0; i < patientList.length; i++) {
            if (patientList[i] == _patientId) {
                patientList[i] = patientList[patientList.length - 1];  // Swap with last element
                patientList.pop();  // Remove last element
                break;
            }
        }

        emit AccessRevoked(_patientId, _doctorId);
    }

    function isDoctorAuthorized(uint256 _patientId, uint256 _doctorId) public view returns (bool) {
        for (uint256 i = 0; i < patients[_patientId].doctorAccess.length; i++) {
            if (patients[_patientId].doctorAccess[i] == _doctorId) {
                return true;
            }
        }
        return false;
    }

    function patientVerification(uint256 _patientId) public view returns (bool) {
         // Check if the caller is the patient by comparing msg.sender to the patient's wallet address
        return msg.sender == patients[_patientId].wallet;
    }

    function findDoctorIndex(uint256 _patientId, uint256 _doctorId) private view returns (uint256) {
        for (uint256 i = 0; i < patients[_patientId].doctorAccess.length; i++) {
            if (patients[_patientId].doctorAccess[i] == _doctorId) {
                return i;
            }
        }
        return patients[_patientId].doctorAccess.length;
    }
}
