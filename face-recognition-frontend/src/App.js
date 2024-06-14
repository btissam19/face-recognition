import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

function App() {
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [result, setResult] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);

  const handleIdImageChange = (e) => {
    setIdImage(e.target.files[0]);
  };

  const handleSelfieCaptureClick = () => {
    setShowWebcam(true);
  };

  const captureSelfie = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const byteString = atob(imageSrc.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
    setSelfieImage(file);
    setShowWebcam(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id_image', idImage);
    formData.append('selfie_image', selfieImage);

    try {
      const response = await fetch('http://127.0.0.1:5000/match_faces', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="App">
      <h1>Face Recognition</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID Image:</label>
          <input type="file" onChange={handleIdImageChange} />
        </div>
        <div>
          <label>Selfie Image:</label>
          <button type="button" onClick={handleSelfieCaptureClick}>Take Selfie</button>
          {showWebcam && (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
              />
              <button type="button" onClick={captureSelfie}>Capture Selfie</button>
            </div>
          )}
          {selfieImage && (
            <div>
              <h3>Selfie Preview:</h3>
              <img src={URL.createObjectURL(selfieImage)} alt="selfie" width={160} height={160} />
            </div>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && (
        <div>
          <h2>Result</h2>
          <p>Similarity Score: {result.similarity_score}</p>
          <p>Match Status: {result.match_status}</p>
        </div>
      )}
    </div>
  );
}

export default App;
