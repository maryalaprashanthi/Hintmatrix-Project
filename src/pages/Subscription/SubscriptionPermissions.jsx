import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./SubscriptionPermissions.css";

ModuleRegistry.registerModules([AllCommunityModule]);

function SubscriptionPermissions() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  /* =========================
     TEMPORARY DATA
  ========================= */

  const [permissions, setPermissions] = useState([
    {
      permissionId: 1,
      role: "Student",
      subscriptionPlan: "Basic",
      accessType: "Full Access",
      status: "Active",
    },
    {
      permissionId: 2,
      role: "Student",
      subscriptionPlan: "Premium",
      accessType: "Full Access",
      status: "Active",
    },
    {
      permissionId: 3,
      role: "Branch Admin",
      subscriptionPlan: "Premium",
      accessType: "Manage",
      status: "Active",
    },
    {
      permissionId: 4,
      role: "College Admin",
      subscriptionPlan: "Basic",
      accessType: "View",
      status: "Active",
    },
  ]);

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (permission) => {
    console.log("Edit Permission:", permission);

    alert(
      `Edit Permission\n\nRole: ${permission.role}\nSubscription Plan: ${permission.subscriptionPlan}\nAccess Type: ${permission.accessType}`,
    );
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = (permission) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this permission?",
    );

    if (!confirmDelete) return;

    setPermissions((prev) =>
      prev.filter((item) => item.permissionId !== permission.permissionId),
    );
  };

  /* =========================
     ADD PERMISSION
  ========================= */

  const handleAddPermission = () => {
    alert("Add Permission form will be added here.");
  };

  /* =========================
     STATUS RENDERER
  ========================= */

  const StatusRenderer = (params) => {
    return (
      <span
        className={
          params.value === "Active"
            ? "permission-status active"
            : "permission-status inactive"
        }
      >
        {params.value}
      </span>
    );
  };

  /* =========================
     ACTION RENDERER
  ========================= */

  const ActionRenderer = (params) => {
    return (
      <div className="permission-actions">
        <button
          type="button"
          className="btn btn-outline-primary action-icon-btn"
          title="Edit"
          onClick={() => handleEdit(params.data)}
        >
          <FaEdit />
        </button>

        <button
          type="button"
          className="btn btn-outline-danger action-icon-btn"
          title="Delete"
          onClick={() => handleDelete(params.data)}
        >
          <FaTrash />
        </button>
      </div>
    );
  };

  /* =========================
     AG GRID COLUMNS
  ========================= */

  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "permissionId",
        width: 90,
        minWidth: 90,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },

      {
        headerName: "Role",
        field: "role",
        flex: 1,
        minWidth: 150,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },

      {
        headerName: "Subscription Plan",
        field: "subscriptionPlan",
        flex: 1,
        minWidth: 180,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },

      {
        headerName: "Access Type",
        field: "accessType",
        flex: 1,
        minWidth: 150,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },

      {
        headerName: "Status",
        field: "status",
        width: 130,
        minWidth: 130,
        cellRenderer: StatusRenderer,
        sortable: true,
        filter: true,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },

      {
        headerName: "Actions",
        width: 100,
        minWidth: 100,
        cellRenderer: ActionRenderer,
        sortable: false,
        filter: false,
        resizable: false,
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
      },
    ],
    [],
  );

  /* =========================
     SEARCH
  ========================= */

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) {
      return permissions;
    }

    const searchText = search.toLowerCase();

    return permissions.filter((permission) =>
      Object.values(permission).some((value) =>
        String(value).toLowerCase().includes(searchText),
      ),
    );
  }, [permissions, search]);

  /* =========================
     RETURN
  ========================= */

  return (
    <div className="container-fluid subscription-permissions-page">
      {/* ================= HEADER ================= */}

      <div className="subscription-permissions-header">
        {/* LEFT SIDE */}
        <div className="subscription-permissions-left">
          {/* BACK BUTTON */}
          <button
            type="button"
            className="permissions-back-btn"
            onClick={() => navigate("/subscriptions")}
            title="Back to Subscription Management"
          >
            <FaArrowLeft />
          </button>

          {/* TITLE */}
          <div className="subscription-permissions-title">
            <div>
              <h2>Subscription Permissions</h2>

              <p>Manage subscription access and permissions.</p>
            </div>
          </div>
        </div>

        {/* ADD PERMISSION */}
        <button
          type="button"
          className="btn btn-primary add-permission-btn"
          onClick={handleAddPermission}
        >
          <FaPlus />
          <span>Add Permission</span>
        </button>
      </div>

      {/* ================= SEARCH ================= */}

      <div className="permission-toolbar">
        <div className="permission-search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ================= AG GRID ================= */}

      <div className="subscription-permissions-grid ag-theme-alpine">
        <AgGridReact
          rowData={filteredPermissions}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          rowHeight={55}
          headerHeight={48}
          suppressCellFocus={true}
          animateRows={true}
        />
      </div>
    </div>
  );
}

export default SubscriptionPermissions;
