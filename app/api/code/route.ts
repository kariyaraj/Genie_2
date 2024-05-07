import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import axios from "axios";



const intructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explaination.",
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { messages ,userMessage} = body;
    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });


    if (!messages)
      return new NextResponse("Messages are required.", { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return new NextResponse("Free trial has expired.", { status: 403 });
    const newMessage=[...messages,intructionMessage];
    console.log(newMessage);
      const values={
        model:"codellama",
        prompt:userMessage.content,
        messages:newMessage,
        stream:false,
      }
      const response=await axios.post("http://130.198.19.43:11434/api/generate",values);
      console.log(response.data);
      const response2={
        "role":"system",
        "content":response.data.response
      }
    //   const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [intructionMessage, ...messages],
    // });

    if (!isPro) await increaseApiLimit();

    return NextResponse.json(response2, { status: 200 });
  } catch (error: unknown) {
    console.error("[CODE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

