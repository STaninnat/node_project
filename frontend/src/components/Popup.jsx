import PropTypes from "prop-types";
import "remixicon/fonts/remixicon.css";
import "./Popup.css";

function Popup(props) {
  const { isVisible, onClose, title, children } = props;
  if (!isVisible) return null;

  return (
    <div className="popup">
      <div className="popup-bg" onClick={onClose} />
      <div className="popup-content">
        <i className="ri-close-circle-fill close-icon" onClick={onClose}></i>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

Popup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};

export default Popup;
