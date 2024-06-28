import React, { useEffect, useRef } from 'react';
import axios from 'axios';

const VideoStream = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            const response = await axios.get('http://127.0.0.1:5000/video_feed', {
                responseType: 'stream'
            });
            const videoSrc = URL.createObjectURL(new Blob([response.data], { type: 'video/mp4' }));
            videoRef.current.src = videoSrc;
        };

        fetchVideo();
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay />
        </div>
    );
};

export default VideoStream;
