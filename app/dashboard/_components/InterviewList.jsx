"use client"

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs'
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard';

function InterviewList() {
    const {user}=useUser();
    const [interviewList, setInterviewList] = useState([]);
    useEffect(()=>{
        user && getInterviewList();

    },[user])
    const getInterviewList=async()=>{
        const result = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MockInterview.id))

        console.log(result);
        setInterviewList(result);

    }
  return (
    <div>
        <h2 className='text-xl font-semibold text-[#4B164C]'>Previous Mock Interviews </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3'>
            {interviewList?.length==0 ? 
            <>
            <h1 className='font-bold text-2xl text-gray-500'>No Previous Interview Data Found.</h1>
            </>
            :
            <>
            {interviewList && interviewList.map((interview, index)=>(
                <InterviewItemCard key={index} 
                interview={interview}/>
            ))}
            </>}
        </div>
    </div>
  )
}

export default InterviewList