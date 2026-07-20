import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import CourseService from "../services/CourseService";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register ag-Grid community modules explicitly
ModuleRegistry.registerModules([AllCommunityModule]);

function CourseTable({ onEdit, refresh }) {
  const [courses, setCourses] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  useEffect(() => {
    loadCourses();
  }, [refresh]);

  const loadCourses = () => {
    CourseService.getAllCourses()
      .then((response) => {
        // Populates ag-Grid rows with the accurate CourseResponseDTO data payload
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error retrieving courses data:", error);
      });
  };

  const handleEdit = (course) => {
    if (onEdit) {
      onEdit(course);
    }
  };

  const deleteCourse = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (confirmDelete) {
      // Targets backend delete mapping matching @DeleteMapping("/{id}")
      CourseService.deleteCourse(id)
        .then(() => {
          alert("Course Deleted Successfully");
          loadCourses();
        })
        .catch((error) => {
          console.error("Error deleting course:", error);
        });
    }
  };

  // Explicitly mapping column definitions against your backend CourseResponseDTO fields
  const columnDefs = [
    { field: "courseId", headerName: "ID", width: 80 },
    { field: "name", headerName: "Course Name", flex: 1, minWidth: 150 }, // Remapped from courseName to name
    { field: "branchName", headerName: "Branch Name", flex: 1, minWidth: 150 }, // Displays readable branch name instead of ID
    { field: "rowStatus", headerName: "Row Status", width: 120 },
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
              onClick={() => deleteCourse(params.data.courseId)}
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
          rowData={courses}
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

export default CourseTable;
