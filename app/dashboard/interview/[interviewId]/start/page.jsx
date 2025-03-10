"use client"

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnsSection from './_components/RecordAnsSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


function StartInterview({params}) {
    const [interviewData, setInterviewData]=useState();
    const [mockInterviewQues, setMockInterviewQues]=useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex]=useState(0);
    useEffect(() => {
        console.log("🔄 Updated mockInterviewQues:", mockInterviewQues);
    }, [mockInterviewQues]); 

    useEffect(()=>{
        getInterviewDetails();
        console.log("mockInterviewQues after fetching:", mockInterviewQues);
    }, []);

    const getInterviewDetails = async ()=>{
        try {
            const result=await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId));
    
            if (!result || result.length === 0) {
                console.error("❌ No interview data found");
                return;
            }
    
            console.log("✅ Raw DB Result:", result);
    
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            console.log("✅ Parsed JSON Response:", jsonMockResp);
    
            console.log("✅ Extracted Questions:", jsonMockResp.interviewQuestions);
    
            setMockInterviewQues(Array.isArray(jsonMockResp.interviewQuestions) ? jsonMockResp.interviewQuestions : []);
            setInterviewData(result[0]);
        } catch (error) {
            console.error("❌ Error fetching interview details:", error);
        }
    }
  return (
    <div> 
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            <QuestionsSection 
            mockInterviewQues={mockInterviewQues}
            activeQuestionIndex={activeQuestionIndex}/>
            <RecordAnsSection
            mockInterviewQues={mockInterviewQues}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            />
        </div>
        <div className='flex justify-end gap-5'>
            {activeQuestionIndex>0 && 
            <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)} className='font-bold'>Previous Question</Button>}
            {activeQuestionIndex!=mockInterviewQues?.length-1 && 
            <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)} className='font-bold'>Next Question</Button>}
            {
            <Link href={'/dashboard/interview/' + interviewData?.mockId + '/feedback'} >
            <Button className='bg-red-500 text-white font-bold hover:bg-white hover:text-red-500'>End Interview</Button>
            </Link>}
        </div>
    </div>
  )
}

export default StartInterview