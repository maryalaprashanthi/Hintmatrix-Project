import { Navbar, Container, Button } from "react-bootstrap";
import useQuestionStore from "./questionStore";
import {
  FaBars,
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";

function Header() {
  const { question } = useQuestionStore();
  console.log("Header Question:", question);
  return (
    <>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap">
          {/* Left */}
          <div className="flex-grow-1 pe-3">
            <h4 className="fw-bold mb-1">
              {question
                ? `Q${question.questionId}: ${question.questionText}`
                : "Loading..."}
            </h4>

            <small className="text-muted">
              {question &&
                `${question.courseName} • ${question.chapterName} • ${question.categoryName}`}
            </small>
          </div>

          {/* Right */}
          <div className="d-flex gap-2 flex-shrink-0">
            <Button
              variant="light"
              size="sm"
              style={{ minWidth: "95px", height: "35px" }}
            >
              <FaRedo className="me-1" />
              Reset
            </Button>

            <Button
              variant="warning"
              size="sm"
              style={{ minWidth: "95px", height: "35px" }}
            >
              <FaExclamationTriangle className="me-1" />
              Check
            </Button>

            <Button
              variant="success"
              size="sm"
              style={{ minWidth: "95px", height: "35px" }}
            >
              <FaSave className="me-1" />
              Save
            </Button>

            <Button
              variant="primary"
              size="sm"
              style={{ minWidth: "95px", height: "35px" }}
            >
              <FaPaperPlane className="me-1" />
              Submit
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Header;
