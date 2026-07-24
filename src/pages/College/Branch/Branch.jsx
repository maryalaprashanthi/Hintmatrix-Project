import { useState } from "react";
import AddBranchModal from "./AddBranchmodal";
import "./Branch.css";
import BranchService from "../../../services/BranchService";
import BranchTable from "./BranchTable";

function Branch() {
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // 🌟 ADDED: State tracking for editing items
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  
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
  const handleSave = (branchData) => {
    console.log("Submitting Branch payload:", branchData);
   
     // Update the local branches list array state
    setBranches((prevBranches) => [...prevBranches, branchData]);

    // Checks for a branchId to toggle between PUT (update) and POST (save) requests
    if (branchData.branchId) {
      BranchService.updateBranch(branchData.branchId, branchData)
        .then((response) => {
          alert(typeof response.data === "string" ? response.data : "Branch updated successfully!");
          setRefreshTrigger((prev) => !prev); // Refreshes AG Grid live data records
          setShowModal(false);
          setSelectedBranch(null);
        })
        .catch((error) => {
          console.error("Error updating branch record:", error);
          alert(error.response?.data || "Failed to update branch layout.");
        });
    } else {
      BranchService.saveBranch(branchData)
        .then((response) => {
          alert(typeof response.data === "string" ? response.data : "Branch registered successfully!");
          setRefreshTrigger((prev) => !prev); // Refreshes AG Grid live data records
          setShowModal(false);
          setSelectedBranch(null);
        })
        .catch((error) => {
          console.error("Error creating branch record:", error);
          alert(error.response?.data || "Failed to register new branch.");
        });
    }
  };

 

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Branch Management</h2>
          <p className="text-muted">
            Manage all college branches.
          </p>
        </div>

        
        <button
          className="btn btn-primary px-4"
          onClick={handleAddBranch}
        >
          + Add Branch
        </button>
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

    </div>
  );
}

export default Branch;