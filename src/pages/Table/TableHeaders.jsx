import { useState,useEffect } from "react";
import "./TableHeaders.css";
import AddTableHeaderModal from "./AddTableHeaderModal";
import TableHeaderService from "../../services/TableHeaderService";
import toast from "react-hot-toast";
import DataGrid from "../../components/DataGrid";

function TableHeaders() {

  const [showModal, setShowModal] = useState(false);

  const [tableHeaders, setTableHeaders] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");

  const handleSave = async (newTableHeader) => {
    try {
          if(id==null)
          {
            const response = await TableHeaderService.create(newTableHeader);
            toast.success("Data saved successfully");
          }
          else
          {
            const reposnse = await TableHeaderService.update(id, newTableHeader);
            const data = await reposnse.data;
            toast.success("Data updated successfully");
          }
          setId(null);
          setName("");
          setShowModal(false);
          loadTableHeaders();
        } catch (error) {
          console.error("Error: ", error);
          toast.error(error.message);
        }
  };

  const handleDelete = async (id) => {
    try {
      const reposnse = await TableHeaderService.delete(id);
      const data = await reposnse.data;
      toast.success("Data deleted successfully");
    } catch (error) {
      console.error("Error: ", error);
      toast.error(error.message);
    }
    loadTableHeaders();
  };

  useEffect(()=>{
    loadTableHeaders();
  },[])

  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;
      const allTableNames = data.map((obj)=>({"name":obj.name,"id":obj.headerId}));
      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ",error);
      toast.error(error.message);
    }
  }

  const columnDefs = [
    { field: "id", headerName: "ID", width: 80, flex: 1 },
    { field: "name", headerName: "Institute Name", flex: 1, minWidth: 160 },
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



        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >

          + Add Table Header

        </button>


      </div>


    <DataGrid rowData={tableHeaders} columnDefs={columnDefs} />



      <AddTableHeaderModal

        show={showModal}

        onClose={() => {
          setShowModal(false);
          setId(null);
          setName(null);
        }}
        onSave={handleSave}
        Inputdata={name}

      />


    </div>

  );

}


export default TableHeaders;