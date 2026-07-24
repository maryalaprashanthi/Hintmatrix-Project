import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import SectionService from "../services/SectionService";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

function SectionTable({ refresh, onEdit }) {
  const [sections, setSections] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  useEffect(() => {
    loadSections();
  }, [refresh]);

  const loadSections = () => {
    SectionService.getAllSections()
      .then((response) => {
        setSections(response.data);
      })
      .catch((error) => {
        console.error("Error loading sections:", error);
      });
  };

  const deleteSection = (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      SectionService.deleteSection(id)
        .then(() => {
          alert("Section Deleted Successfully");
          loadSections();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const columnDefs = [
    {
      field: "sectionId",
      headerName: "ID",
      width: 90,
    },
    {
      field: "sectionName",
      headerName: "Section Name",
      flex: 1,
    },
    {
      field: "courseName",
      headerName: "Course",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "activeRow",
      headerName: "Status",
      width: 120,
      cellRenderer: (params) =>
        params.value ? (
          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Active
          </span>
        ) : (
          <span
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Inactive
          </span>
        ),
    },
    {
      field: "createdAt",
      headerName: "Created On",
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      headerName: "Actions",
      width: 170,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onEdit(params.data)}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteSection(params.data.sectionId)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: "10px" }}>
      <div
        className="ag-theme-quartz"
        style={{
          width: "100%",
          height: "450px",
        }}
      >
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