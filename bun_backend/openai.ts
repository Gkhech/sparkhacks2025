import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { exit } from "process";

const openai = new OpenAI();

// const transcription = await openai.audio.transcriptions.create({
//   file: fs.createReadStream("input.wav"),
//   model: "whisper-1",
// });

export const generateAnalyze = async (context: string[], text: string = "") => {
    const jsonExample = `
    {
    "question_id": "<question_id>",
    "question": "<question>",
    "answer": "<answer>",
    "general_feedback": "<general_feedback>",
    "strengths": "<strengths>",
    "suggestions": [
        "<suggestion_1>",
        "<suggestion_2>",
        "<suggestion_3>"
    ]
    }
    `;

    const hold = [{
        role: "developer",
        content: "You are an expert interview coach providing detailed and structured feedback on behavioral interview answers. Always break down responses and ensure constructive feedback that helps improve interview performance.",
    },
    ...context.map((context_text) => ({
        role: "user",
        content: context_text, // Changed `context` to `content`
    })),{
        role: "assistant",
        content: "Please JUST provide feedback on the following behavioral interview transcript. Focus on the quality of the responses, the relevance to the questions, the candidate's communication style, and the depth of the answers. Include suggestions for improvement, such as areas where more detail could have been provided, examples that might strengthen the response, or improvements in how the candidate presents their experiences. If the answer is empty, or completely off-topic then acknowledge and criticize.",
    }
    ,{
        role: "assistant",
        content: "Provide the feedback in this exact JSON format that follows this " + jsonExample,
    }] as ChatCompletionMessageParam[]
    console.log("before generateAnalyze", hold)
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: hold,
            store: true,
            temperature: 0.7,
        });
        return completion
    } catch (error) {
        console.error('Error creating speech:', error);
        throw error;
    }
}


export const generateReply = async (context: string[], text: string, id: number) => {
    //let hold: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    //if( id == 0){
    const hold = [{
        role: "developer",
        content: "You are an expert recruiter who specializes in behavioral interviewing. Provide thoughtful and insightful questions that test real-world soft skills and experiences relevant to the job.",
    },
    {
        role: "developer",
        content: "Generate 4 behavioral interview questions for a Senior Software Engineer. Focus on soft skills, challenges, and job requirements typically associated with this position. Make sure questions assess problem-solving, teamwork, leadership, adaptability, and other qualities. The questions should be Medium complexity. Respond only with questions. Each individual question should be followed by @ symbol with no space in-between. Example format you must follow Question 1@Question 2@Question 3@Question 4@...",
    },
    ...context.map((context_text) => ({
        role: "user",
        content: context_text, // Changed `context` to `content`
    })), {
        role: "user",
        content: text,
    }] as ChatCompletionMessageParam[]
    // }else{
    //     hold = 
    // }

    console.log("hold", hold)
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: hold,
            store: true,
            temperature: 0.7,
        });
        return completion
    } catch (error) {
    console.error('Error creating speech:', error);
    throw error;
    }
};

const speechFile = path.resolve("./speech.mp3");

type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

// Define the request parameters interface
interface SpeechCreateParams {
    model: string;
    voice: Voice;
    input: string;
    response_format?: 'mp3' ;
    speed?: number;
}

export const createSpeechArray = async (textArray: string[], voice: Voice = 'alloy') => {
    const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    });

    const speechPromises = textArray.map((text) => {
        const params: SpeechCreateParams = {
            model: "tts-1",
            voice: voice,
            input: text,
        };
        
        return openai.audio.speech.create(params);
    });

    // Wait for all speech generations to complete
    const responses = await Promise.all(speechPromises);
    return responses
};

export const createSpeech = async (text: string, voice: Voice = 'alloy') => {
    const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    });

    const params: SpeechCreateParams = {
    model: "whisper-1", // Note: whisper-1 is for transcription, tts-1 is for text-to-speech
    voice: voice,
    input: text,
    };

    try {
    const mp3 = await openai.audio.speech.create(params);
    return mp3;
    } catch (error) {
    console.error('Error creating speech:', error);
    throw error;
    }
};

// const mp3 = await openai.audio.speech.create({
//   model: "whisper-1",
//   voice: "alloy",
//   input: "Today is a wonderful day to build something people love!",
// });
// const hold = await createSpeech("hold");
// const buffer = Buffer.from(await hold.arrayBuffer());
// await fs.promises.writeFile(speechFile, buffer);


// console.log(generateReply("bruh").choices[0].message);
// completion.choices[0].message