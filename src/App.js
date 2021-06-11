import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './Components/home/index';
import AccountPage from './Components/account';
import { withAuthentication } from './Components/session';
import Navbar from './Components/navbar/index';
import ProfilePage from './Components/profile';
import Test from "./Components/test";
import './App.scss';

const App = () => {
      const [shouldFloatNavbar, setShouldFloatNavbar] = useState(false);
      return (
            <Router>
                  <Navbar shouldFloatNavbar={shouldFloatNavbar} onFloatNavbarChange={setShouldFloatNavbar} />
                  <Switch>
                        <Route exact path='/' component={HomePage} />
                        <Route exact path='/account' component={AccountPage} />
                        <Route exact path='/test' component={Test} />

                        {/* <Route exact path ='/new' component={NewPost} /> */}
                        {/* <Route exact path = '/pursuit' component={PursuitPage}/> */}
                        <Route exact path='/u/:username'
                              render={(props) =>
                                    <ProfilePage
                                          {...props}
                                          shouldFloatNavbar={shouldFloatNavbar}
                                          onFloatNavbarChange={setShouldFloatNavbar}
                                    />
                              }
                        />
                        <Route exact path='/p/:postID' component={ProfilePage} />

                        {/* <Route exact path = '/:username/pursuit/:pursuit' component={DetailedPursuit} /> */}
                  </Switch>
            </Router>
      )
}



export default withAuthentication(App);
