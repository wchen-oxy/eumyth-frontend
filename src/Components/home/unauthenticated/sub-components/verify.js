import React, { useState } from 'react';
import { REGISTER_STATE } from '../../../constants/flags';

const VerifyForm = (props) => {
    const [sentIndicator, setSentIndicator] = useState("");
    return (
        <div className="welcome-hero-side-container">
            <p>If you have verified your email, please refresh the page. </p>
            <p>{sentIndicator}</p>
            <button onClick={(e) => {
                setSentIndicator(
                    `Email has been sent! Once you verify 
                    your email, try refreshing the page.`)
                return props.onSendEmailVerification(e);
            }}>
                Resend Email
                </button>
            <div>
                <button
                    value={REGISTER_STATE}
                    onClick={props.onLoginRegisterToggle}
                >
                    Register
                    </button>
                <button
                    onClick={props.onSignOut}
                >
                    Return to Login
                    </button>
            </div>
        </div>
    );
}

export default VerifyForm;
