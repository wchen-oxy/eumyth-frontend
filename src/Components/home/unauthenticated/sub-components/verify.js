import React, { useState } from 'react';

const VerifyForm = (props) => {
    const [sentIndicator, setSentIndicator] = useState(null);
    return (
        <div id="verifyform">
            {
                sentIndicator ?
                    <p>If you have verified your email, please refresh the page. </p>
                    :
                    <p>
                        It looks like you haven't verified your account just yet.
                        Please check your email's inbox or junk folder to verify your account.
                        If you have already, return to login or refresh this page.
                    </p>
            }
            <p>{sentIndicator}</p>
            <button id="verifyform-resend" className="btn-hero" onClick={(e) => {
                setSentIndicator(
                    `Email has been sent! Once you verify 
                    your email, try refreshing the page.`)
                return props.onSendEmailVerification(e);
            }}>
                Resend Email
            </button>
            <div id="verifyform-relogin">
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
