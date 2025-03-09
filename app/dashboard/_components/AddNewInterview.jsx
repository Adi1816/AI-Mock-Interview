"use client"
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAiModel';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';
  

function AddNewInterview() {
  const [openDialog, setOpenDialog]=useState(false);
  const [jobTitle, setJobTitle]=useState();
  const [jobDescription, setJobDescription]=useState();
  const [techStacks, setTechStacks]=useState();
  const [duration, setDuration]=useState();
  const [loading, setLoading]=useState(false);
  const router=useRouter();
  const [jsonResponse, setJsonResponse]=useState([]);
  const {user}=useUser();

  const onSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    console.log(jobTitle, jobDescription, techStacks, duration);

    const inputPrompt = `
    Job Title: ${jobTitle}, Job Description: ${jobDescription}, Tech Stacks: ${techStacks}, Years of Experience: ${duration}.
    Based on this job, generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUES_COUNT} interview questions along with answers in **valid JSON format**.

    Strictly follow these JSON rules:
    1. **Do not include any markdown formatting** (like \`\`\`json or \`\`\`).
    2. Ensure that all answers are **single-line or properly escaped**.
    3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values.
    4. Provide output as a **valid JSON object**, where each question has "ques" and "ans" fields.
    `;

    try {
        const result = await chatSession.sendMessage(inputPrompt);
        const rawResponse = await result.response.text(); 
        console.log("Raw Response:", rawResponse);

        const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
        if (!jsonMatch) throw new Error("Response does not contain JSON");

        const mockJsonResponse = jsonMatch[1].trim();
        setJsonResponse(mockJsonResponse);

        if(mockJsonResponse){
            const resp=await db.insert(MockInterview)
            .values({
                mockId:uuidv4(),
                jsonMockResp:mockJsonResponse,
                jobPosition:jobTitle,
                jobDescription:jobDescription,
                techStacks:techStacks,
                jobExperience:duration,
                createdBy:user?.primaryEmailAddress?.emailAddress,
                createdAt:moment().format('DD-MM-YYYY')
            }).returning({mockId:MockInterview.mockId});

            console.log("Inserted ID:", resp);
            if(resp){
                setOpenDialog(false);
                router.push('/dashboard/interview/'+resp[0]?.mockId);
            }
        }
        else{
            console.log("ERROR: Response does not contain JSON");
        }
        const parsedResponse = JSON.parse(mockJsonResponse);
        
        console.log("Parsed JSON:", parsedResponse);
    } catch (error) {
        console.error("JSON Parsing Error:", error);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className=''>
        <div className='p-10 border border-pink-100 shadow-md rounded-xl bg-pink-50 hover:scale-105 hover:shadow-pink-100 hover:shadow-md cursor-pointer transition-all' onClick={()=>setOpenDialog(true)}>
            <h2 className='font-semibold text-lg text-center text-[#4B164C]'>+ Add New Interview</h2>
        </div>

        <Dialog open={openDialog}>
        <DialogContent className='max-w-2xl'>
        <DialogHeader>
        <DialogTitle className='font-bold text-2xl'>Tell us more about the Job you want to get Interviewed.</DialogTitle>
        <DialogDescription>
            <form onSubmit={onSubmit}>
            <div>
                <h2>Add Details of your Dream Job.</h2>
                <div>
                    <label className='block text-sm font-semibold text-[#4B164C] pt-4 '>Job Title:</label>
                    <Input placeholder="Ex: Full Stack Developer" required
                    onChange={(event)=>setJobTitle(event.target.value)}/>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-[#4B164C] pt-4 '>Job Description:</label>
                    <Textarea placeholder="Ex: SDE Role, Frontend Dev Role etc." required
                    onChange={(event)=>setJobDescription(event.target.value)}/>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-[#4B164C] pt-4 '>Tech Stacks:</label>
                    <Input placeholder="Ex: React, Angular, JavaScript, NodeJs" required
                    onChange={(event)=>setTechStacks(event.target.value)}/>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-[#4B164C] pt-4 '>Years of Experience:</label>
                    <Input placeholder="Ex: 0, 1, 12" type="number" max="50" required
                    onChange={(event)=>setDuration(event.target.value)}/>
                </div>
            </div>
            
            <div className='flex gap-6 pt-3 justify-end'>
                <Button type="button" variant="ghost" onClick={()=>setOpenDialog(false)} className='font-bold'>Cancel</Button>
                <Button type="submit" disabled={loading} className='font-bold'>
                    {loading?<><LoaderCircle className='animate-spin'/>Generating from AI</>:<>Start Interview</>}
                </Button>
            </div>
            </form>
        </DialogDescription>
        </DialogHeader>
        </DialogContent>
        </Dialog>
    </div>
  )
}

export default AddNewInterview