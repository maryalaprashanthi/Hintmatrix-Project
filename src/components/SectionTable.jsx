import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { getAllSections, deleteSection } from "../services/SectionService";

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
    getAllSections()
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
      deleteSection(id)
        .then(() => {
          alert("Section Deleted Successfully");
          loadSections();
        })
        .catch((error) => {
          console.error("Error deleting section:", error);
        });
    }
  };

  const columnDefs = [
    { field: "sectionId", headerName: "ID", width: 90 },
    { field: "courseName", headerName: "Course", flex: 1 },
    { field: "branchName", headerName: "Branch", flex: 1 },
    { field: "collegeName", headerName: "College", flex: 1 },
    { field: "sectionName", headerName: "Section", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
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
    <div style={{ marginTop: "20px" }}>
      <h3>All Sections</h3>
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
