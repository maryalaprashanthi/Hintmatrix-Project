import { useEffect, useState } from "react";
import AddTableAttributeModal from "./AddTableAttributeModal";
import "./TableAttributes.css";
import TableAttributeService from "../../services/TableAttributeService";
import toast from "react-hot-toast";
import DataGrid from "../../components/DataGrid";

function TableAttributes() {
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tableHeader, setTableHeader] = useState("");
  const [tableAttributes, setTableAttributes] = useState([]);

  const getDemoData = () => {
    return {};
  };

  const loadTableAttributes = async () => {
    try {
      const result = await TableAttributeService.getAll();
      const data = await result.data;
      // console.log("all data ",data);
      const allTableAttributes = data.map((obj) => ({
        name: obj.name,
        id: obj.attributeId,
        tableHeader: obj.tableHeaderName,
        shortName: obj.shortName,
      }));
      console.log("All my table attributes: ", allTableAttributes);
      //  const namesOnly = response.data.map((item) => item.name);
      setTableAttributes(allTableAttributes);
    } catch (error) {
      console.log("Error: ", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadTableAttributes();
  }, []);

  const handleDelete = async (id) => {
    console.log("Delete is called with this data ", id);
    try {
      const reposnse = await TableAttributeService.delete(id);
      const data = await reposnse.data;
      toast.success("Data deleted successfully");
    } catch (error) {
      console.error("Error: ", error);
      toast.error(error.message);
    }
    loadTableAttributes();
  };

  const columnDefs = [
    { field: "id", headerName: "ID", width: 80, flex: 1 },
    { field: "name", headerName: "Table Attribute Name", flex: 1 },
    { field: "tableHeader", headerName: "Table Header Name", flex: 1 },
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
              // onClick={() => handleEdit(params.data.id,params.data)}
              onClick={() => {
                setId(params.data.id);
                setName(params.data.name);
                setShortName(params.data.shortName);
                setTableHeader(params.data.tableHeader);
                setShowModal(true);
                console.log("reached edit");
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
    // setTableAttributes([
    //   ...tableAttributes,
    //   newAttribute
    // ]);
    if (id == null) {
      try {
        const response = await TableAttributeService.create(newAttribute);
        toast.success("Data saved successfully");
      } catch (error) {
        console.error("Error: ", error);
        toast.error(error.message);
      }
    } else {
      try {
        const response = await TableAttributeService.update(id,newAttribute);
        toast.success("Data updated successfully");
      } catch (error) {
        console.error("Error: ", error);
        toast.error(error.message);
      }
    }
    setId(null);
    setName("");
    setShortName("");
    setTableHeader("");
    loadTableAttributes();
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Attribute Management</h2>

          <p className="text-muted">Manage all table attributes.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setId(null);
            setName("");
            setShortName("");
            setTableHeader("");
            setShowModal(true);
          }}
        >
          + Add Table Attribute
        </button>
      </div>

      {/* Table */}

      {/* <div className="card shadow-sm border-0">


        <div className="card-body">


          <table className="table table-bordered table-hover align-middle">


            <thead className="table-light">

              <tr>

                <th>Name</th>

                <th>Short Name</th>

                <th>Table Header Name</th>

              </tr>


            </thead>




            <tbody>


              {tableAttributes.length === 0 ? (

                <tr>

                  <td
                    colSpan="3"
                    className="text-center"
                  >
                    No Table Attributes Added
                  </td>

                </tr>


              ) : (


                tableAttributes.map((attribute, index) => (

                  <tr key={index}>

                    <td>
                      {attribute.name}
                    </td>


                    <td>
                      {attribute.shortName}
                    </td>


                    <td>
                      {attribute.tableHeaderName}
                    </td>


                  </tr>


                ))


              )}



            </tbody>


          </table>


        </div>


      </div> */}

      <DataGrid rowData={tableAttributes} columnDefs={columnDefs} />

      <AddTableAttributeModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setId(null);
          setName("");
          setShortName("");
          setTableHeader("");
        }}
        onSave={handleSave}
        id={id}
        Inputname={name}
        InputshortName={shortName}
        InputtableHeaderName={tableHeader}
      />
    </div>
  );
}

export default TableAttributes;
