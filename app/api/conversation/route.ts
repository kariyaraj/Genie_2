import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import axios from "axios";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { messages ,userMessage } = body;

    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });
    // if (!configuration.apiKey)
    //   return new NextResponse("OpenAI api key not configured.", {
    //     status: 500,
    //   });

    if (!messages)
      return new NextResponse("Messages are required.", { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return new NextResponse("Free trial has expired.", { status: 403 });

    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages,
    // });

      const values={
        model:"llama3",
        prompt:userMessage.content,
        messages:messages,
        stream:false,
      }
      const response=await axios.post("http://130.198.19.43:11434/api/generate",values);
      const response2={
        "role":"system",
        "content":response.data.response
      }
      console.log(response.data);
    if (!isPro) await increaseApiLimit();

    return NextResponse.json(response2, { status: 200 });
  } catch (error: unknown) {
    console.error("[CONVERSATION_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
