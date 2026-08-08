import React, { useEffect, useState } from "react";
import SectionService from "../services/SectionService";
import DataGrid from "./DataGrid";
import ActionIconButton from "./Common/ActionIconButton";

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
        const rawData = response.data || [];

        const sanitizedData = rawData.map((item) => ({
          ...item,

          sectionName: item.sectionName ?? item.name,

          courseName: item.courseName ?? item.course?.courseName ?? "",

          description: item.description,

          activeRow: item.activeRow ?? true,
        }));

        setSections(sanitizedData);
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
      field: "sectionName",
      headerName: "Name",
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
      cellRenderer: (params) => {
        const isActive = Boolean(params.value);
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "600",
              lineHeight: 1,
              background: isActive ? "#dcfce7" : "#fef2f2",
              color: isActive ? "#166534" : "#b91c1c",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: isActive ? "#16a34a" : "#ef4444",
                display: "inline-block",
              }}
            />
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
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
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap", // Prevents vertical button stacking
            gap: "8px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <ActionIconButton
            type="edit"
            onClick={() => onEdit(params.data)}
            title="Edit section"
          />

          <ActionIconButton
            type="delete"
            onClick={() => deleteSection(params.data.sectionId)}
            title="Delete section"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: "10px" }}>
      <DataGrid
        rowData={sections}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        height="450px"
        pageSize={10}
        paginationPageSizeSelector={false}
        rowHeight={50}
        popupParent={document.body}
      />
    </div>
  );
}

export default SectionTable;
