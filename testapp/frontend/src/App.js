import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [videoBlob, setVideoBlob] = useState(null);
  const [isReal, setIsReal] = useState(null);
  const [movement, setMovement] = useState('center');
  const [message, setMessage] = useState('Please look straight at the camera.');
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const constraints = {
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("Error accessing the camera: ", err);
      });
  }, []);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      setVideoBlob(blob);
    }, 'image/jpeg');
  };

  const handleSubmit = async () => {
    if (!videoBlob) {
      setError("No video frame captured");
      return;
    }

    const formData = new FormData();
    formData.append('video', videoBlob, 'frame.jpg');
    formData.append('movement', movement);

    try {
      const response = await axios.post('http://127.0.0.1:5000/video_feed', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.is_real) {
        setIsReal(true);
        setError('');
        setMessage('Identity verified. Thank you!');
      } else {
        setIsReal(false);
        setError('Face not recognized or incorrect movement.');
      }

      if (movement === 'center') {
        setMovement('right');
        setMessage('Please turn your head to the right.');
      } else if (movement === 'right') {
        setMovement('left');
        setMessage('Please turn your head to the left.');
      } else if (movement === 'left') {
        setMovement('center');
        setMessage('Please look straight at the camera.');
      }

    } catch (err) {
      console.error("Error during liveness detection: ", err);
      setError("Error during liveness detection");
    }
  };

  return (
    <div className="container">
      <h1>Face Recognition Liveness Check</h1>
      <video id="video" ref={videoRef} width="640" height="480"></video>
      <div className="instructions">{message}</div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={captureFrame}>Capture Frame</button>
      <button onClick={handleSubmit}>Submit</button>
      {isReal !== null && (
        <div>
          {isReal ? 'Real person detected.' : 'Spoof attempt detected.'}
        </div>
      )}
    </div>
  );
};

export default App;
