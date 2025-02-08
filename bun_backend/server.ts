import express from "express";
import {createSpeech, createSpeechArray, generateReply} from "./openai"
import type { Response, Request } from "express";
import type {MyRequest, MyResponse} from "../types/types";
import { createClient } from 'redis';

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const app = express();
const cors = require("cors")
const port = 8080;
const speechFile = path.resolve("./speech.mp3");

const client = createClient({
  url: 'redis://default:1N9uY3ryAN5asnc061z7fjvTglqGCEyv@redis-13838.c263.us-east-1-2.ec2.redns.redis-cloud.com:13838'
});
//redis-13838.c263.us-east-1-2.ec2.redns.redis-cloud.com:13838
//redis[s]://[[username][:password]@][host][:port][/db-number]:

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();


let hold = ""

app.use(cors())
app.use(express.json());  // for parsing application/json
// app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get("/", async (req: Request, res: Response ) => {
  res.send(hold);
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

  await client.hSet('transcript', `interviewer:${myRequest.id + 1}`,  replyJSON || "")

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
  await client.hSet('transcript', `interviewer:${myRequest.id + 1}`,  myRequest.text)

  try {
    buffer = await fs.promises.readFile(`./speech${myRequest.id - 1}.mp3`); // Read file as buffer

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