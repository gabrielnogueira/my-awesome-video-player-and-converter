import React, { Component } from 'react';
import logo from './logo.svg';
import openSocket from 'socket.io-client';
import constants from './constants';
import './App.css';

const socket = openSocket('http://localhost:3000');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos:[]
    }
  }

  componentWillMount() {
    fetch('http://localhost:3000/api/Videos/realtime-change')
    .then(response => {
      return response.json();
    })
    .then(({result}) => {
      this.setState({videos:result.data});
    })

    this.videosListener(result=>this.setState({videos:result.data}));
    this.uploadListener(result=>{
      let newVideos = this.state.videos.map(video=>{
        if(video.id === result.id){
          return {...video, progress:result.progress};
        }
        return video;
      })
      this.setState({videos:newVideos});
    })
  }

  videosListener(callback){
    socket.on(constants.VIDEO_LIST_CHANGED, function (videos) {
      callback(videos)
    });
  }

  uploadListener(callback){
    socket.on(constants.VIDEO_UPLOAD_PROGRESS, function (videos) {
      callback(videos)
    });
  }

  uploadFile(event){
    const data = new FormData();
    data.append('file', event.target.files[0]);
    
     fetch('http://localhost:3000/api/Videos', {
      method: 'post', 
      body: data
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(JSON.stringify(data));
    });

  }
  
  render() {
    const {videos} = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to My Awesome Video Player and Converter!</h1>
        </header>
       <div className="App-intro">
          <ul>
            {videos && videos.map((video, idx) => <li key={idx}><b>Nome: {video.name}</b> - Status: {video.status} {video.progress && `|${video.progress}%`}</li>)}
          </ul>
        </div>

        <div>
          <input type="file" onChange={this.uploadFile} />
        </div>

      </div>
    );
  }
}

export default App;
