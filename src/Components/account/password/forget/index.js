import React from 'react';
import { withFirebase } from 'store/firebase';
import { LOGIN_STATE } from 'utils/constants/flags';

const INITIAL_STATE = {
  email: '',
  error: null,
}

class PasswordForgetForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTextUpdate = this.handleTextUpdate.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email } = this.state;
    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  handleTextUpdate(e) {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { email, error } = this.state;
    const isInvalid = email === '';

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            name='email'
            value={this.state.email}
            onChange={this.handleTextUpdate}
            type='text'
            placeholder='Email Address'
          />
          <button disabled={isInvalid} type='submit'>
            Reset My Password
          </button>
          {error && <p>{error.message}</p>}
        </form>
        <button
          onClick={this.props.onToggleLoginRegisterWindow}
          value={LOGIN_STATE}
        >
          Return
        </button>
      </div>

    );
  }
}




export default withFirebase(PasswordForgetForm);