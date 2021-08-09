import React from 'react';
import { AuthUserContext } from './context';
import { withFirebase } from '../../Firebase/context';
import AxiosHelper from '../../Axios/axios';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        authUser: null,
        isLoading: true,
      };
      this.createUserInfoObject = this.createUserInfoObject.bind(this);
      this.saveUserInfoObject = this.saveUserInfoObject.bind(this);
    }

    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          authUser ?
            this.createUserInfoObject(authUser.displayName, authUser)
            :
            this.saveUserInfoObject(false);
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    createUserInfoObject(username, authUser) {
      return AxiosHelper.returnIndexUser(username)
        .then(result => {
          const combined = {
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            uid: authUser.uid,
            ...result.data
          }
          this.saveUserInfoObject(true, combined)
        })

    }

    saveUserInfoObject(doesUserExist, object) {
      if (doesUserExist) {
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