import React, { useState } from 'react';
import HomePage from './components/home/index';
import AccountPage from './components/account';
import Navbar from './components/navbar/index';
import ProfilePage from './components/profile';
import GeoSearch from 'components/geo-search';
import Published from 'components/published';
import Test from './components/test';
import { withAuthentication } from './store/session';
import {
      BrowserRouter,
      Router,
      Routes,
      Route
} from 'react-router-dom';
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
                  <div style={{height: '100vh'}}>
                        <div
                              className='overlay'
                              onClick={() => closeModalFunction()}>
                        </div>
                        <span
                              className='close'
                              onClick={() => closeModalFunction()}>
                              X    </span>
                        {content}
                  </div>
            );
      };
      return (
            <BrowserRouter>
                  <Navbar
                        returnModalStructure={returnModalStructure}
                        openMasterModal={openModal}
                        closeMasterModal={closeModal}
                        modalState={modalState}
                  />
                  <Routes>
                        <Route path='/'
                              element={
                                    <HomePage
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                          keyProp={Math.random()}
                                    />
                              }
                        />
                        <Route path='account' element={<AccountPage />} />
                        {/* <Route exact path='test' element={Test} /> */}
                        <Route path='works'
                              element={
                                    <Published
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                    />
                              }
                        />
                        <Route path='search'
                              element={
                                    <GeoSearch
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}

                                    />
                              }
                        />

                        <Route path='u/:username'
                              element={
                                    <ProfilePage
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                    />
                              }
                        />
                        <Route path='u/:username/threads'
                              element={
                                    <ProfilePage
                                          returnModalStructure={returnModalStructure}
                                          openMasterModal={openModal}
                                          closeMasterModal={closeModal}
                                          modalState={modalState}
                                          isProjectView={true}
                                    />
                              }
                        />
                        <Route path='p/:postID' element={
                              <ProfilePage
                                    returnModalStructure={returnModalStructure}
                                    openMasterModal={openModal}
                                    closeMasterModal={closeModal}
                                    modalState={modalState}
                                    isProjectView={false}

                              />
                        } />
                        <Route path='c/:projectID' element={
                              <ProfilePage
                                    returnModalStructure={returnModalStructure}
                                    openMasterModal={openModal}
                                    closeMasterModal={closeModal}
                                    modalState={modalState}
                                    isProjectView={false}
                              />
                        } />
                  </Routes>

            </BrowserRouter>
      )
}



export default withAuthentication(App);
