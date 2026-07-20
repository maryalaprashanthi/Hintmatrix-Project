import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
// 🌟 FIXED ERROR #239: Import ValidationModule alongside AllCommunityModule
import { AllCommunityModule, ValidationModule, ModuleRegistry } from "ag-grid-community";
import CollegeService from "../services/CollegeService";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// 🌟 FIXED ERROR #239: Explicitly register both community modules here
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

function CollegeTable({ onEdit, refresh }) {
  const [colleges, setColleges] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  useEffect(() => {
    loadColleges();
  }, [refresh]);

  const loadColleges = () => {
    CollegeService.getAllColleges()
      .then((response) => {
        // Populates ag-Grid rows with the accurate CollegeResponseDTO data payload
        setColleges(response.data);
      })
      .catch((error) => {
        console.error("Error retrieving college data:", error);
      });
  };

  const handleEdit = (college) => {
    if (onEdit) {
      onEdit(college);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this college?");
    if (confirmDelete) {
      // Targets backend delete mapping matching @DeleteMapping("/{id}")
      CollegeService.deleteCollege(id)
        .then(() => {
          alert("Deleted Successfully");
          loadColleges();
        })
        .catch((error) => {
          console.error("Error deleting college:", error);
        });
    }
  };

  // Explicitly mapping column definitions against your backend CollegeResponseDTO fields
  const columnDefs = [
    { field: "collegeId", headerName: "ID", width: 80 },
    { field: "instituteName", headerName: "Institute Name", flex: 1, minWidth: 160 },
    { field: "address", headerName: "Address", flex: 1, minWidth: 150 },
    { field: "phoneNumber", headerName: "Phone Number", width: 140 },
    { field: "email", headerName: "Email Address", flex: 1, minWidth: 160 },
    { 
      field: "activeRow", 
      headerName: "Status", 
      width: 100,
      cellRenderer: (params) => {
        // FIXED: Replaced conflicting global CSS classes with standalone inline styles
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
      headerName: "Registered On", 
      width: 130,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      headerName: "Action",
      width: 160,
      suppressMenu: true,
      sortable: false,
      filter: false,
      pinned: "right",
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
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data.collegeId)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "2px 10px",
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
      {/* Structural layout rules injected directly to eliminate overlaps and fix broken fonts */}
      <style>{`
        .ag-popup {
          min-width: 280px !important;
        }
        .ag-filter-wrapper {
          min-width: 260px !important;
          padding: 16px !important;
        }
        .ag-filter-body-wrapper {
          width: 100% !important;
        }
        .ag-filter-condition {
          width: 100% !important;
          margin: 12px 0 !important;
        }
        .ag-picker-field {
          min-height: 32px !important;
        }
        /* Override broken web fonts and display native modern radio selectors */
        .ag-radio-button-input-wrapper {
          display: none !important;
        }
        .ag-radio-button-label {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          cursor: pointer !important;
        }
        .ag-radio-button-label::before {
          content: "" !important;
          display: inline-block !important;
          width: 14px !important;
          height: 14px !important;
          border: 2px solid #64748b !important;
          border-radius: 50% !important;
          background: white !important;
        }
        .ag-selected .ag-radio-button-label::before {
          background-color: #2563eb !important;
          box-shadow: inset 0 0 0 3px white !important;
          border-color: #2563eb !important;
          content: "" !important;
        }
      `}</style>

      <div className="ag-theme-quartz" style={{ height: "450px", width: "100%" }}>
        <AgGridReact 
          rowData={colleges} 
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
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

export default CollegeTable;
