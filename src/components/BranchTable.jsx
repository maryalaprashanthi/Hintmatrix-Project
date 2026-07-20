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
        // Populates rows directly using the array of BranchResponseDTO structures
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
      // Targets backend delete mapping matching @DeleteMapping("/{id}")
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

  // Optimized column sizing maps down cleanly to distribute screen whitespace beautifully
  const columnDefs = [
    { field: "branchId", headerName: "ID", width: 70 },
    { field: "branchName", headerName: "Branch Name", flex: 2, minWidth: 180 }, // Dynamic expansion weight
    { field: "collegeName", headerName: "Associated College", flex: 1, minWidth: 160 },
    { field: "address", headerName: "Address", width: 150 },
    { field: "phoneNumber", headerName: "Phone Number", width: 130 },
    { field: "email", headerName: "Email Address", width: 180 },
    { 
      field: "activeRow", 
      headerName: "Status", 
      width: 95,
      cellRenderer: (params) => {
        return params.value ? (
          <span style={{
            backgroundColor: "#dcfce7",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            display: "inline-block",
            lineHeight: "1"
          }}>Active</span>
        ) : (
          <span style={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            display: "inline-block",
            lineHeight: "1"
          }}>Inactive</span>
        );
      }
    },
    { 
      field: "createdAt", 
      headerName: "Created On", 
      width: 110,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      headerName: "Actions",
      width: 140,
      suppressMenu: true,
      sortable: false,
      filter: false,
      pinned: "right", // ◄— FIXED: Keeps action buttons locked to the screen edge seamlessly
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
    <div className="ag-theme-quartz" style={{ height: "480px", width: "100%", marginTop: "10px" }}>
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
