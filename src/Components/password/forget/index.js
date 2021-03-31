import React from 'react';
import { withFirebase } from '../../../Firebase';
import { Link } from 'react-router-dom';
import { LOGIN_STATE } from '../../constants/flags';

const PasswordForgetPage = (props) => (
  <div>
    <h4>PasswordForget</h4>
    <PasswordForgetForm onToggleLoginRegisterWindow={props.onToggleLoginRegisterWindow} />
  </div>
)

const INITIAL_STATE = {
  email: '',
  error: null,
}

class PasswordForgetFormBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTextUpdate = this.handleTextUpdate.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
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

  handleTextUpdate(event) {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, error } = this.state;
    const isInvalid = email === '';

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            name="email"
            value={this.state.email}
            onChange={this.handleTextUpdate}
            type="text"
            placeholder="Email Address"
          />
          <button disabled={isInvalid} type="submit">
            Reset My Password
        </button>
          {error && <p>{error.message}</p>}
        </form>
        <button onClick={this.props.onToggleLoginRegisterWindow} value={LOGIN_STATE} >Return</button>
      </div>

    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={'/'}>Forgot Password?</Link>
  </p>
);


export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };