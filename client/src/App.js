import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import constants from './constants';
import Player from './components/Player'
import { ToastContainer } from "react-toastr";

import './lib/toastr/toastr.min.css';
import './lib/animate/animate.min.css';

import './App.css';

const socket = openSocket(window.location.href);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos:[]
    }
  }

  componentWillMount() {
    const idVideo = this.props.match ? this.props.match.params.id : null;

    if(idVideo){
      fetch(`/api/Videos/${idVideo}`)
      .then(response => {
        return response.json();
      })
      .then(({result}) => {
        if(result.data){
          this.setState({videos:[result.data]});
          return;
        }

        this.toastr.warning(
          <em>Vídeo não encontrado. Verifique o identificador informado e tente novamente</em>,
          <strong>Atenção!</strong>,
        {closeButton: true, timeOut:5000});
      })

      return
    }

    fetch('/api/Videos/realtime-change')
    .then(response => {
      return response.json();
    })
    .then(({result}) => {
      if(result.data && result.data.length > 0){
        this.setState({videos:result.data});
        return;
      }
      this.toastr.warning(
        <em>Nenhum vídeo encontrado. Clique no botão para Enviar um vídeo.</em>,
        <strong>Atenção!</strong>,
      {closeButton: true, timeOut:5000});
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
    this.errorListener(result=>{
      this.toastr.error(
        <em>{result.message}</em>,
        <strong>{result.title}</strong>,
      {closeButton: true, timeOut:5000});
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

  errorListener(callback){
    socket.on(constants.VIDEO_ERRO_MESSAGE, function(message){
      callback(message);
    })
  }

  uploadFile(event){
    const data = new FormData();
    data.append('file', event.target.files[0]);
    const that = this;
     fetch('/api/Videos', {
      method: 'post', 
      body: data
    }).then(response => response.json())
    .then(({result}) => that.toastr.warning(
        <em>{result.message}</em>,
        <strong>{result.title}</strong>,
      {closeButton: true, timeOut:5000}
    )).catch(({err}) => that.toastr.error(
      <em>{err.message}</em>,
      <strong>{err.title}</strong>,
    {closeButton: true, timeOut:5000}
  ))

  this.props.history.push(`/videos`);

  }

  
  render() {
    const videoJsOptions = {
      autoplay: false,
      controls: true
    }
    const idVideo = this.props.match ? this.props.match.params.id : null;
    
    return (
      <div className="App">
          <ToastContainer
              ref={ref => this.toastr = ref}
              className="toast-top-right"
            />
        <header className="App-header">
          <h1 className="App-title">Welcome to My Awesome Video Player and Converter!</h1>
        </header>
       <div className="App-intro">
          {this.state.videos && this.state.videos.length > 0 && <Player {...videoJsOptions} playlist={this.state.videos} idVideo={idVideo} />}
        </div>

        <div className="floating-input-button">
          <input type="file" id="fileVideo" className="inputfile inputfile-1" onChange={this.uploadFile.bind(this)} />
          <label htmlFor="fileVideo"><span>Enviar um vídeo</span></label>
        </div>
      </div>
    );
  }
}

export default App;
