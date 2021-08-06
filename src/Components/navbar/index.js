import React from 'react';
import OptionsMenu from "./sub-components/options-menu";
import { AuthUserContext } from '../../Components/session/'
import NavigationAuthorized from './navigation-authorized';
import NavigationUnauthorized from './navigation-unauthorized';

const NavBar = (props) => {
  return (
    <AuthUserContext.Consumer>
      {authUser =>
        authUser && authUser.emailVerified ?
          <NavigationAuthorized
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