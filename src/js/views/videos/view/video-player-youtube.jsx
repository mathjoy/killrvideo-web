import React, { Component, PropTypes } from 'react';
import youTubeApiLoaded from 'lib/youtube-api-loaded';

class VideoPlayerYouTube extends Component {
  createYouTubePlayer() {
    youTubeApiLoaded.then(YT => {
      // Fire the playback started handler whenever the state changes appropriately
      const youTubePlayer = new YT.Player(this.refs.youTubeIframe.getDOMNode(), {
        events: {
          'onStateChange': e => {
            if (e.data === YT.PlayerState.PLAYING) {
              this.props.onPlaybackStarted();
            }
          }
        }
      });
    });
  }
  
  componentDidMount() {
    this.createYouTubePlayer();
  }
  
  componentDidUpdate(previousProps) {
    // If the video changes, create the YT player again
    if (this.props.video.location !== previousProps.video.location) {
      this.createYouTubePlayer();
    }
  }

  render() {
    const youTubeUrl = `http://www.youtube.com/embed/${this.props.video.location}?enablejsapi=1`;
    return (
      <iframe src={youTubeUrl} ref="youTubeIframe"></iframe>
    );
  }
}

VideoPlayerYouTube.queries = {
  video() {
    return [ 
      [ ['location'] ] 
    ];
  }
};

// Prop validation
VideoPlayerYouTube.propTypes = {
  video: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayerYouTube;