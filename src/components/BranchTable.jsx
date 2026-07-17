import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import BranchService from "../services/BranchService";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register ag-Grid community modules explicitly
ModuleRegistry.registerModules([AllCommunityModule]);

function BranchTable({ onEdit, refresh }) {
  const [branches, setBranches] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  useEffect(() => {
    loadBranches();
  }, [refresh]);

  const loadBranches = () => {
    BranchService.getAllBranches()
      .then(response => {
        setBranches(response.data);
      })
      .catch(error => {
        console.error("Error retrieving branch data:", error);
      });
  };

  const handleEdit = (branch) => {
    if (onEdit) {
      onEdit(branch);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this branch?"
    );

    if (confirmDelete) {
      BranchService.deleteBranch(id)
        .then(() => {
          alert("Branch Deleted Successfully");
          loadBranches();
        })
        .catch(error => {
          console.error("Error deleting branch:", error);
        });
    }
  };

  const columnDefs = [
    { field: "branchId", headerName: "ID", width: 90 },
    { field: "collegeId", headerName: "College ID", width: 120 },
    { field: "branchName", headerName: "Branch Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      headerName: "Actions",
      width: 180,
      suppressMenu: true,
      sortable: false,
      cellRenderer: (params) => {
        if (!params.data) return null;
        
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%", gap: "8px" }}>
            <button
              onClick={() => handleEdit(params.data)}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                lineHeight: "1",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data.branchId)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                lineHeight: "1",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="ag-theme-quartz" style={{ height: "450px", width: "100%", marginTop: "20px" }}>
      <AgGridReact 
        rowData={branches} 
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={false}
        rowHeight={50}
        popupParent={document.body}
      />
    </div>
  );
}

export default BranchTable;
