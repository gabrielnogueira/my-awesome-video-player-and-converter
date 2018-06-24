import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch, Redirect} from  'react-router-dom';

import './index.css';

import App from './App';

ReactDOM.render(
    <BrowserRouter>
        <div>
        <Switch>
            <Route exact path='/videos' component={App} />
            <Route path='/videos/:id' component={App} />
            <Redirect to="/videos" />
        </Switch>
        </div>
    </BrowserRouter>, document.getElementById('root'));
