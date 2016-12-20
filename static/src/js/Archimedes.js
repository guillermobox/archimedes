import Archimedes from './Components/Archimedes'
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Link, hashHistory } from "react-router";

ReactDOM.render((
<Router history={hashHistory} >
  <Route path="/" component={Archimedes} />
</Router>
), document.getElementById('archimedes'));
