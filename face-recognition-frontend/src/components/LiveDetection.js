import React, { useEffect, useRef, useState } from 'react';
import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
import '../style/LiveDetection.css';
import { Link } from 'react-router-dom';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const LiveDetection = () => {
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [runningMode, setRunningMode] = useState("IMAGE");
    const [webcamRunning, setWebcamRunning] = useState(false);
    const [screenshotURL, setScreenshotURL] = useState(null);
    const [enableWebcamButton, setEnableWebcamButton] = useState(false);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const videoWidth = 480;

    useEffect(() => {
        const demosSection = document.getElementById("demos");

        const createFaceLandmarker = async () => {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: runningMode,
                numFaces: 1
            });
            setFaceLandmarker(faceLandmarkerInstance);
            demosSection.classList.remove("invisible");
        };

        createFaceLandmarker();
    }, [runningMode]);

    const handleWebcamEnable = () => {
        if (!faceLandmarker) {
            console.log("Wait! faceLandmarker not loaded yet.");
            return;
        }

        setWebcamRunning(!webcamRunning);

        if (!webcamRunning) {
            enableWebcam();
        } else {
            disableWebcam();
        }
    };

    const enableWebcam = () => {
        const constraints = {
            video: true
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                webcamRef.current.srcObject = stream;
                webcamRef.current.addEventListener("loadeddata", predictWebcam);
                setRunningMode("VIDEO");
                faceLandmarker.setOptions({ runningMode: "VIDEO" });
                setEnableWebcamButton(true);
            })
            .catch((error) => {
                console.error('Error accessing webcam:', error);
            });
    };

    const clearCanvas = () => {
      const canvasElement = canvasRef.current;
      if (canvasElement) {
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
              ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          }
      }
  };
  
  
  const disableWebcam = () => {
    setWebcamRunning(false);
    if (webcamRef.current && webcamRef.current.srcObject) {
        webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
        webcamRef.current.srcObject = null;
    }
    if (canvasRef.current) {
          clearCanvas();
      }
  
};
const predictWebcam = async () => {
        const video = webcamRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        const drawingUtils = new DrawingUtils(canvasCtx);

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("Video dimensions are zero, skipping frame processing.");
            return;
        }

        const ratio = video.videoHeight / video.videoWidth;
        video.style.width = `${videoWidth}px`;
        video.style.height = `${videoWidth * ratio}px`;
        canvasElement.style.width = `${videoWidth}px`;
        canvasElement.style.height = `${videoWidth * ratio}px`;
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;

        let lastVideoTime = -1;
        let results;

        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            results = await faceLandmarker.detectForVideo(video, performance.now());
        }
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.faceLandmarks) {
            for (const landmarks of results.faceLandmarks) {
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                    { color: "#C0C0C070", lineWidth: 1 }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: "#30FF30" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                    { color: "#30FF30" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                    { color: "#E0E0E0" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LIPS,
                    { color: "#E0E0E0" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                    { color: "#30FF30" }
                );
            }
        }

        drawBlendShapes(document.getElementById("video-blend-shapes"), results.faceBlendshapes);

        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam);
        }
    };
    const fetchScreenshot = async () => {
      try {
          const response = await fetch('http://127.0.0.1:5000/get-screenshot');
          if (response.ok) {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              setScreenshotURL(url);
          } else {
              console.error('Failed to fetch screenshot.');
          }
      } catch (error) {
          console.error('Error fetching screenshot:', error);
      }
  };
  
let currentStep = 0;
let isPaused = false;
let startTime = null;

const steps = [
    {
        actionName: 'Turn Left',
        categoryNames: ['eyeLookInLeft', 'eyeLookOutRight'],
        actionMessage: 'Please turn your eyes to the left.',
        completed: false,
        pauseDuration: 3000 
    },
    {
        actionName: 'Turn Right',
        categoryNames: ['eyeLookInRight', 'eyeLookOutLeft'],
        actionMessage: 'Now, turn your eyes to the right.',
        completed: false,
        pauseDuration: 3000 
    },
    {
        actionName: 'Smile',
        categoryNames: ['mouthSmileRight', 'mouthSmileLeft'],
        actionMessage: 'Great! Please smile.',
        completed: false,
        pauseDuration: 2000 
    }
];

