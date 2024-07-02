import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import '../style/Verification.css'; // Import the CSS file

function CaptureDocument() {
    const [idImageCaptured, setIdImageCaptured] = useState(false);
    const [idImage, setIdImage] = useState(null);
    const [selfieImage, setSelfieImage] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showIdWebcam, setShowIdWebcam] = useState(false);
    const [showSelfieWebcam, setShowSelfieWebcam] = useState(false);
    const [idImageUrl, setIdImageUrl] = useState(null);
    const [selfieImageUrl, setSelfieImageUrl] = useState(null);
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const captureIdImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setIdImageUrl(imageSrc);
        const byteString = atob(imageSrc.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const file = new File([blob], "id_image.jpg", { type: "image/jpeg" });
        setIdImage(file);
        setIdImageCaptured(true);
        setShowIdWebcam(false);
    };

    const fetchSavedSelfie = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get-screenshot', {
                method: 'GET',
            });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setSelfieImageUrl(url);
            const file = new File([blob], "saved_selfie.jpg", { type: "image/jpeg" });
            setSelfieImage(file);
        } catch (error) {
            console.error('Error fetching saved selfie:', error);
        }
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
            navigate('/error');
        }
    };

    return (
        <div className="verification-container">
            <h1>Verification</h1>
            <div className="capture-container">
                <button type="button" onClick={() => setShowIdWebcam(true)} className="capture-button">Open cam for ID</button>
                {showIdWebcam && (
                    <div>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={320}
                            height={240}
                            className="webcam"
                        />
                        <button type="button" onClick={captureIdImage} className="capture-button">Capture ID Image</button>
                    </div>
                )}
            </div>
            {idImageCaptured && (
                <div className="capture-container">
                    <button type="button" onClick={fetchSavedSelfie} className="capture-button">Use saved selfie</button>
                    {selfieImageUrl && (
                        <div className="image-preview">
                            <img src={selfieImageUrl} alt="Selfie" width={160} height={160} className="preview-image" />
                        </div>
                    )}
                </div>
            )}
            {selfieImage && (
                <form onSubmit={handleSubmit} className="verification-form">
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            )}
            {error && <div className="error-message">{error}</div>}
            {result && (
                <div className="result-container">
                    <h2>Result</h2>
                    <p>Similarity Score: {result.similarity_score}</p>
                    <p>Match Status: {result.match_status}</p>
                </div>
            )}
        </div>
    );
}

export default CaptureDocument;
