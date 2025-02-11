import { useState } from "react";
import PropTypes from "prop-types";

import "../templates/Popup.css";

function LoginForm(props) {
  const {
    onSubmit,
    formClass,
    message,
    error: externalError,
    setPopupType,
    popupType,
    rememberMe,
    setRememberMe,
  } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setPopupType({ type: popupType?.type, error: null });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPopupType({ type: popupType?.type, error: null });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      username,
      password,
      rememberMe,
    };

    onSubmit(formData);
  };

  return (
    <form
      data-testid="login-form"
      onSubmit={handleSubmit}
      className={`form-container ${formClass}`}
      autoComplete="off"
    >
      <h2>Sign in</h2>
      <label>
        <h3>Username:</h3>
        <input
          type="text"
          name="username"
          placeholder="username"
          value={username}
          onChange={handleUsernameChange}
          required
        />
      </label>

      <label>
        <h3>Password:</h3>
        <input
          type="password"
          name="password"
          placeholder="password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
      </label>

      <label className="rememberme-conditions">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={handleRememberMeChange}
        />
        <span>Remember me?</span>
      </label>

      <div className="form-login-message">
        {externalError && <p className="error-message">{externalError}</p>}
        {message && <p className="complete-message">{message}</p>}
      </div>

      <button
        data-testid="loginform-signin-button"
        type="submit"
        disabled={!username || !password}
      >
        Sign In
      </button>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  formClass: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.string,
  setPopupType: PropTypes.func.isRequired,
  popupType: PropTypes.object.isRequired,
  rememberMe: PropTypes.bool,
  setRememberMe: PropTypes.func,
};

export default LoginForm;
