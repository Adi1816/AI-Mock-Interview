// import { UserButton } from '@clerk/nextjs'
// import React from 'react'
// import AddNewInterview from './_components/AddNewInterview'
// import InterviewList from './_components/InterviewList'

// function Dashboard() {
//   return (
//     <div className='p-10'>
//         <h2 className='font-extrabold text-6xl text-[#4B164C]'>Dashboard</h2>
//         <h2 className='text-pink-600 text-xl font-semibold'>Create & Start Your AI Mock Interview!</h2>

//         <div className='grid grid-cols-1 md:grid-cols-3 my-5'>
//             <AddNewInterview/>
//         </div>

//         <InterviewList/>

//     </div>
//   )
// }

// export default Dashboard

// ----------------------------------------------------------------

import { PlusCircle, TrendingUp } from 'lucide-react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

function Dashboard() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Fix with -z-10 (sends it to the back) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-700 via-black to-slate-800 text-white no-scrollbar"></div>

      <div className="relative w-full h-full overflow-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header */}
          <header className="mb-10">
            <div>
              <h1 className="mt-20 text-4xl md:text-5xl font-bold 
                bg-clip-text text-transparent 
                bg-gradient-to-r from-cyan-300 to-blue-500 
                ">
                Dashboard
              </h1>
              <p className="text-lg text-gray-300 mt-3 max-w-xl">
                Elevate your interview preparation with AI-powered mock interviews. 
                Personalized, intelligent, and designed to help you succeed.
              </p>
            </div>
          </header>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8 h-[calc(100%-150px)]">
            {/* Create Interview Section */}
            <div className="md:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-30 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <TrendingUp 
                    className="text-blue-400" 
                    size={30} 
                  />
                  <h2 className="text-xl font-bold 
                    bg-clip-text text-transparent 
                    bg-gradient-to-r from-cyan-300 to-blue-500">
                    Create New Interview
                  </h2>
                </div>
                <p className="text-gray-200 text-md mb-4">
                  Craft a personalized AI interview experience tailored to your career aspirations.
                </p>
                <AddNewInterview />
              </div>
            </div>

            {/* Interview List Section */}
            <div className="md:col-span-2">
              <InterviewList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
