"use client";

import fish from '../assets/fish.png'
import React, { useState, useEffect } from 'react';
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import type { AnalysisResponse, MyRequest, MyResponse } from "../../../types/types";
import styles from '../styles/Dictaphone.module.css';

interface SpeechRecognitionResult {
  transcript: string;
  listening: boolean;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

interface ListeningOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

const Dictaphone: React.FC = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [context, setContext] = useState<string[] | null>(null);
  const [seconds, setSeconds] = useState<number>(60); // Start from 60 seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);


  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds - 1;
          if (newSeconds === 0) {
            // When timer hits 0, stop everything
            setIsActive(false);
            handleStop();
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, seconds]);



  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  }: SpeechRecognitionResult = useSpeechRecognition();

  if (!isClient || !browserSupportsSpeechRecognition) {
    return <span>Browser doesn&apos;t support speech recognition.</span>;
  }

  const options: ListeningOptions = {
    continuous: true,
    interimResults: true,
    language: 'en-US'
  };

  const handleStart = () => {
    setSeconds(60); // Reset timer to 60 seconds
    setIsActive(true);
    SpeechRecognition.startListening(options);
  };

  const handleAnalyzes = async () => {
    try {
      let response = await fetch('http://localhost:8080/analyze', {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      let data: AnalysisResponse = await response.json();
      setAnalysis(data);
      console.log("Response:", data.analysis.analysis);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
  

  const handleStop = async () => {
    try {
      SpeechRecognition.stopListening();
      setIsActive(false);
      setSeconds(60); // Reset timer back to 60

      console.log("executing handleStop"); // Add this to check if function is called
      const current_id = context ? context.length : 0
      console.log(current_id)

      const myRequest: MyRequest =  {
        // id: current_id + 1,
        id: context ? context.length : 0,
        text: transcript,
        context: context || []
      };
    
      let response = await fetch('http://localhost:8080/speech', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' // Add this header
        },
        body: JSON.stringify(myRequest) // Convert to JSON
      });
      console.log("transcript", transcript)
      if(transcript){
        setContext([...context || "", transcript]); // Append new item
        console.log("Context", context)
      }
      
      // Get the audio blob directly
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
    }
    catch(error){
      console.log(error)
    }
  }
  
  //     // Clean up previous URL when component unmounts
  // const handleStop = () => {
  //   try {
  //     SpeechRecognition.stopListening();
  //     setIsActive(false);
  //     setSeconds(60); // Reset timer back to 60
  //   } catch (error) {
  //     console.error("Error in handleStop:", error);
  //   }
  // };
  const hold = analysis && analysis.analysis ? 
  Object.values(analysis.analysis).map((element) => (
    <div className={styles.box} key={element.id}>
      <div className={styles.item}>
      <h3 className={styles.spacing}>Question {element.id}</h3>
      <p>{element.question}</p>
      <p>Answer: {element.answer}</p>
      <div>
        <h4>Feedback:</h4>
        <p>{element.feedback.general}</p>
        {element.feedback.strengths !== "N/A" && (
          <p>Strengths: {element.feedback.strengths}</p>
        )}
        <div>
          <p>Suggestions:</p>
          <ul>
            {element.feedback.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  )) 
  : null;

  return (
    <div className={styles.dictaphone}>
      <img className={styles.fish} src={fish} />
      <h1 className={styles.timer}>Timer: {seconds}s</h1>
      <h1 className={styles.mic}>Microphone: {listening ? 'On' : 'Off'}</h1>
      <div className={styles.button_container}>
        <button className={styles.options_buttons} onClick={handleStart}>Start</button>
        {/* <button onClick={handleStop}>Stop</button> */}
        <button className={styles.options_buttons} onClick={resetTranscript}>Reset</button>
        <button className={styles.options_buttons} onClick={handleStop}>Submit Answer</button>
        <button className={styles.options_buttons} onClick={handleAnalyzes}>Submit for Analyzes</button>
      </div>
      <p className={styles.transcript} >{transcript}</p>
      {audioUrl && <audio key={audioUrl} src={audioUrl} controls />}
      <div className={styles.outerBox}>
      {hold && hold}
      </div>

    </div>
  );
};

export default Dictaphone;
