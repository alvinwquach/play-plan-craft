import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ageGroup = searchParams.get("ageGroup") || "PRESCHOOL";
    const subject = searchParams.get("subject") || "SCIENCE";
    const theme = searchParams.get("theme") || "WEATHER";
    const duration = parseInt(searchParams.get("duration") || "30", 10);

    const validAgeGroups = ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"];
    const validSubjects = [
      "LITERACY",
      "MATH",
      "SCIENCE",
      "ART",
      "MUSIC",
      "PHYSICAL_EDUCATION",
      "SOCIAL_EMOTIONAL",
    ];
    if (
      !validAgeGroups.includes(ageGroup.toUpperCase()) ||
      !validSubjects.includes(subject.toUpperCase())
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid ageGroup or subject" },
        { status: 400 }
      );
    }

    const prompt = `Generate a ${duration}-minute lesson plan for ${ageGroup.toLowerCase()} children on ${subject.toLowerCase()} with a ${theme.toLowerCase()} theme. Include a title, activities (with type, description, and duration), and required supplies. Return in JSON format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json({
      success: true,
      result: completion.choices[0].message.content,
    });
  } catch (error: unknown) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to OpenAI" },
      { status: 500 }
    );
  }
}
