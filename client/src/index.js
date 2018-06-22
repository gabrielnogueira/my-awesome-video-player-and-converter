import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route} from  'react-router-dom';

import './index.css';

import App from './App';

ReactDOM.render(
    <BrowserRouter>
        <div>
            <Route exact path='/' component={App} />
            <Route exact path='/videos' component={App} />
            <Route path='/videos/:id' component={App} />
        </div>
    </BrowserRouter>, document.getElementById('root'));
