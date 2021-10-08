import React from 'react';
import InitialCustomizationPage from './initial-customization'
import ReturningUserPage from './returning-user';
import { withAuthorization } from '../../../store/session';
import { withFirebase } from '../../../store/firebase';

class UserHomePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            isNewUser: null
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.props.firebase.checkIsExistingUser()
            .then(
                result => {
                    if (this._isMounted) {
                        result ? this.setState({ isNewUser: false })
                            : this.setState({ isNewUser: true });
                    }
                }
            );
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        if (this.state.isNewUser === null) {
            return (<div>Grabbing User Info</div>);
        }
        return (this.state.isNewUser ?
            <InitialCustomizationPage /> :
            <ReturningUserPage
                returnModalStructure={this.props.returnModalStructure}
                openMasterModal={this.props.openMasterModal}
                closeMasterModal={this.props.closeMasterModal}
                modalState={this.props.modalState}
            />
        );
    }
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(UserHomePage));