const checkActionCompletion = (blendShapes, step) => {
    return step.categoryNames.every(categoryName => {
        const shape = blendShapes[0].categories.find(shape => shape.categoryName === categoryName);
        return shape && shape.score >= 0.70;
    });
};

const drawBlendShapes = async (el, blendShapes) => {
    if (!blendShapes || !blendShapes[0]) {
        return;
    }

    el.innerHTML = "";

    if (currentStep < steps.length && !isPaused) {
        if (!startTime) {
            startTime = new Date().getTime();
        }
        if (checkActionCompletion(blendShapes, steps[currentStep])) {
            steps[currentStep].completed = true;
            isPaused = true;
            setTimeout(() => {
                currentStep++;
                isPaused = false;
                startTime = null;
            }, steps[currentStep].pauseDuration);
        } else if (new Date().getTime() - startTime > 3000) {
            el.innerHTML = "<div>Spoofing detected!</div>";
            return;
        }
    }

    if (currentStep < steps.length) {
        el.innerHTML = `<div>${steps[currentStep].actionMessage}</div>`;
        steps[currentStep].categoryNames.forEach(categoryName => {
            const shape = blendShapes[0].categories.find(shape => shape.categoryName === categoryName);
            if (shape) {
                el.innerHTML += `
                    <li class="blend-shapes-item">
                        <span class="blend-shapes-label">${shape.displayName || shape.categoryName}</span>
                        <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">${(+shape.score).toFixed(4)}</span>
                    </li>
                `;
            }
        });
    } else if (currentStep === steps.length && !el.dataset.screenshotCaptured) {
        el.dataset.screenshotCaptured = true; 
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.play();
            videoElement.addEventListener('loadedmetadata', async () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async (blob) => {
                    const formData = new FormData();
                    formData.append('screenshot', blob, 'screenshot.png');
                    const response = await fetch('http://127.0.0.1:5000/save-screenshot', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        console.log('Screenshot saved successfully.');
                        disableWebcam();
                        fetchScreenshot();
                        el.innerHTML = `<div>Screenshot captured successfully.</div>`;
                    } else {
                        console.error('Failed to save screenshot.');
                    }
                }, 'image/png');
                videoElement.pause();
                stream.getVideoTracks()[0].stop();
                videoElement.remove();
            });
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    }
};
useEffect(() => {
        const enableWebcamButton = document.getElementById("webcamButton");
        if (enableWebcamButton) {
            enableWebcamButton.addEventListener("click", handleWebcamEnable);
        }

        return () => {
            if (enableWebcamButton) {
                enableWebcamButton.removeEventListener("click", handleWebcamEnable);
            }
        };
    }, [faceLandmarker, webcamRunning]);

    return (
        <section id="demos" className="invisible">
            <h2>Demo: Webcam continuous face landmarks detection</h2>
            <p>
                Hold your face in front of your webcam to get real-time face landmarker detection.
            </p>
            <br />
            <div id="liveView" className="videoView">
                <button id="webcamButton" className="mdc-button mdc-button--raised" onClick={enableWebcam}>
                    <span className="mdc-button__ripple"></span>
                    <span className="mdc-button__label">ENABLE WEBCAM</span>
                </button>
                <div style={{ position: 'relative' }}>
                    <video id="webcam" style={{ position: 'absolute' }} className={webcamRunning ? "" : "invisible"} ref={webcamRef} autoPlay playsInline></video>
                    <canvas className="output_canvas" id="output_canvas" style={{ position: 'absolute', left: '0px', top: '0px' }} ref={canvasRef}></canvas>
                </div>
            </div>
            <div className="blend-shapes">
                <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
                <Link to="/verification">
                    <button className="accept-button">
                        ACCEPTER ET CONTINUER
                    </button>
                </Link>
            </div>
            {screenshotURL && (
    <div className="screenshot-container">
        <h3>Screenshot</h3>
        <img src={screenshotURL} alt="Screenshot" />
    </div>
)}
        </section>
    );
}

export default LiveDetection;
