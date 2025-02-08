"use client";

import fish from '../assets/fish.png'
import React, { useState, useEffect } from 'react';
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import type { MyRequest, MyResponse } from "../../../../types/types";
import styles from '../styles/Dictaphone.module.css';

// Define interfaces for the component's props and recognition results
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

  useEffect(() => {
    // Set isClient to true when the component mounts on the client
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Cleanup function to revoke the previous audio URL when it changes
    return () => {
      if (audioUrl) {
        console.log("in here")
        URL.revokeObjectURL(audioUrl); // Revoke previous audio URL when it changes or component unmounts
      }
    };
  }, [audioUrl]); // Effect runs when audioUrl changes

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

  // Fix the onClick handlers to use proper function calls
  const handleStart = () => {
    SpeechRecognition.startListening(options);
  };


  const handleStop = async () => {
    try {

      console.log("executing handleStop"); // Add this to check if function is called
      const current_id = context ? context.length : 0

      const myRequest: MyRequest = {
        id: current_id + 1,
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
      console.log("outside COntext", context)

      if (transcript) {
        setContext([...context || "", transcript]); // Append new item
        console.log("Context", context)
      }

      // const data: MyResponse = await response.json();
      // Convert the buffer array to Uint8Array
      const nextId = response.headers.get('X-Response-Id');

      // Get the audio blob directly
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);

      // Clean up previous URL when component unmounts
      SpeechRecognition.stopListening();
    } catch (error) {
      console.error("Error in handleStop:", error);
    }
  };

  return (
    <div className={styles.dictaphone}>
      <img src={fish} className={styles.fish} />
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
      {/* {audioUrl && (
        <audio controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )} */}
      {audioUrl && <audio key={audioUrl} src={audioUrl} controls />}
      <p>{audioUrl}</p>
    </div>
  );
};

export default Dictaphone;

