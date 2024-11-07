import {OpenAI} from 'openai';
export async function getLabel(email_content: string) {

    const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

    console.log("categorize kro!!");
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_tokens: 60,
        temperature: 0.5,
        messages: [
            {
                role: "user",
                content: `based on the following text just give one word answer, Categorizing the text based on the content and assign a label from the given options - Interested, Not Interested, More information. text is : ${email_content}`,
            },
        ],
    });

    const prediction = response.choices[0]?.message.content ?? "More information";

    console.log("prediction",prediction);

    let label;
    if (prediction.includes("Not Interested")) {
        label = "Not Interested";
    } else if (prediction.includes("info")) {
        label = "More information";
    } else {
        label = "Interested";
    }

    console.log(label);

    return label;
}

export async function generateReplyContent(prompt: string, subject: string, label:string): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages:[
        {
            role:"user",
            content: `Generate a helpful and professional email reply for the following, keep in mind the label is ${label} prompt:\n\nPrompt: ${prompt}\n\nSubject: ${subject}`
        }
      ],
      max_tokens: 300,
      n: 1,
      stop: null,
      temperature: 0.7,
    });
  
    return response.choices[0]?.message.content ?? "";
}