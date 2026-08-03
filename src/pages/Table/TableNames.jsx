import { useEffect, useState, useRef } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";
import TableNameService from "../../services/TableNameService";
import DataGrid from "../../components/DataGrid";
import SuccessModal from "../../components/Common/SuccessModal";

function TableNames() {
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  // ================= SAVE =================
  const handleSave = async (newTableName) => {
  try {
    if (id == null) {
      await TableNameService.create(newTableName);
      setSuccessMessage("Table Name added successfully!");
    } else {
      await TableNameService.update(id, newTableName);
      setSuccessMessage("Table Name updated successfully!");
    }

    setShowSuccess(true);

    setId(null);
    setName("");
    setShowModal(false);

    loadTableNames();

  } catch (error) {
    console.error("Error:", error);
    alert("Operation failed.");
  }
  };
 
  // ================= DELETE =================

  const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this table name?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await TableNameService.delete(id);

    alert("Table Name deleted successfully.");

    loadTableNames();

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete Table Name.");
  }
};

  // ================= GET ALL =================

  const loadTableNames = async () => {
    try {
      const result = await TableNameService.getAll();

      const data = result.data;

      const allTableNames = data.map((obj) => ({
        name: obj.name,
        id: obj.tableNameId,
      }));

      setTableNames(allTableNames);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // ================= FILE UPLOAD =================

  const handleFileUpload = async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {

        const response = await TableNameService.uploadExcel(file);

        setSuccessMessage(response.data);
        setShowSuccess(true);

        loadTableNames();

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data || "Excel upload failed."
        );
    }

    // Reset input so the same file can be selected again
    event.target.value = "";

};

  useEffect(() => {
    loadTableNames();
  }, []);

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
          <h2 className="fw-bold">Table Name Management</h2>

          <p className="text-muted">Manage all table names.</p>
        </div>

        <div className="d-flex gap-2">
          {/* Hidden File Input */}

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />

          {/* Upload Button */}

          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
          >
            ⬆ Upload
          </button>

          {/* Add Button */}

          <button
            className="btn btn-primary"
            onClick={() => {
              setId(null);
              setName("");
              setShowModal(true);
            }}
          >
            + Add Table Name
          </button>
        </div>
      </div>

      {/* Data Grid */}

      <DataGrid rowData={tableNames} columnDefs={columnDefs} />

      {/* Add / Edit Modal */}

      <AddTableNameModal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          setId(null);

          setName("");
        }}
        onSave={handleSave}
        Inputname={name}
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

export default TableNames;
