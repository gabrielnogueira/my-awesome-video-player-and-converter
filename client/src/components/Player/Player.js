import React, {Component} from 'react';
import constants from '../../constants';

import videojs from 'video.js'

import videojsPlaylistPlugin from 'videojs-playlist';
import videojsPlaylistUiPlugin from '../../lib/videojs-playlist-ui';

import './assets/css/player.css';
import './assets/css/videojs.css';
import './assets/css/advanced.css';
import './assets/css/progress-bar.css';

videojs.registerPlugin('playlist', videojsPlaylistPlugin);
videojs.registerPlugin('playlistui', videojsPlaylistUiPlugin);

export default class Player extends Component {
    componentDidMount() {
        this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
            console.log('Player Ready!')
        });
        this.setPlaylist(this.props.playlist, this.props.idVideo);
    }

    componentWillReceiveProps(nextProps){
      this.setPlaylist(nextProps.playlist, nextProps.idVideo);
    }

    setPlaylist(pl, id){
      let idxPlay = null; 
      if(this.player && pl){
        const playlist = pl.map((video, idx)=>{
          let barClass = null
          switch (video.status) {
            case constants.VIDEO_STATUS_ENVIANDO:
              barClass = 'green'
            break;
            case constants.VIDEO_STATUS_ENCODANDO:
              barClass = 'orange'
              break;
          }

          if(video.id == id){
            idxPlay = idx;
          }
          const retorno = {
            name: `${video.name} | id: ${video.id}`,
            status: video.status,
            barclass: barClass,
          }

          if(video.urlConvertedVideo){
            retorno.sources =  [{
              src: video.urlConvertedVideo,
              type: 'video/mp4'
            }]
          }

          return retorno;

        })
        
        this.player.playlist(playlist)
        this.player.playlistui();
        this.player.playlist.autoadvance(0);
        
        if(idxPlay){
          this.player.playlist.currentItem(idxPlay);
        }
      }
    }

    componentWillUnmount() {
        if (this.player) {
          this.player.dispose()
        }
    }

    render() {
      return (
        <section className="main-preview-player">
          <div crossOrigin="anonymous" preload="auto" className="video-js vjs-fluid vjs-paused preview-player-dimensions vjs-controls-enabled vjs-workinghover vjs-v6 vjs-mux vjs-user-inactive"
              id="preview-player" lang="pt-br" role="region" aria-label="Video Player">
               <video ref={ node => this.videoNode = node } id="preview-player" className="video-js vjs-fluid" controls preload="auto" crossOrigin="anonymous">
                   <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
               </video>
            </div>
            <div className="playlist-container preview-player-dimensions vjs-fluid">
              <ol className="vjs-playlist vjs-csspointerevents vjs-mouse">
              </ol>
          </div>
        </section>
      );
    }
  }