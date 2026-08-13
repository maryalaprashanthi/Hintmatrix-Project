import React, { useEffect, useState } from "react";
import { themeQuartz } from "ag-grid-community";
import BranchService from "../../../services/BranchService"; // Exit pages/College/Branch hierarchy
import CollegeService from "../../../services/CollegeService";
import DataGrid from "../../../components/DataGrid";
import ActionIconButton from "../../../components/Common/ActionIconButton";

function BranchTable({ onEdit, onDelete, refresh }) {
  const [branches, setBranches] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
  useEffect(() => {
    CollegeService.getAllColleges()
      .then((response) => {
        setCollegesList(response.data || []);
      })
      .catch((error) => {
        console.error(
          "Error retrieving colleges data inside grid lookup:",
          error,
        );
      });
  }, []);
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
          collegeName: item.collegeName,
          branchName: item.branchName ?? item.name,
          address: item.address,
          phoneNumber: item.phoneNumber ?? item.phone,
          email: item.email,
          activeRow:
            item.activeRow ??
            (item.status === "ACTIVE" || item.status === true),
        }));

        setBranches(sanitizedData);
      })
      .catch((error) => {
        console.error(
          "Error retrieving branch data records inside grid:",
          error,
        );
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
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this branch?",
    );
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
    {
      field: "collegeName",
      headerName: "College Name",
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        const matchedCollege = collegesList.find(
          (college) => Number(college.collegeId) === Number(params.value),
        );
        return matchedCollege ? matchedCollege.instituteName : params.value;
      },
    },
    { field: "branchName", headerName: "Branch Name", flex: 1, minWidth: 180 },
    { field: "address", headerName: "Address", flex: 1, minWidth: 180 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },

    {
      headerName: "Status",
      field: "activeRow",
      width: 120,
      cellRenderer: (params) => {
        if (!params.data) return null;

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
      width: 200,
      sortable: false,
      filter: false, // Disables column menu filters on Action header
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
              title="Edit branch"
            />
            <ActionIconButton
              type="delete"
              onClick={() => onDelete(params.data.branchId)}
              title="Delete branch"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      {/* 🌟 FIXED: Plain string wrapper implemented to keep compiler happy */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ag-popup { min-width: 280px !important; }
        .ag-filter-wrapper { min-width: 260px !important; padding: 16px !important; }
        .ag-filter-body-wrapper { width: 100% !important; }
        .ag-filter-condition { width: 100% !important; margin: 12px 0 !important; }
        .ag-picker-field { min-height: 32px !important; }
        .ag-radio-button-input-wrapper { display: none !important; }
        .ag-radio-button-label { display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; }
        .ag-radio-button-label::before { content: "" !important; display: inline-block !important; width: 14px !important; height: 14px !important; border: 2px solid #64748b !important; border-radius: 50% !important; background: white !important; }
        .ag-selected .ag-radio-button-label::before { background-color: #2563eb !important; box-shadow: inset 0 0 0 3px white !important; border-color: #2563eb !important; }
      `,
        }}
      />

      <DataGrid
        rowData={branches}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeQuartz}
        height="450px"
        pageSize={10}
        paginationPageSizeSelector={false}
        rowHeight={50}
        popupParent={document.body}
      />
    </div>
  );
}

export default BranchTable;
