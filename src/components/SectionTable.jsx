import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import SectionService from "../services/SectionService"; 

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register ag-Grid community modules explicitly
ModuleRegistry.registerModules([AllCommunityModule]);

function SectionTable({ onEdit, refresh }) {
  const [sections, setSections] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  useEffect(() => {
    loadSections();
  }, [refresh]);

  const loadSections = () => {
    // Linked to the official REST service getter method
    SectionService.getAllSections()
      .then((response) => {
        setSections(response.data);
      })
      .catch((error) => {
        console.error("Error retrieving sections:", error);
      });
  };

  const handleEdit = (section) => {
    if (onEdit) {
      onEdit(section);
    }
  };

  const deleteSectionData = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this section?"
    );

    if (confirmDelete) {
      // Linked to the updated delete routing method targeting @DeleteMapping("/{id}")
      SectionService.deleteSection(id)
        .then(() => {
          alert("Section Deleted Successfully");
          loadSections();
        })
        .catch((error) => {
          console.error("Error deleting section:", error);
        });
    }
  };

  // Explicitly mapping column definitions against your backend SectionResponseDTO fields
  const columnDefs = [
    { field: "sectionId", headerName: "ID", width: 80 },
    { field: "sectionName", headerName: "Section Name", flex: 1, minWidth: 130 },
    { field: "courseName", headerName: "Associated Course", flex: 1, minWidth: 150 }, // Fetched cleanly from DTO
    { field: "description", headerName: "Description", flex: 2, minWidth: 180 },
    { 
      field: "activeRow", 
      headerName: "Status", 
      width: 100,
      cellRenderer: (params) => {
        // FIXED: Switched to robust inline CSS layout configurations to handle custom background renders
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
      width: 130,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      headerName: "Actions",
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
              onClick={() => deleteSectionData(params.data.sectionId)}
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
    <div style={{ marginTop: "10px" }}>
      <div className="ag-theme-quartz" style={{ height: "450px", width: "100%" }}>
        <AgGridReact
          rowData={sections}
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

export default SectionTable;
