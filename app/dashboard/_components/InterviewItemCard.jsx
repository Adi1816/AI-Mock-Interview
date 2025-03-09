import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({interview}) {
    const router=useRouter();
    const onStart=()=>{
        router.push(`/dashboard/interview/${interview?.mockId}`)
        console.log('start clicked', interview?.mockId);
    }
    const onFeedback=()=>{
        router.push(`/dashboard/interview/${interview?.mockId}/feedback`)
        console.log('feedback clicked', interview?.mockId);
    }
  return (
    <div className='border border-pink-200 shadow-sm rounded-lg p-3'>
        <h2 className='font-bold text-pink-600 text-lg'>{interview?.jobPosition}</h2>
        <h2 className='font-bold text-gray-600 text-sm'>Years of Experience: {interview.jobExperience} years</h2>
        <h2 className='font-bold text-gray-400 text-xs'>Created At: {interview.createdAt}</h2>

        <div className='flex justify-between mt-3 gap-5'>
            {/* <Link href={'/dashboard/interview/'+interview?.mockId}> */}
            <Button size='sm' variant='outline' className='w-full font-bold'
            onClick={onFeedback}>Feedback</Button>
            {/* </Link> */}
            <Button size='sm' className='w-full font-bold' 
            onClick={onStart}>Start</Button>
        </div>
    </div>
  )
}

export default InterviewItemCard