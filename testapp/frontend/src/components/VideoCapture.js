import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const VideoCapture = () => {
    const videoRef = useRef(null);
    const [message, setMessage] = useState('');
    const [movement, setMovement] = useState('center');
    const movements = ['center', 'left', 'right'];
    const [currentMovementIndex, setCurrentMovementIndex] = useState(0);

    useEffect(() => {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                })
                .catch((error) => {
                    console.error("Error accessing webcam: ", error);
                });
        }
    }, []);

    const captureFrame = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    };

    const sendFrame = async () => {
        const frame = captureFrame();
        const blob = await fetch(frame).then(res => res.blob());
        const formData = new FormData();
        formData.append('video', blob, 'frame.jpg');
        formData.append('movement', movement);

        try {
            const response = await axios.post('http://localhost:5000/video_feed', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const data = response.data;

            if (data.is_real) {
                if (currentMovementIndex < movements.length - 1) {
                    setCurrentMovementIndex(currentMovementIndex + 1);
                    setMovement(movements[currentMovementIndex + 1]);
                } else {
                    setMessage('Liveness Detected');
                }
            } else {
                setMessage('Spoof Detected');
            }
        } catch (error) {
            console.error("Error sending frame: ", error);
            setMessage('Error detecting liveness');
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline />
            <button onClick={sendFrame}>Check Liveness</button>
            <p>Current Movement: {movement}</p>
            <p>{message}</p>
        </div>
    );
};

export default VideoCapture;
