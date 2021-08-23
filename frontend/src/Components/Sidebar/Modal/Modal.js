import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import "./Modal.css";

const Modal = props => {
  const closeOnEscapeKeyDown = e => {
    if ((e.charCode || e.keyCode) === 27) {
      props.onClose();
    }
  };

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  const ref = useRef()
  
  useEffect(() => {
    const checkIfClickedOutside = e => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (props.show && ref.current && !ref.current.contains(e.target)) {
        props.onClose()
      }
    }
    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [props.show])

  return ReactDOM.createPortal(
	<CSSTransition
		in={props.show}
		unmountOnExit
		timeout={{ enter: 0, exit: 300 }}
	>
      <div className="modal" onClick={props.onClose} >
        <div className="modal-content" onClick={e => e.stopPropagation()} ref={ref} >
          <div className="modal-header">
            <h4 className="modal-title">{props.title}</h4>
          </div>
          <div className="modal-body">{props.children}</div>

        </div>
      </div>
    </CSSTransition>,
    document.getElementById("root")
  );
};

export default Modal;
