import { Category, Mood } from "@/lib/database/generated/prisma/enums";
import { triggerWorkflow } from "@/lib/workflow-client/client";
import { generateStoryWorkflowInputSchema } from "@/validations/story.validation";
import { NextResponse } from "next/server";



export const POST = async (request: Request) => {
    console.log("[POST /api/stories/start] Request received");
    const body = await request.json();
    console.log("[POST /api/stories/start] Request body:", JSON.stringify(body));

    const {data,success, error} = generateStoryWorkflowInputSchema.partial().safeParse(body);

    if (!success) {
        console.error("[POST /api/stories/start] Validation failed:", error.issues);
        return NextResponse.json({ error: error.issues.map((issue) => issue.message).join("\n") }, { status: 400 });
    }

    const {category,mood} = data;
    console.log("[POST /api/stories/start] Parsed data - category:", category, "mood:", mood);

    let workflowCount = 0;

    if(mood && !category){
        console.log(`[POST /api/stories/start] Triggering workflows for mood: ${mood}, all categories`);
        Object.values(Category).forEach(category => {
            const contextData = {
                intensity: Math.floor(Math.random() * 5) + 1,
                category: category,
                mood: mood,
            }

            console.log(`[POST /api/stories/start] Triggering workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`);
            triggerWorkflow("generateStory", contextData, {
                key: "generate-story-workflow",
                rate: 3,
                period: "1m",
                parallelism: 1,
            }).catch(error => {
                console.error(`[POST /api/stories/start] Failed to trigger workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`, error);
            });
            workflowCount++;
        })
        console.log(`[POST /api/stories/start] Triggered ${workflowCount} workflows for mood: ${mood}`);
    }else if(category && !mood){
        console.log(`[POST /api/stories/start] Triggering workflows for category: ${category}, all moods`);
        Object.values(Mood).forEach(mood => {
            const contextData = {
                intensity: Math.floor(Math.random() * 5) + 1,
                category: category,
                mood: mood,
            }

            console.log(`[POST /api/stories/start] Triggering workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`);
            triggerWorkflow("generateStory", contextData, {
                key: "generate-story-workflow",
                rate: 3,
                period: "1m",
                parallelism: 1,
            }).catch(error => {
                console.error(`[POST /api/stories/start] Failed to trigger workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`, error);
            });
            workflowCount++;
        })
        console.log(`[POST /api/stories/start] Triggered ${workflowCount} workflows for category: ${category}`);
    }else if(category && mood){
        const contextData = {
            intensity: Math.floor(Math.random() * 5) + 1,
            category: category,
            mood: mood,
        }

        console.log(`[POST /api/stories/start] Triggering single workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`);
        triggerWorkflow("generateStory", contextData, {
            key: "generate-story-workflow",
            rate: 1,
            period: "5m",
            parallelism: 1,
        }).catch(error => {
            console.error(`[POST /api/stories/start] Failed to trigger workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`, error);
        });
        workflowCount = 1;
        console.log(`[POST /api/stories/start] Triggered 1 workflow`);
    } else if(!category && !mood){
        console.log(`[POST /api/stories/start] Triggering workflows for all moods and categories`);
        Object.values(Mood).forEach(mood => {
            Object.values(Category).forEach(category => {
                const contextData = {
                    intensity: Math.floor(Math.random() * 5) + 1,
                    category: category,
                    mood: mood,
                }
    
                console.log(`[POST /api/stories/start] Triggering workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`);
                triggerWorkflow("generateStory", contextData, {
                    key: "generate-story-workflow",
                    rate: 3,
                    period: "1m",
                    parallelism: 1,
                }).catch(error => {
                    console.error(`[POST /api/stories/start] Failed to trigger workflow - category: ${category}, mood: ${mood}, intensity: ${contextData.intensity}`, error);
                });
                workflowCount++;
            })
          })
        console.log(`[POST /api/stories/start] Triggered ${workflowCount} workflows for all combinations`);
    }

    console.log(`[POST /api/stories/start] Request completed successfully. Total workflows triggered: ${workflowCount}`);
    return NextResponse.json({ message: "Stories generation started" });
  }