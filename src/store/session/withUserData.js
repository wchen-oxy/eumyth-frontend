import { UserDataContext } from './context';
import AxiosHelper from '../../utils/axios';
import React from 'react';
import { withFirebase } from '../firebase';

const withUserData = Component => {
    class WithUserData extends React.Component {
        constructor(props) {
            super(props)
            this.state = {
                indexUserData: null
            }
        }
        componentDidMount() {
            console.log('Mounted data');
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {

                    return AxiosHelper.returnIndexUser(authUser.displayName)
                        .then(result => this.setState({ indexUserData: result }))
                        .catch((err) => console.log(err));
                }
            )
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
                <UserDataContext.Provider value={this.state.indexUserData}>
                    <Component {...this.props} />
                </UserDataContext.Provider>
            );
        }
    }

    return withFirebase(WithUserData)
}

export default withUserData;