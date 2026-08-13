import { useEffect, useState } from "react";
import AddTableAttributeModal from "./AddTableAttributeModal";
import "./TableAttributes.css";
import TableAttributeService from "../../services/TableAttributeService";
import DataGrid from "../../components/DataGrid";
import SuccessModal from "../../components/Common/SuccessModal";
import DeleteModal from "../../components/Common/DeleteModal";
import ActionIconButton from "../../components/Common/ActionIconButton";

function TableAttributes() {
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [id, setId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadTableAttributes = async () => {
    try {
      const result = await TableAttributeService.getAll();
      const data = await result.data;

      const allTableAttributes = data.map((obj) => ({
        name: obj.name,
        id: obj.attributeId,
        amount1: obj.amount1,
        amount2: obj.amount2,
        tableHeaderName: obj.tableHeaderName,
      }));

      setTableAttributes(allTableAttributes);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    loadTableAttributes();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this table attribute?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await TableAttributeService.delete(id);

      await loadTableAttributes();

      // Show delete success popup
      setShowDelete(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete Table Attribute.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response = await TableAttributeService.uploadExcel(file);

      setSuccessMessage(response.data);
      setShowSuccess(true);

      loadTableAttributes();
    } catch (error) {
      console.error("Upload Error:", error);

      alert(error.response?.data || "Excel upload failed.");
    }

    e.target.value = "";
  };

  const columnDefs = [
    { field: "name", headerName: "Table Attribute Name", flex: 1 },
    {
      field: "tableHeaderName",
      headerName: "Table Header Name",
      flex: 1,
    },
    { field: "amount1", headerName: "Amount 1", flex: 1 },
    { field: "amount2", headerName: "Amount 2", flex: 1 },
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
            <ActionIconButton
              type="edit"
              onClick={() => {
                let editedData = {
                  name: params.data.name,
                  amount1: params.data.amount1,
                  amount2: params.data.amount2,
                  tableHeaderName: params.data.tableHeaderName,
                };

                setEditingAttribute(editedData);
                setId(params.data.id);
                setShowModal(true);
              }}
              title="Edit table attribute"
            />

            <ActionIconButton
              type="delete"
              onClick={() => handleDelete(params.data.id)}
              title="Delete table attribute"
            />
          </div>
        );
      },
    },
  ];
  const handleSave = async (newAttribute) => {
    try {
      if (id != null) {
        await TableAttributeService.update(id, newAttribute);
        setSuccessMessage("Table Attribute updated successfully!");
      } else {
        await TableAttributeService.create(newAttribute);
        setSuccessMessage("Table Attribute added successfully!");
      }
      setShowSuccess(true);
      setEditingAttribute(null);
      setId(null);
      setShowModal(false);
      loadTableAttributes();
    } catch (error) {
      console.error("Error:", error);
      alert("Operation failed.");
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Attribute Management</h2>

          <p className="text-muted">Manage all table attributes.</p>
        </div>

        {/* Hidden Upload Input */}

        <input
          type="file"
          id="tableAttributeUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("tableAttributeUpload").click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAttribute(null);
              setId(null);
              setShowModal(true);
            }}
          >
            + Add Table Attribute
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <DataGrid rowData={tableAttributes} columnDefs={columnDefs} />
        </div>
      </div>

      {/* Modal */}

      <AddTableAttributeModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAttribute(null);
          setId(null);
        }}
        onSave={handleSave}
        initialData={editingAttribute}
      />
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => {
          setShowSuccess(false);
        }}
      />
      <DeleteModal
        show={showDelete}
        message="Table Attribute deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default TableAttributes;
