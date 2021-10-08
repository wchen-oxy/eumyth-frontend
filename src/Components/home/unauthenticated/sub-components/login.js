import React from 'react';
import { PASSWORD_STATE, REGISTER_STATE } from "../../../../utils/constants/flags";
import "./login.scss";

const WelcomeLoginForm = (props) =>
(
  <section>
    <div id="welcomeloginform-form-container">
      <form onSubmit={props.onLoginSubmit}>
        <div className="welcomeloginform-text-input-container">
          <input
            type="text"
            placeholder="Email"
            name="email"
            autoComplete="off"
            onChange={props.onLoginEmailChange}
          />
        </div>
        <div className="welcomeloginform-text-input-container">
          <input
            type="password"
            placeholder="Password"
            name="password"
            autoComplete="off"
            onChange={props.onLoginPasswordChange}
          />
        </div>
        <input
          id="welcomeloginform-login-button"
          className="welcomeloginform-button"
          type="submit"
          value="Log in"
        />
      </form>
      <button
        id="welcomelogin-forgot-button"
        value={PASSWORD_STATE}
        onClick={props.onToggleLoginRegisterWindow}
      >
        Forget Password?
        </button>
    </div>
    <p>Don't Have An Account?</p>
    <button
      id="welcomeloginform-switch-button"
      value={REGISTER_STATE}
      onClick={props.onToggleLoginRegisterWindow}
    >
      Create Account
       </button>
  </section>
)




export default WelcomeLoginForm;
