import { useState } from "react";
import AddTableAttributeModal from "./AddTableAttributeModal";
import "./TableAttributes.css";

function TableAttributes() {

  const [showModal, setShowModal] = useState(false);

  const [tableAttributes, setTableAttributes] = useState([]);



  const handleSave = (newAttribute) => {

    setTableAttributes([
      ...tableAttributes,
      newAttribute
    ]);

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



        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Table Attribute
        </button>


      </div>





      {/* Table */}

      <div className="card shadow-sm border-0">


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


      </div>





      <AddTableAttributeModal

        show={showModal}

        onClose={() => setShowModal(false)}

        onSave={handleSave}

      />


    </div>


  );

}


export default TableAttributes;