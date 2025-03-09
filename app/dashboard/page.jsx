import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

function Dashboard() {
  return (
    <div className='p-10'>
        <h2 className='font-extrabold text-6xl text-[#4B164C]'>Dashboard</h2>
        <h2 className='text-pink-600 text-xl font-semibold'>Create & Start Your AI Mock Interview!</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 my-5'>
            <AddNewInterview/>
        </div>

        <InterviewList/>

    </div>
  )
}

export default Dashboard