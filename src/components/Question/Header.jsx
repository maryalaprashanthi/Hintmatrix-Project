import { Navbar, Container, Button } from "react-bootstrap";
import {
  FaBars,
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";

function Header() {
  return (
    <>
      <Navbar bg="white" className="shadow-sm border-bottom py-3 my-4">
        <Container fluid>
          {/* Left Side */}
          <div className="d-flex align-items-center">
            <FaBars size={22} className="me-3 text-secondary" />

            <div>
              <h3 className="fw-bold mb-1">Q4: Prepare Final Accounts</h3>

              <small className="text-muted">
                Complete the following accounts to prepare final accounts of the
                business.
              </small>
            </div>
          </div>

          {/* Right Side */}
          <div className="d-flex gap-2">
            <Button variant="light">
              <FaRedo className="me-2" />
              Reset
            </Button>

            <Button variant="warning">
              <FaExclamationTriangle className="me-2" />
              Check Mistakes
            </Button>

            <Button variant="success">
              <FaSave className="me-2" />
              Save
            </Button>

            <Button variant="primary">
              <FaPaperPlane className="me-2" />
              Submit
            </Button>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
