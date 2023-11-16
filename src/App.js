// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import {drawRect} from "./utilities";
import ItemList from "./ItemList";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState(new Set());

  const runCoco = async () => {
    const net = await tf.loadGraphModel('https://tensorflow-model-tcc.s3.amazonaws.com/model.json')

    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)

      const boxes = await obj[5].array()
      const classes = await obj[7].array()
      const scores = await obj[1].array()

      const ctx = canvasRef.current.getContext("2d");

      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.95, videoWidth, videoHeight, ctx)});


      for(let i=0; i<=boxes[0].length; i++){
        if(boxes[0][i] && classes[0][i] && scores[0][i]>0.95){
          setDetections((prevDetections) => new Set([...prevDetections, classes[0][i]]));
        }
      }
      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ float: "top" }}>
          <Webcam
            ref={webcamRef}
            muted={true}
            style={{
              position: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 800,
              height: 600,
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 8,
              width: 800,
              height: 600,
            }}
          />
        </div>
        <div style={{ float: "bottom" }}>
          <ItemList detections={[...detections]}/>
        </div>
      </header>
    </div>
  );
}

export default App;
