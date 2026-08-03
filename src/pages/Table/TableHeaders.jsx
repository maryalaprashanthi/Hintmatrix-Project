import { useState, useEffect } from "react";
import "./TableHeaders.css";
import AddTableHeaderModal from "./AddTableHeaderModal";
import TableHeaderService from "../../services/TableHeaderService";
import DataGrid from "../../components/DataGrid";
import SuccessModal from "../../components/Common/SuccessModal";

function TableHeaders() {
  const [showModal, setShowModal] = useState(false);

  const [tableHeaders, setTableHeaders] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Upload Handler
  const handleFileUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) {
        return;
    }

    try {

        const response = await TableHeaderService.uploadExcel(file);

        setSuccessMessage(response.data);
        setShowSuccess(true);

        loadTableHeaders();

    } catch (error) {

        console.error("Upload Error:", error);

        alert(error.response?.data || "Excel upload failed.");

    }

    e.target.value = "";
};

  const handleSave = async (newTableHeader) => {
  try {
    if (id == null) {
      await TableHeaderService.create(newTableHeader);
      setSuccessMessage("Table Header added successfully.");
    } else {
      await TableHeaderService.update(id, newTableHeader);
      setSuccessMessage("Table Header updated successfully.");
    }
    setShowSuccess(true);
    setId(null);
    setName("");
    setShowModal(false);
    loadTableHeaders();
  } catch (error) {
    console.error("Error:", error);
    alert("Operation failed.");
  }
};

  const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this table header?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await TableHeaderService.delete(id);

    alert("Table Header deleted successfully.");

    loadTableHeaders();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete Table Header.");
  }
};

  useEffect(() => {
    loadTableHeaders();
  }, []);

  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;

      const allTableNames = data.map((obj) => ({
        name: obj.name,
        id: obj.headerId,
      }));

      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const columnDefs = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      flex: 1,
    },
    {
      field: "name",
      headerName: "Institute Name",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "Action",
      flex: 1,
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
            <button
              onClick={() => {
                setId(params.data.id);
                setName(params.data.name);
                setShowModal(true);
              }}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(params.data.id)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];
    return (
    <div className="container-fluid py-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            Table Header Management
          </h2>

          <p className="text-muted">
            Manage all table headers.
          </p>

        </div>

        {/* Hidden Upload Input */}

        <input
          type="file"
          id="tableHeaderUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">

          <button
            className="btn btn-primary"
            onClick={() =>
              document
                .getElementById("tableHeaderUpload")
                .click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setId(null);
              setName("");
              setShowModal(true);
            }}
          >
            + Add Table Header
          </button>

        </div>

      </div>

      {/* Data Grid */}

      <DataGrid
        rowData={tableHeaders}
        columnDefs={columnDefs}
      />

      {/* Modal */}

      <AddTableHeaderModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setId(null);
          setName("");
        }}
        onSave={handleSave}
        Inputdata={name}
      />
      <SuccessModal
      show={showSuccess}
      message={successMessage}
      onClose={() => {
      setShowSuccess(false);
    }}
   />
  </div>
 );
}

export default TableHeaders;