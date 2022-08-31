import React from 'react';
import { PASSWORD_STATE, REGISTER_STATE } from "../../../../utils/constants/flags";

const WelcomeLoginForm = (props) =>
(
  <section>
    <div id="welcomeloginform-form" className='btn-switch'>
      <form onSubmit={props.onLoginSubmit}>
        <div className="welcomeloginform-text">
          <input
            type="text"
            placeholder="Email"
            className='input-text'
            name="email"
            autoComplete="off"
            onChange={props.onLoginEmailChange}
          />
        </div>
        <div className="welcomeloginform-text">
          <input
            type="password"
            placeholder="Password"
            className='input-text'
            name="password"
            autoComplete="off"
            onChange={props.onLoginPasswordChange}
          />
        </div>
        <input
          className="welcomeloginform-button btn-hero"
          type="submit"
          value="Log in"
        />
      </form>
      <button
        id="welcomelogin-forgot"
        value={PASSWORD_STATE}
        onClick={props.onToggleLoginRegisterWindow}
      >
        Forget Password?
      </button>
    </div>
    <p>Don't Have An Account?</p>
    <button
      value={REGISTER_STATE}
      onClick={props.onToggleLoginRegisterWindow}
    >
      Create Account
    </button>
  </section>
)




export default WelcomeLoginForm;
