import React from 'react';
import { LOGIN_STATE, } from "../../../constants/flags";
import "./register.scss";

const WelcomeRegisterForm = (props) => (
  <section>
    <div id="welcomeregisterform-form-container">
      <form onSubmit={props.onRegisterSubmit}>
        <div className="welcomeregisterform-text-input-container">
          <input type="text" placeholder="Email" name="email" autoComplete="off" onChange={props.onRegisterEmailChange} />
        </div>
        <div className="welcomeregisterform-text-input-container">
          <input type="password" placeholder="Password" name="password" autoComplete="off" onChange={props.onRegisterPasswordChange} />
        </div>
        <input id="welcomeregisterform-button" type="submit" value="Sign Up" />
      </form>
    </div>
    <button id="welcomeregisterform-login" value={LOGIN_STATE} onClick={props.onToggleLoginRegisterWindow}>Sign In</button>
  </section>

)


export default WelcomeRegisterForm;
