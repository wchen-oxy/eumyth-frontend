import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './Components/home/index';
import AccountPage from './Components/account';
import { withAuthentication } from './Components/session';
import Navbar from './Components/navbar/index';
import ProfilePage from './Components/profile';
import Test from "./Components/test";
import './App.scss';

const App = () => {
      const [modalState, setModalState] = useState(null);
      const masterModalRef = useRef(null);

      const openModal = (type) => {
            console.log(type);
            if (masterModalRef.current) {
                  masterModalRef.current.style.display = "block";
            }
            document.body.style.overflow = "hidden";
            setModalState(type);
      };

      const closeModal = () => {
            masterModalRef.current.style.display = "none";
            document.body.style.overflow = "visible";
            setModalState(null);
      };

      const returnModalStructure = (content, closeModalFunction) => {
            return (
                  <div>
                        <div
                              className="overlay"
                              onClick={closeModalFunction}>
                        </div>
                        <span
                              className="close"
                              onClick={closeModalFunction}>
                              X    </span>
                        {content}
                  </div>
            );

      };

      return (
            <Router>
                  <Navbar
                        returnModalStructure={returnModalStructure}
                        openMasterModal={openModal}
                        closeMasterModal={closeModal}
                        modalState={modalState}

                  />
                  <Switch>
                        <Route exact path='/'
                              render={(props) =>
                                    <HomePage
                                          {...props}
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                    />
                              }
                        />
                        <Route exact path='/account' component={AccountPage} />
                        <Route exact path='/test' component={Test} />
                        <Route exact path='/u/:username'
                              render={(props) =>
                                    <ProfilePage
                                          {...props}
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}

                                    />
                              }
                        />
                        <Route exact path='/p/:postID' render={(props) =>
                              <ProfilePage
                                    {...props}
                                    returnModalStructure={returnModalStructure}
                                    openMasterModal={openModal}
                                    closeMasterModal={closeModal}
                                    modalState={modalState}

                              />
                        } />

                        {/* <Route exact path = '/:username/pursuit/:pursuit' component={DetailedPursuit} /> */}
                  </Switch>
                  <div className="modal" ref={masterModalRef} >

                  </div>
            </Router>
      )
}



export default withAuthentication(App);
