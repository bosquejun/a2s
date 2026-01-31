import { Category, Mood } from "@/lib/database/generated/prisma/enums";
import { triggerWorkflow } from "@/lib/workflow-client/client";
import { generateStoryWorkflowInputSchema } from "@/validations/story.validation";
import { NextResponse } from "next/server";



export const POST = async (request: Request) => {
    const body = await request.json();

    const {data,success, error} = generateStoryWorkflowInputSchema.partial().safeParse(body);

    if (!success) {
        return NextResponse.json({ error: error.issues.map((issue) => issue.message).join("\n") }, { status: 400 });
    }

    const {category,mood} = data;

    if(mood && !category){
        Object.values(Category).forEach(category => {
            const contextData = {
                intensity: Math.floor(Math.random() * 5) + 1,
                category: category,
                mood: mood,
            }

            triggerWorkflow("generateStory", contextData, {
                key: "generate-story-workflow",
                rate: 1,
                period: "5m",
                parallelism: 1,
            });
        })
    }else if(category && !mood){
        Object.values(Mood).forEach(mood => {
            const contextData = {
                intensity: Math.floor(Math.random() * 5) + 1,
                category: category,
                mood: mood,
            }
        })
    }else if(category && mood){
        const contextData = {
            intensity: Math.floor(Math.random() * 5) + 1,
            category: category,
            mood: mood,
        }

        triggerWorkflow("generateStory", contextData, {
            key: "generate-story-workflow",
            rate: 1,
            period: "5m",
            parallelism: 1,
        });
    } else if(!category && !mood){
        Object.values(Mood).forEach(mood => {
            Object.values(Category).forEach(category => {
                const contextData = {
                    intensity: Math.floor(Math.random() * 5) + 1,
                    category: category,
                    mood: mood,
                }
    
                triggerWorkflow("generateStory", contextData, {
                    key: "generate-story-workflow",
                    rate: 1,
                    period: "5m",
                    parallelism: 1,
                });
            })
          })
    }

    return NextResponse.json({ message: "Stories generation started" });
  }