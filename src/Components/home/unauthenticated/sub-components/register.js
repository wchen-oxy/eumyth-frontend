import React, { useState } from 'react';
import { LOGIN_STATE, } from "../../../../utils/constants/flags";
import "./register.scss";

const WelcomeRegisterForm = (props) => {
  const [disableSubmit, setDisableSubmit] = useState(true);

  const checkPasswordValid = (e) => {

    if (e.target.value.length >= 6) {
      setDisableSubmit(false)
      props.onRegisterPasswordChange(e)
    }
    else {
      setDisableSubmit(true);
    }
  }
  return (
    <section>
      <div id="welcomeregisterform-form-container">
        <form onSubmit={props.onRegisterSubmit}>
          <div className="welcomeregisterform-text-input-container">
            <input
              type="text"
              placeholder="Email"
              name="email"
              autoComplete="off"
              onChange={props.onRegisterEmailChange}
            />
          </div>
          <div className="welcomeregisterform-text-input-container">
            <input
              type="password"
              placeholder="Password"
              name="password"
              autoComplete="off"
              onChange={checkPasswordValid}
            />
          </div>
          <p>{disableSubmit ? "Password must be at least 6 characters" : null}</p>
          <input
            id="welcomeregisterform-button"
            type="submit"
            value="Sign Up"
            disabled={disableSubmit}
          />
        </form>
      </div>
      <p>Already Have An Account?</p>
      <button
        id="welcomeregisterform-login"
        value={LOGIN_STATE}
        onClick={props.onToggleLoginRegisterWindow}
      >
        Sign In
        </button>
    </section>

  )
}

export default WelcomeRegisterForm;
