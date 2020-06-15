import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import "./index.css";
import SocketContextProvider from "./context";

const Register = lazy(() => import('./routes/register'));
const Login = lazy(() => import('./routes/login'));
const Contacts = lazy(() => import('./routes/contacts'));
const Rooms = lazy(() => import('./routes/rooms'));
const Notifications = lazy(() => import('./routes/notifications'));

function App() {
  return (
    <Router>
      <SocketContextProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/rooms" component={Rooms} />
            <Route exact path="/contacts" component={Contacts} />
            <Route exact path="/notifications" component={Notifications} />
          </Switch>
        </Suspense>
      </SocketContextProvider >
    </Router>
  )
}

export default App;
