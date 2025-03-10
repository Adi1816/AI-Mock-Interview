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


function Feedback({ params }) {
    const [feedbackList, setFeedbackList] = useState([]);
    const router = useRouter();
    
    useEffect(() => {
        getFeedback();
    }, []);

    const getFeedback = async () => {
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, params.interviewId))
            .orderBy(UserAnswer.id);

        console.log(result);
        setFeedbackList(result);
    };

    // Calculate Overall Rating (out of 5)
    const overallRating = feedbackList.length > 0
    ? (feedbackList.reduce((sum, item) => {
        let rating = item.rating.toString().includes("/") 
            ? parseInt(item.rating.split("/")[0])  
            : parseInt(item.rating);  
        return sum + (isNaN(rating) ? 0 : Math.min(5, rating));
    }, 0) / feedbackList.length).toFixed(1)
    : null;

    const parseRating = (rating) => {
      if (!rating) return 0; // Handle null/undefined cases
      let num = rating.toString().includes("/") 
          ? parseInt(rating.split("/")[0])  
          : parseInt(rating);
      return isNaN(num) ? 0 : num; // Handle NaN cases
  };
  

    return (
        <div className='p-10'>
            <h2 className="text-3xl md:text-5xl font-bold glow-text mb-2">
                Congratulations!
            </h2>

            <h2 className='font-bold text-xl md:text-3xl '>Here is your Interview Feedback.</h2>

            {feedbackList.length === 0 ? (
                <h2 className='font-bold text-xl text-gray-600'>No Interview Feedback Record Found.</h2>
            ) : (
                <>
                    <h2 className='text-lg md:text-xl text-pink-600 my-5 font-extrabold'>
                        Your Overall Interview Rating: <strong >{overallRating}/5</strong>
                    </h2>

                    <h2 className='text-md text-gray-600'>
                        Detailed AI Analysis of your Interview: (Your Answers, AI's answers, and AI Feedback)
                    </h2>

                    {feedbackList.map((item, index) => (
                        <Collapsible key={index}>
                            <CollapsibleTrigger className='cursor-pointer p-2 shadow-lg border border-pink-100 font-extrabold rounded-lg my-2 text-left flex justify-between items-center'>
                                {item.question} <ChevronsUpDown className='opacity-55 h-5 w-5 ml-3' />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='flex flex-col gap-2'>
                                <h2 className={`p-2 border rounded-lg shadow-md ${parseRating(item.rating) > 2 ? 
                                    'text-green-600 bg-green-100 border-green-200' : 'text-red-600 bg-red-100 border-red-200'}`}>
                                    <strong className={parseRating(item.rating) > 2 ? 'text-green-700' : 'text-red-700'}>Rating: </strong>
                                    {Math.min(5, parseRating(item.rating))}
                                </h2>
                                    <h2 className='text-pink-600 shadow-md  bg-pink-100 border-pink-200 p-2 border rounded-lg'>
                                        <strong>Your Answer: </strong>{item.userAnswer}
                                    </h2>
                                    <h2 className='text-pink-600 shadow-md bg-pink-100 border-pink-200 p-2 border rounded-lg'>
                                        <strong>AI's Answer: </strong>{item.correctAns}
                                    </h2>
                                    <h2 className='text-yellow-700 shadow-md bg-yellow-100 border-yellow-200 p-2 border rounded-lg'>
                                        <strong>Feedback: </strong>{item.feedback}
                                    </h2>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </>
            )}

            <Button onClick={() => router.replace('/dashboard')} className='mt-5 font-bold'>
                Go Home
            </Button>
        </div>
    );
}

export default Feedback;
