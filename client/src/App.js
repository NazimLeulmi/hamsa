import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch,Redirect } from 'react-router-dom';
import "./index.css";
import SocketContextProvider from "./context";

const Register = lazy(() => import('./routes/register'));
const Login = lazy(() => import('./routes/login'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <SocketContextProvider>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/register" component={Register} />
          </Switch>
        </SocketContextProvider>
      </Suspense>
    </Router>
  )
}

export default App;
