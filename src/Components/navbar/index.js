import React from 'react';
import { AuthUserContext } from '../../Components/session/'
import NavigationAuthorized from './navigation-authorized';
import NavigationUnauthorized from './navigation-unauthorized';

const NavBar = (props) => {
  return (
    <AuthUserContext.Consumer>
      {authUser =>
        authUser && authUser.emailVerified ?
          <NavigationAuthorized
            authUser={authUser}
            returnModalStructure={props.returnModalStructure}
            openMasterModal={props.openMasterModal}
            closeMasterModal={props.closeMasterModal}
            modalState={props.modalState}
          /> : <NavigationUnauthorized />
      }
    </AuthUserContext.Consumer>
  );
}

export default NavBar;