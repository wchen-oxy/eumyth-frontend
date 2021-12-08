import React, { Component } from 'react';
import { withFirebase } from '../../../../store/firebase';
import './index.scss';

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
}

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };

    this.handlePasswordUpdateSubmit = this.handlePasswordUpdateSubmit.bind(this);
    this.handleTextUpdate = this.handleTextUpdate.bind(this);
  }

  handlePasswordUpdateSubmit(event) {
    event.preventDefault();
    const { passwordOne } = this.state;
    this.props.firebase
      .doPasswordUpdate(passwordOne)
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
    const { passwordOne, passwordTwo, error } = this.state;
    const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

    return (
      <div id='passwordchangeform-container'>
        <label>Update Password</label>
        <form onSubmit={this.handlePasswordUpdateSubmit}>
          <input
            name='passwordOne'
            value={passwordOne}
            onChange={this.handleTextUpdate}
            type='password'
            placeholder='New Password'
          />
          <input
            name='passwordTwo'
            value={passwordTwo}
            onChange={this.handleTextUpdate}
            type='password'
            placeholder='Confirm New Password'
          />
          <button
            id='passwordchangeform-reset-button'
            disabled={isInvalid}
            type='submit'
          >
            Reset My Password
          </button>
          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }
}

export default withFirebase(PasswordChangeForm);