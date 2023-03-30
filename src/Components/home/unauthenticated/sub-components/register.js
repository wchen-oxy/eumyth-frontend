import React, { useState } from 'react';
import { LOGIN_STATE, } from "../../../../utils/constants/flags";

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
      <div id="welcomeregisterform-form">
        <form onSubmit={props.onRegisterSubmit}>
          <div className="welcomeregisterform-text">
            <input
              type="text"
              placeholder="Email"
              className='input-text'
              name="email"
              autoComplete="off"
              onChange={props.onRegisterEmailChange}
            />
          </div>
          <div className="welcomeregisterform-text">
            <input
              type="password"
              placeholder="Password"
              className='input-text'
              name="password"
              autoComplete="off"
              onChange={checkPasswordValid}
            />
          </div>
          <p>{disableSubmit ? "Password must be at least 6 characters" : null}</p>
          <input
            id="welcomeregisterform-register"
            className={disableSubmit ? 'btn-hero-disabled' : 'btn-hero'}
            type="submit"
            value="Sign Up"
            disabled={disableSubmit}
          />
        </form>
      </div>
      <div className='welcomeregisterform-onboard'>
        <p>Already Have An Account?</p>
        <button
          className='welcomeregisterform-button'
          value={LOGIN_STATE}
          onClick={props.onToggleLoginRegisterWindow}
        >
          Sign In
        </button>
      </div>
    </section>

  )
}

export default WelcomeRegisterForm;
