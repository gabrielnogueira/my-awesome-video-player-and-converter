import React from 'react';
import ReactDOM from 'react-dom';
import Player from './Player';
import { shallow } from 'enzyme';

import '../../setupTests';

it('should render without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Player />, div);
    ReactDOM.unmountComponentAtNode(div);
});