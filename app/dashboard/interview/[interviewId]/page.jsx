"use client"

import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';

function Interview({params}) {

    const [interviewData, setInterviewData]=useState();
    const [webcamEnabled, setWebcamEnabled]=useState(false);

    useEffect(()=>{
        console.log('Params:', params.interviewId);
        getInterviewDetails();
    }, [])

    const getInterviewDetails=async()=>{
        const result = await db.select().from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId)) 

        console.log(result);
        setInterviewData(result[0]);
    }


  return (
    <div className='my-10'>
        <h2 className='font-bold text-3xl mb-4'>Gear up for your Interview!</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>

            <div className='flex flex-col my-2'>
                <div className='flex flex-col p-6 rounded-lg border bg-[#fcfcfc]'>
                    <h2 className='text-lg'><strong>Job Title: </strong>{interviewData?.jobPosition}</h2>
                    <h2 className='text-lg'><strong>Job Description: </strong>{interviewData?.jobDescription}</h2>
                    <h2 className='text-lg'><strong>Tech Stacks: </strong>{interviewData?.techStacks}</h2>
                    <h2 className='text-lg'><strong>Years of Experience: </strong>{interviewData?.jobExperience}</h2>
                </div>
                <div className='mt-4 p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
                    <h2 className='flex gap-2 items-center text-yellow-600'><Lightbulb/><strong>Information</strong></h2>
                    <h2 className='mt-3 text-yellow-600'>It is recommended to enable video webcam and microphone to start your AI generated mock interview. It has 10 questions which you can answer and at last you will get the report on the basis of your answer.
                        <h2><strong>NOTE:</strong> We never record your video or save any private stuff. You can disable the access of webcam anytime, if you want.</h2>
                    </h2>
                </div>
            </div>
            <div>
                {webcamEnabled ? 
                <Webcam
                onUserMedia={()=>{setWebcamEnabled(true)}}
                onUserMediaError={()=>{setWebcamEnabled(false)}}
                mirrored={true}
                style={{
                    height: 450,
                    width: 500,
                }}
                />
                :
                <>
                <WebcamIcon className='h-96 w-full p-24 bg-[#F8E7F6] shadow-md shadow-pink-100 rounded-lg border my-2'/>
                <Button variant="ghost" className='w-full font-bold' onClick={()=>{setWebcamEnabled(true)}} >↠ Enable Web Cam & Microphone ↞</Button>
                </>
                }
            </div>

            
        </div>
        <div className='mt-4 flex justify-end items-end'>
            <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
            <Button className='font-bold'>Start Interview</Button>
            </Link>
            
        </div>
    </div>
  )
}

export default Interview