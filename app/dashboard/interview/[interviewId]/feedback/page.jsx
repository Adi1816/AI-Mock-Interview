"use client"

import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
  

function Feedback({params}) {
    const [feedbackList, setFeedbackList]=useState([]);
    const router=useRouter();
    useEffect(()=>{
        getFeedback();
    }, [])
    const getFeedback = async() =>{
        const result=await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id)
        console.log(result);
        setFeedbackList(result);
    }
  return (
    <div className='p-10'>
        <h2 className='text-3xl md:text-5xl font-bold text-green-500'>Congratulations!</h2>
        <h2 className='font-bold text-xl md:text-3xl '>Here is your Interview Feedback.</h2>

        {feedbackList?.length==0?
        <h2 className='font-bold text-xl text-gray-600'>No Interview Feedback Record Found.</h2>
        :
        <>
        
        <h2 className='text-lg text-pink-600 my-5'>Your Overall Interview Rating: <strong>7/10</strong></h2>

        <h2 className='text-sm md:text-md text-gray-600'>Detailed AI Analysis of your Interview: (Your Answers, AI's answers and AI Feedback)</h2>
        {feedbackList && feedbackList.map((item, index)=>(
            <Collapsible key={index}>
            <CollapsibleTrigger className='cursor-pointer p-2 bg-secondary rounded-lg my-2 text-left flex justify-between items-center'>
            {item.question} <ChevronsUpDown className='opacity-55 h-5 w-5 ml-3'/></CollapsibleTrigger>
            <CollapsibleContent>
              <div className='flex flex-col gap-2'>
                <h2 className={`p-2 border rounded-lg ${item.rating>2 ? 'text-green-600 bg-green-100 border-green-200 ' : 'text-red-600 bg-red-100 border-red-200'}`}><strong className={item.rating > 2 ? 'text-green-700' : 'text-red-700'}>Rating: </strong>{item.rating}</h2>
                <h2 className='text-pink-600 bg-pink-100 border-pink-200 p-2 border rounded-lg'><strong>Your Answer: </strong>{item.userAnswer}</h2>
                <h2 className='text-pink-600 bg-pink-100 border-pink-200 p-2 border rounded-lg'><strong>AI's Answer: </strong>{item.correctAns}</h2>
                <h2 className='text-yellow-700 bg-yellow-100 border-yellow-200 p-2 border rounded-lg'><strong>Feedback: </strong>{item.feedback}</h2>
              </div>
            </CollapsibleContent>
            </Collapsible>
        

        ))}
        </>}

        <Button onClick={()=>router.replace('/dashboard')} className='mt-5 font-bold'>Go Home</Button>
    </div>
  )
}

export default Feedback