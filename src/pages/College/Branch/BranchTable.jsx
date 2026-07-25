import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
// Import ValidationModule alongside AllCommunityModule
import { AllCommunityModule, ValidationModule, ModuleRegistry } from "ag-grid-community";
// Import the official themeQuartz token object from the library
import { themeQuartz } from "ag-grid-community"; 
import BranchService from "../../../services/BranchService"; // Exit pages/College/Branch hierarchy

import "ag-grid-community/styles/ag-grid.css";

// Explicitly register both community modules here
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

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
      .then((response) => {
        // Map and transform keys to ensure structural safety with your DTO configurations
        const rawData = response.data || [];
        
        const sanitizedData = rawData.map((item) => ({
          ...item,
          branchId: item.branchId ?? item.id,
          collegeId: item.collegeId,
          branchName: item.branchName ?? item.name,
          address: item.address,
          phoneNumber: item.phoneNumber ?? item.phone,
          email: item.email
        }));

        setBranches(sanitizedData);
      })
      .catch((error) => {
        console.error("Error retrieving branch data records inside grid:", error);
      });
  };

  const handleEdit = (branch) => {
    if (onEdit) {
      onEdit(branch);
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      alert("Cannot delete: Branch ID is missing or undefined.");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this branch?");
    if (confirmDelete) {
      BranchService.deleteBranch(id)
        .then(() => {
          alert("Deleted Successfully");
          loadBranches(); // Refresh data grid layout list
        })
        .catch((error) => {
          console.error("Error executing delete layout pipeline:", error);
        });
    }
  };

  // Mapped definitions exactly to match properties from your BranchRequestDTO fields
  const columnDefs = [
    { field: "branchId", headerName: "ID", width: 90 },
    { field: "collegeId", headerName: "College ID", width: 120 },
    { field: "branchName", headerName: "Branch Name", flex: 1, minWidth: 180 },
    { field: "address", headerName: "Address", flex: 1, minWidth: 180 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    {
      headerName: "Action",
      width: 200, 
      sortable: false,
      filter: false, // Disables column menu filters on Action header
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
                padding: "2px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
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
                padding: "2px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
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
    <div style={{ marginTop: "20px" }}>
      {/* 🌟 FIXED: Plain string wrapper implemented to keep compiler happy */}
      <style dangerouslySetInnerHTML={{__html: `
        .ag-popup { min-width: 280px !important; }
        .ag-filter-wrapper { min-width: 260px !important; padding: 16px !important; }
        .ag-filter-body-wrapper { width: 100% !important; }
        .ag-filter-condition { width: 100% !important; margin: 12px 0 !important; }
        .ag-picker-field { min-height: 32px !important; }
        .ag-radio-button-input-wrapper { display: none !important; }
        .ag-radio-button-label { display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; }
        .ag-radio-button-label::before { content: "" !important; display: inline-block !important; width: 14px !important; height: 14px !important; border: 2px solid #64748b !important; border-radius: 50% !important; background: white !important; }
        .ag-selected .ag-radio-button-label::before { background-color: #2563eb !important; box-shadow: inset 0 0 0 3px white !important; border-color: #2563eb !important; }
      `}} />

      {/* Passing theme={themeQuartz} configuration object directly to resolve Error #240 layout warnings */}
      <div style={{ height: "450px", width: "100%" }}>
        <AgGridReact 
          rowData={branches} 
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={themeQuartz}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={false}
          rowHeight={50}
          popupParent={document.body}
        />
      </div>
    </div>
  );
}

export default BranchTable;
