import { useState } from "react";
import AddBranchModal from "./AddBranchmodal";
import "./Branch.css";
import BranchService from "../../../services/BranchService";
import BranchTable from "./BranchTable";
import SuccessModal from "../../../components/Common/SuccessModal";

function Branch() {
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // 🌟 ADDED: State tracking for editing items
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // Open Add Branch Form Context Block
  const handleAddBranch = () => {
    setSelectedBranch(null);
    setShowModal(true);
  };

  // Open Edit Branch Modal Form (Passed up from AG Grid Row callback event)
  const handleEditBranch = (branchData) => {
    setSelectedBranch(branchData);
    setShowModal(true);
  };

  // Save / Update Branch Orchestration Pipeline
  const handleSave = async (branchData) => {
  console.log("Submitting Branch payload:", branchData);

  try {
    if (branchData.branchId) {
      await BranchService.updateBranch(branchData.branchId, branchData);
      setSuccessMessage("Branch updated successfully!");
    } else {
      await BranchService.saveBranch(branchData);
      setSuccessMessage("Branch saved successfully!");
    }

    setShowModal(false);
    setSelectedBranch(null);
    setRefreshTrigger((prev) => !prev);
    setShowSuccess(true);

  } catch (error) {
    console.error(error);
    alert(error.response?.data || "Operation failed.");
  }
};
    
  const handleFileUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  try {
    const response = await BranchService.uploadExcel(file);

    alert(
      typeof response.data === "string"
        ? response.data
        : "Branch Excel uploaded successfully!"
    );

    setRefreshTrigger((prev) => !prev);

  } catch (error) {
    console.error("Upload Error:", error);

    if (error.response) {
      alert(error.response.data);
    } else {
      alert("File upload failed.");
    }
  }

  e.target.value = "";
};
return (
    <div className="container-fluid py-4">

      
      {/* Header */}
<div className="d-flex justify-content-between align-items-center mb-4">

  <div>
    <h2 className="fw-bold">
      Branch Management
    </h2>

    <p className="text-muted">
      Manage all college branches.
    </p>
  </div>

  {/* Hidden Upload Input */}
  <input
    type="file"
    id="branchUpload"
    accept=".csv,.xlsx,.xls"
    style={{ display: "none" }}
    onChange={handleFileUpload}
  />

  <div className="d-flex gap-2">

    <button
      className="btn btn-primary"
      onClick={() =>
        document.getElementById("branchUpload").click()
      }
    >
      ⬆ Upload
    </button>

    <button
      className="btn btn-primary"
      onClick={handleAddBranch}
    >
      + Add Branch
    </button>

  </div>

</div>

      {/* 🌟 FIXED: Replaced simple local table markup with high performance AG Grid container wrapper */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          
          <BranchTable 
            refresh={refreshTrigger} 
            onEdit={handleEditBranch} // 🌟 Maps Edit row updates directly from table component cell rows
          />

        </div>
      </div>

      {/* Pop-up Portal form matching downstream alignment updates */}
      <AddBranchModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBranch(null);
        }}
        onSave={handleSave}
        selectedBranchData={selectedBranch} // 🌟 Passes row tracking state downstream to inputs
      />
      <SuccessModal
      show={showSuccess}
      message={successMessage}
      onClose={() => setShowSuccess(false)}
      />

    </div>
  );
}

export default Branch;