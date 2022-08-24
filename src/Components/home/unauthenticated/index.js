import React from 'react';
import Isemail from 'isemail';
import WelcomeLoginForm from './sub-components/login';
import WelcomeRegisterForm from './sub-components/register';
import PasswordForgetForm from 'components/account/password/forget/index';
import VerifyForm from './sub-components/verify';
import { LOGIN_STATE, PASSWORD_STATE, REGISTER_STATE } from 'utils/constants/flags';

const INITIAL_STATE = {
  currentUser: '',
  email: '',
  password: '',
  test: '',
  error: null,
  window: LOGIN_STATE,
  loggedIn: false,
  verified: null,
  showRegisterSuccess: false,
}

export default class WelcomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    }

    this.handleWindowToggle = this.handleWindowToggle.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.handleSendEmailVerication = this.handleSendEmailVerication.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleRegisterSuccess = this.handleRegisterSuccess.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleVerifiedState = this.handleVerifiedState.bind(this);
    this.renderLoginRegister = this.renderLoginRegister.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.props.firebase.auth.onAuthStateChanged(
        (user) => {
          if (user) {
            this.setState({
              currentUser: user,
              verified: user.emailVerified
            })
          }
          else {
            this.setState({
              currentUser: null,
              verified: false
            })
          }
        }
      )
    }
  }


  handleTextChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }

  handleRegisterSuccess(e) {
    e.preventDefault();
    this.setState(state => ({
      showRegisterSuccess: !state.showRegisterSuccess
    }));
  }

  handleSignOut(e) {
    e.preventDefault();
    this.props.firebase.doSignOut().then(this.setState({
      ...INITIAL_STATE
    }));
  }

  handleSendEmailVerication(e) {
    e.preventDefault();
    this.props.firebase.doSendEmailVerification();
    alert(
      `Email has been sent! Once you verify 
      your email, try refreshing the page.`);
  }

  handleVerifiedState(isVerified) {
    if (this.state.currentUser) {
      this.setState({
        verified: isVerified
      })
    }
  }

  handleWindowToggle(e) {
    e.preventDefault();
    this.setState({
      window: e.target.value
    });
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    if (!Isemail.validate(this.state.email)) {
      return alert('This is not a valid email!');
    }
    this.props.firebase.doSignIn(this.state.email, this.state.password)
      .then((result) => {
        if (result) {
          if (result.user.emailVerified) this.props.navigate('/', { replace: true });
          else {
            this.handleVerifiedState(result.user.emailVerified);
          }

        }
      });
  }

  handleRegisterSubmit(e) {
    e.preventDefault();
    if (!Isemail.validate(this.state.email)) {
      alert('This is not a valid email!')
    }
    else if (this.state.password.length < 6) {
      alert('Password is too short!');
    }
    else {
      this.props.firebase.doCreateUser(this.state.email, this.state.password)
        .then(
          () => this.setState({ showRegisterSuccess: true })
        )
        .catch((err) => console.log(err));
    }
  }

  renderLoginRegister(state) {
    if (this.state.currentUser && !this.state.verified) {
      return (
        <div className='welcome-side'>
          <VerifyForm
            onToggleLoginRegisterWindow={this.handleWindowToggle}
            onSendEmailVerification={this.handleSendEmailVerication}
            onSignOut={this.handleSignOut}
          />
        </div>);
    }

    if (state === REGISTER_STATE)
      return (
        <div className='welcome-side'>
          <WelcomeRegisterForm
            onToggleLoginRegisterWindow={this.handleWindowToggle}
            onRegisterEmailChange={this.handleTextChange}
            onRegisterPasswordChange={this.handleTextChange}
            onRegisterSubmit={this.handleRegisterSubmit}
          />
        </div>
      );

    else if (state === LOGIN_STATE) {
      return (
        <div className='welcome-side'>
          <WelcomeLoginForm
            onToggleLoginRegisterWindow={this.handleWindowToggle}
            onLoginEmailChange={this.handleTextChange}
            onLoginPasswordChange={this.handleTextChange}
            onLoginSubmit={this.handleLoginSubmit}
          />
        </div>);

    }
    else if (state === PASSWORD_STATE) {
      return (
        <div className='welcome-side'>
          <PasswordForgetForm
            onToggleLoginRegisterWindow={this.handleWindowToggle}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <section className='welcome-description'>
        <div className='welcome-description-inner'>
          <p>Welcome to interestHub! Login or sign up to get started!</p>
          <br></br>
          <p>(to try out this without signing up, use this test account)</p>
          <br></br>
          <p>(email: williamshengchen8@gmail.com, password: 123123)</p>
        </div>
        {this.renderLoginRegister(this.state.window)}
      </section>
    )
  }
}

