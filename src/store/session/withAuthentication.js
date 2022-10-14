import React from 'react';
import { AuthUserContext } from './context';
import { withFirebase } from '../firebase/context';
import AxiosHelper from 'utils/axios';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        authUser: null,
        isLoading: true,
        mongoError: false,
      };
      this.createUserInfoObject = this.createUserInfoObject.bind(this);
      this.saveUserInfoObject = this.saveUserInfoObject.bind(this);
    }

    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          authUser ?
            this.createUserInfoObject(authUser)
            :
            this.saveUserInfoObject(false);
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    createUserInfoObject(authUser) {
      if (!authUser.displayName) {
        const combined = {
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          uid: authUser.uid,
        }
        return this.saveUserInfoObject(true, combined)
      }
      return AxiosHelper.returnIndexUser(authUser.displayName, true)
        .then(result => {
          const combined = {
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            uid: authUser.uid,
            ...result.data
          }
          this.saveUserInfoObject(true, combined)
        })
        .catch(err => {
          console.log(err);
          if (err.response.status === 404) {
            const combined = {
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              uid: authUser.uid
            }
            this.saveUserInfoObject(true, combined)
          }
          else {
            this.setState({ isLoading: false, mongoError: true })
          }
        })

    }

    saveUserInfoObject(hasCompletedRegistration, object) {
      if (hasCompletedRegistration) {
        this.setState({ authUser: object, isLoading: false })
      }
      else {
        this.setState({ authUser: null, isLoading: false });
      }
    }

    render() {
      const { isLoading } = this.state;
      if (isLoading) {
        return <p>Loading ... </p>
      }
      if (this.state.mongoError) {
        return <p>You are authenticated but we cannot reach our servers at the moment. Please Contact 88developers@gmail.com</p>
      }
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;