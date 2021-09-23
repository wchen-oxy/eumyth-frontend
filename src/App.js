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
      const openModal = (type) => {      
            document.body.style.overflow = "hidden";
            setModalState(type);
      };

      const closeModal = () => {
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
                                          keyProp={Math.random()}
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
                        <Route exact path='/u/:username/project'
                              render={(props) =>
                                    <ProfilePage
                                          {...props}
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                          isProjectView={true}
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
                                    isProjectView={false}

                              />
                        } />
                        <Route exact path='/c/:projectID' render={(props) =>
                              <ProfilePage
                                    {...props}
                                    returnModalStructure={returnModalStructure}
                                    openMasterModal={openModal}
                                    closeMasterModal={closeModal}
                                    modalState={modalState}
                                    isProjectView={false}
                              />
                        } />
                  </Switch>

            </Router>
      )
}



export default withAuthentication(App);
