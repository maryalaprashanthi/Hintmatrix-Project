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

  const columnDefs = [
    { field: "courseId", headerName: "Course ID", width: 120 },
    { field: "branchId", headerName: "Branch ID", width: 120 },
    { field: "courseName", headerName: "Course Name", flex: 1 },
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
    <div style={{ marginTop: "20px" }}>
      <h3>Course List</h3>
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
