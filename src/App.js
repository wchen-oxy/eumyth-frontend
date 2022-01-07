import React, { useState } from 'react';
import HomePage from './components/home/index';
import AccountPage from './components/account';
import Navbar from './components/navbar/index';
import ProfilePage from './components/profile';
import GeoSearch from 'components/geo-search';
import Test from './components/test';
import { withAuthentication } from './store/session';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';

const App = () => {
      const [modalState, setModalState] = useState(null);
      const openModal = (type) => {
            document.body.style.overflow = 'hidden';
            setModalState(type);
      };

      const closeModal = () => {
            document.body.style.overflow = 'visible';
            setModalState(null);
      };

      const returnModalStructure = (content, closeModalFunction) => {
            return (
                  <div>
                        <div
                              className='overlay'
                              onClick={closeModalFunction}>
                        </div>
                        <span
                              className='close'
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
                        <Route exact path='/search' component={GeoSearch} />
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
