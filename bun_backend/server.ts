import express from "express";
import {createSpeech, createSpeechArray, generateAnalyze, generateReply} from "./openai"
import type { Response, Request } from "express";
import type {MyRequest, MyResponse} from "../types/types";
import { createClient } from 'redis';
import dotenv from 'dotenv'; 
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { transformInterviewJson } from "./util/util";
dotenv.config();//load env var

const app = express();
const cors = require("cors")
const port = 8080;
const speechFile = path.resolve("./speech.mp3");

const client = createClient({
  url: process.env.REDIS_API_URL
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();


let hold = ""

app.use(cors())
app.use(express.json());  // for parsing application/json

app.get("/", async (req: Request, res: Response ) => {
  res.send(hold);
});

app.get("/analyze", async (req: Request, res: Response) => {
  const transcript = await client.hGetAll("transcript");
  const interview_questions = await client.hGetAll("interview_questions");
  
  // Convert the objects into arrays and sort them
  const sortedTranscript = Object.entries(transcript)
    .map(([key, value]) => ({
      id: parseInt(key.split(':')[1]),
      text: value
    }))
    .sort((a, b) => a.id - b.id);

  const sortedQuestions = Object.entries(interview_questions)
    .map(([key, value]) => ({
      id: parseInt(key),
      text: value
    }))
    .sort((a, b) => a.id - b.id);

  // Create the interleaved conversation array
  const conversation: string[] = [];
  
  // Get the number of questions (which determines conversation length)
  const questionCount = sortedQuestions.length;
  
  for(let i = 0; i < questionCount; i++) {
    // Add the interview question
    conversation.push("Question: " + sortedQuestions[i].text);
    if(i < sortedTranscript.length){
      conversation.push("Answer: " + sortedTranscript[i].text)
    }
    else{
      conversation.push("Answer: no answer provided")
    }
  }
  console.log(conversation)

  const reply = await generateAnalyze(conversation, "")
  const replyJSON = reply.choices[0].message.content;
  // Send both the raw data and the organized conversation
  console.log(replyJSON)
  const cleanedJSON = transformInterviewJson(replyJSON!)
  await client.del("transcript");
  res.json({
    analysis: cleanedJSON
  });
});


app.post("/speech", async (req: Request, res: Response ) => {

  const myRequest: MyRequest = req.body

  await client.hSet('transcript', `interviewee:${myRequest.id}`,  myRequest.text)

  
  const reply = await generateReply(myRequest.context, myRequest.text, myRequest.id);
  const replyJSON = reply.choices[0].message.content;

  let result: string[] = replyJSON!.split("@");
  if(result[result.length - 1].length == 0){
    result.pop();
  }

  for(let i = 0; i < result.length; i++){
    await client.hSet('interview_questions', `${i}`,  result[i])
  }

  //"interviewee", myRequest.text || ""
  let buffer;

  if(myRequest.id == 1){
    const hold = await createSpeechArray(result);
    //const hold = await createSpeech(replyJSON || "");
    for(let i = 0;i < hold.length; i++) {
      buffer = Buffer.from(await hold[i].arrayBuffer());
      await fs.promises.writeFile( path.resolve(`./speech${i}.mp3`), buffer);
    }
  }
  //await client.hGet('interview_questions', myRequest.id + 1)

  try {
    buffer = await fs.promises.readFile(`./speech${myRequest.id}.mp3`); // Read file as buffer

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'X-Response-Id': (myRequest.id + 1).toString() // Send ID in header if needed
    });

    res.send(buffer);
  } catch (error) {
    console.error("Error reading MP3 file:", error);
    res.status(500).send("Error reading audio file");
  }
});

app.listen(port, () => {

  console.log(`Listening on port ${port}...`);
});