import React from "react";
import CheckMistakes from "./CheckMistakes";
import { Button, Modal } from "react-bootstrap";
import useQuestionStore from "./questionStore";

const MistakesModal = ({ questionId, setCheckMistakes, checkMistakes }) => {
  const handleClose = () => {
    setCheckMistakes(false); // Reset the showCheckMistakes state when closing the modal
  };

  return (
    <div className="row g-4 align-items-start">
      <Modal
        show={checkMistakes}
        onHide={handleClose}
        centered
        backdrop={true}
        size="xl"
        contentClassName="check-mistakes-modal"
      >
        <Modal.Header closeButton className="check-mistakes-header">
          <Modal.Title className="check-mistakes-title">
            Check Mistakes
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CheckMistakes userId={1} questionId={questionId} />
        </Modal.Body>

        <Modal.Footer className="check-mistakes-footer">
          <Button className="close-fix-btn" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MistakesModal;
