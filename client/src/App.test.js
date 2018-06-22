import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { shallow } from 'enzyme';

import './setupTests';

it('should render without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('should not display player without video datasource', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.find('Player').length).toBe(0);
});

it('should display player with video datasource', () => {
  const wrapper = shallow(<App />);
  const videos = [{
    name: 'Disney\'s Oceans 1',
    description: 'Explore the depths of our planet\'s oceans. ' +
      'Experience the stories that connect their world to ours. ' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
      'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
      'aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
      'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
      'dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
      'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
      'proident, sunt in culpa qui officia deserunt mollit anim id est ' +
      'laborum.',
    duration: 45,
    sources: [
      { src: 'http://storage.googleapis.com/mavpac-48492.appspot.com/converted%2Fid1-Bear.mp4' , type: 'video/mp4' },
    ],
    // you can use <picture> syntax to display responsive images
    thumbnail: [
      {
        srcset: 'test/example/oceans.jpg',
        type: 'image/jpeg',
        media: '(min-width: 400px;)'
      },
      {
        src: 'test/example/oceans-low.jpg'
      }
    ]
  },{
    name: 'Disney\'s Oceans 2',
    description: 'Explore the depths of our planet\'s oceans. ' +
      'Experience the stories that connect their world to ours. ' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
      'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
      'aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
      'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
      'dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
      'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
      'proident, sunt in culpa qui officia deserunt mollit anim id est ' +
      'laborum.',
    duration: 45,
    sources: [
      { src: 'http://vjs.zencdn.net/v/oceans.mp4', type: 'video/mp4' },
    ],
    // you can use <picture> syntax to display responsive images
    thumbnail: [
      {
        srcset: 'test/example/oceans.jpg',
        type: 'image/jpeg',
        media: '(min-width: 400px;)'
      },
      {
        src: 'test/example/oceans-low.jpg'
      }
    ]
  }]
  wrapper.setState({videos})
  expect(wrapper.find('Player').length).toBe(1);
});