import { useEffect, useState } from "react";
import AddTableAttributeModal from "./AddTableAttributeModal";
import "./TableAttributes.css";
import TableAttributeService from "../../services/TableAttributeService";
import DataGrid from "../../components/DataGrid";

function TableAttributes() {
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [id, setId] = useState(null);

  const loadTableAttributes = async () => {
    try {
      const result = await TableAttributeService.getAll();
      const data = await result.data;

      const allTableAttributes = data.map((obj) => ({
        name: obj.name,
        id: obj.attributeId,
        tableHeaderName: obj.tableHeaderName,
        shortName: obj.shortName,
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
    try {
      await TableAttributeService.delete(id);
    } catch (error) {
      console.error("Error: ", error);
    }

    loadTableAttributes();
  };

  // Upload Button
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    // TODO: Upload API

    e.target.value = "";
  };

  const columnDefs = [
    { field: "id", headerName: "ID", width: 80, flex: 1 },
    { field: "name", headerName: "Table Attribute Name", flex: 1 },
    {
      field: "tableHeaderName",
      headerName: "Table Header Name",
      flex: 1,
    },
    { field: "shortName", headerName: "Short Name", flex: 1 },
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
                let editedData = {
                  name: params.data.name,
                  shortName: params.data.shortName,
                  tableHeaderName: params.data.tableHeaderName,
                };

                setEditingAttribute(editedData);
                setId(params.data.id);
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
    const handleSave = async (newAttribute) => {
    try {
      if (id != null) {
        await TableAttributeService.update(id, newAttribute);
      } else {
        await TableAttributeService.create(newAttribute);
      }

      setEditingAttribute(null);
      setId(null);
      setShowModal(false);
      loadTableAttributes();
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">
            Table Attribute Management
          </h2>

          <p className="text-muted">
            Manage all table attributes.
          </p>
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
              document
                .getElementById("tableAttributeUpload")
                .click()
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

      <DataGrid
        rowData={tableAttributes}
        columnDefs={columnDefs}
      />

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

    </div>
  );
}

export default TableAttributes;