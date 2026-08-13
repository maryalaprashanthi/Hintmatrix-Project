import React, { useEffect, useState } from "react";
import CollegeService from "../../services/CollegeService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";

function CollegeTable({ onEdit, onDelete, refresh }) {
  const [colleges, setColleges] = useState([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  useEffect(() => {
    loadColleges();
  }, [refresh]);

  const loadColleges = () => {
    CollegeService.getAllColleges()
      .then((response) => {
        const rawData = response.data || [];

        const sanitizedData = rawData.map((item) => ({
          ...item,
          // Checks for alternative naming formats commonly used in DTO files
          // collegeId: item.collegeId ?? item.id,
          instituteName: item.instituteName ?? item.name,
          address: item.address,
          phoneNumber: item.phoneNumber ?? item.phone,
          email: item.email,
          activeRow: item.activeRow ?? true,
        }));

        setColleges(sanitizedData);
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

  const columnDefs = [
    { field: "instituteName", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "email", headerName: "Email", flex: 1 },

    // STATUS COLUMN
    {
      headerName: "Status",
      field: "activeRow",
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
      headerName: "Action",
      width: 180,
      sortable: false,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              gap: "8px",
            }}
          >
            <ActionIconButton
              type="edit"
              onClick={() => handleEdit(params.data)}
              title="Edit college"
            />
            <ActionIconButton
              type="delete"
              onClick={() => onDelete(params.data.collegeId)}
              title="Delete college"
            />
          </div>
        );
      },
    },
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
        }
      `}</style>

      <DataGrid
        rowData={colleges}
        columnDefs={columnDefs}
        height="450px"
        pageSize={10}
      />
    </div>
  );
}

export default CollegeTable;
