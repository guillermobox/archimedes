import Archimedes from './Components/Archimedes'
import ResourceContents from "./Components/ResourceContents"
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Link, hashHistory } from "react-router";

ReactDOM.render((
<Router history={hashHistory} >
  <Route path="/" component={Archimedes}>
    <Route path="/show/:id" component={ResourceContents} />
  </Route>
</Router>
), document.getElementById('archimedes'));
