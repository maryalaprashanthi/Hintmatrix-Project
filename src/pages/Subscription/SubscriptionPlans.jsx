import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./SubscriptionPlans.css";

function SubscriptionPlans() {
  const navigate = useNavigate();

  /* ================================
     SUBSCRIPTIONS
  ================================= */

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "Free Trial",
      description: "Free trial subscription",
      price: 0,
      duration: 30,
      durationType: "Days",
      status: "Active",
    },
    {
      id: 2,
      name: "Basic Plan",
      description: "Basic subscription plan",
      price: 499,
      duration: 30,
      durationType: "Days",
      status: "Active",
    },
    {
      id: 3,
      name: "Premium Plan",
      description: "Premium subscription plan",
      price: 999,
      duration: 1,
      durationType: "Year",
      status: "Active",
    },
  ]);

  /* ================================
     ADD SUBSCRIPTION
  ================================= */

  const handleAddSubscription = () => {
    alert("Add Subscription form will be added here.");
  };

  /* ================================
     EDIT
  ================================= */

  const handleEdit = (subscription) => {
    alert(`Edit Subscription: ${subscription.name}`);
  };

  /* ================================
     DELETE
  ================================= */

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscription?",
    );

    if (!confirmDelete) {
      return;
    }

    setSubscriptions((previous) =>
      previous.filter((subscription) => subscription.id !== id),
    );
  };

  /* ================================
     ACTION RENDERER
  ================================= */

  const ActionRenderer = (params) => {
    return (
      <div className="subscription-plan-actions">
        {/* EDIT */}
        <button
          type="button"
          className="action-icon-only edit-icon"
          title="Edit"
          onClick={() => handleEdit(params.data)}
        >
          <FaEdit />
        </button>

        {/* DELETE */}
        <button
          type="button"
          className="action-icon-only delete-icon"
          title="Delete"
          onClick={() => handleDelete(params.data.id)}
        >
          <FaTrash />
        </button>
      </div>
    );
  };

  /* ================================
     COLUMN DEFINITIONS
  ================================= */

  const columnDefs = [
    {
      headerName: "ID",
      field: "id",
      width: 90,
      minWidth: 90,
    },

    {
      headerName: "Subscription Name",
      field: "name",
      flex: 1,
      minWidth: 180,
    },

    {
      headerName: "Description",
      field: "description",
      flex: 1.5,
      minWidth: 220,
    },

    {
      headerName: "Price",
      field: "price",
      width: 120,
      minWidth: 120,

      valueFormatter: (params) => `₹${params.value}`,
    },

    {
      headerName: "Duration",
      width: 150,
      minWidth: 150,

      valueGetter: (params) =>
        `${params.data.duration} ${params.data.durationType}`,
    },

    {
      headerName: "Status",
      field: "status",
      width: 120,
      minWidth: 120,
    },

    /* ================================
       ACTIONS
    ================================= */

    {
      headerName: "Actions",

      width: 150,
      minWidth: 150,

      cellRenderer: ActionRenderer,

      sortable: false,
      filter: false,
      resizable: false,

      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
    },
  ];

  /* ================================
     DEFAULT COLUMN
  ================================= */

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  /* ================================
     RETURN
  ================================= */

  return (
    <div className="container-fluid subscription-plans-page">
      {/* ================================
          HEADER
      ================================= */}

      <div className="subscription-plans-header">
        <div className="subscription-plans-title">
          {/* BACK BUTTON */}

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/subscriptions")}
            title="Back to Subscription Management"
          >
            <FaArrowLeft />
          </button>

          {/* TITLE */}

          <div>
            <h2>Subscription Plans</h2>

            <p>Create, organize and manage subscription plans.</p>
          </div>
        </div>

        {/* ADD BUTTON */}

        <button
          type="button"
          className="add-subscription-btn"
          onClick={handleAddSubscription}
        >
          <FaPlus />

          <span>Add Subscription</span>
        </button>
      </div>

      {/* ================================
          TABLE CONTAINER
      ================================= */}

      <div className="subscription-table-container">
        {/* TABLE HEADER */}

        <div className="table-header">
          <h3>All Subscription Plans</h3>

          <p>Manage your available subscription plans.</p>
        </div>

        {/* AG GRID */}

        <div className="ag-theme-alpine subscription-grid">
          <AgGridReact
            rowData={subscriptions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            rowHeight={55}
            headerHeight={48}
          />
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
