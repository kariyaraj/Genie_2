import { auth } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { prompt, amount = "1", resolution = "512x512" } = body;

    if (!userId) return new NextResponse("Unauthorized.", { status: 401 });


    if (!prompt)
      return new NextResponse("Prompt is required.", { status: 400 });

    if (!amount)
      return new NextResponse("Amount is required.", { status: 400 });

    if (!resolution)
      return new NextResponse("Resolution is required.", { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return new NextResponse("Free trial has expired.", { status: 403 });

    // const response = await openai.createImage({
    //   prompt,
    //   n: parseInt(amount, 10),
    //   size: resolution,
    // });
    const input=
    {
      prompt:prompt,
      scheduler:"K_EULER",
      num_outputs:parseInt(amount, 10),
    }

    const response = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt:prompt,
          scheduler:"K_EULER",
          num_outputs:parseInt(amount, 10),
        },
      },
    );


    if (!isPro) await increaseApiLimit();
    
    console.log(response);
    return NextResponse.json(response, { status: 200 });
    // return NextResponse.json(response.data.data, { status: 200 });
  } catch (error: unknown) {
    console.error("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
