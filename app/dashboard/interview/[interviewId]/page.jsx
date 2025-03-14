// "use client"

// import { Button } from '@/components/ui/button';
// import { db } from '@/utils/db';
// import { MockInterview } from '@/utils/schema';
// import { eq } from 'drizzle-orm';
// import { Lightbulb, WebcamIcon } from 'lucide-react';
// import Link from 'next/link';
// import React, { useEffect, useState } from 'react'
// import Webcam from 'react-webcam';

// function Interview({params}) {

//     const [interviewData, setInterviewData]=useState();
//     const [webcamEnabled, setWebcamEnabled]=useState(false);

//     useEffect(()=>{
//         console.log('Params:', params.interviewId);
//         getInterviewDetails();
//     }, [])

//     const getInterviewDetails=async()=>{
//         const result = await db.select().from(MockInterview)
//         .where(eq(MockInterview.mockId, params.interviewId)) 

//         console.log(result);
//         setInterviewData(result[0]);
//     }


//   return (
//     <div className='my-10'>
//         <h2 className='font-bold text-3xl mb-4'>Gear up for your Interview!</h2>

//         <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>

//             <div className='flex flex-col my-2'>
//                 <div className='flex flex-col p-6 rounded-lg border bg-[#fcfcfc]'>
//                     <h2 className='text-lg'><strong>Job Title: </strong>{interviewData?.jobPosition}</h2>
//                     <h2 className='text-lg'><strong>Job Description: </strong>{interviewData?.jobDescription}</h2>
//                     <h2 className='text-lg'><strong>Tech Stacks: </strong>{interviewData?.techStacks}</h2>
//                     <h2 className='text-lg'><strong>Years of Experience: </strong>{interviewData?.jobExperience}</h2>
//                 </div>
//                 <div className='mt-4 p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
//                     <h2 className='flex gap-2 items-center text-yellow-600'><Lightbulb/><strong>Information</strong></h2>
//                     <h2 className='mt-3 text-yellow-600'>It is recommended to enable video webcam and microphone to start your AI generated mock interview. It has 10 questions which you can answer and at last you will get the report on the basis of your answer.
//                         <h2><strong>NOTE:</strong> We never record your video or save any private stuff. You can disable the access of webcam anytime, if you want.</h2>
//                     </h2>
//                 </div>
//             </div>
//             <div>
//                 {webcamEnabled ? 
//                 <Webcam
//                 onUserMedia={()=>{setWebcamEnabled(true)}}
//                 onUserMediaError={()=>{setWebcamEnabled(false)}}
//                 mirrored={true}
//                 style={{
//                     height: 450,
//                     width: 500,
//                 }}
//                 />
//                 :
//                 <>
//                 <WebcamIcon className='h-96 w-full p-24 bg-[#F8E7F6] shadow-md shadow-pink-100 rounded-lg border my-2'/>
//                 <Button variant="ghost" className='w-full font-bold' onClick={()=>{setWebcamEnabled(true)}} >↠ Enable Web Cam & Microphone ↞</Button>
//                 </>
//                 }
//             </div>

            
//         </div>
//         <div className='mt-4 flex justify-end items-end gap-4'>
//         <Link href={'/dashboard/'}>
//             <Button className='font-bold'>Back to Dashboard</Button>
//             </Link>
//             <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
//             <Button className='font-bold'>Start Interview</Button>
//             </Link>
            
            
//         </div>
//     </div>
//   )
// }

// export default Interview

// ------------------------------------------------------------------------------

"use client"

import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon, ArrowLeft, Play, CameraOff } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam';

function Interview({params}) {
    const [interviewData, setInterviewData] = useState();
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const webcamRef = useRef(null);

    useEffect(() => {
        console.log('Params:', params.interviewId);
        getInterviewDetails();
    }, [])

    const getInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId)) 

        console.log(result);
        setInterviewData(result[0]);
    }

    const disableWebcam = () => {
        if (webcamRef.current) {
            const mediaStream = webcamRef.current.stream;
            const tracks = mediaStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        setWebcamEnabled(false);
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-700 via-black to-slate-800 text-white overflow-hidden">
            <div className="container mx-auto px-6 py-10 h-full overflow-auto">
                <h2 className='mt-16 text-4xl font-bold mb-8 
                    bg-clip-text text-transparent 
                    bg-gradient-to-r from-cyan-300 to-blue-500'>
                    Gear up for Your Interview!
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
                    {/* Interview Details */}
                    <div className='space-y-6'>
                    <div className='bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                            <div className='space-y-4'>
                                <div className='flex items-center space-x-3'>
                                    <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                                    <h2 className='text-lg font-bold'>
                                        <span className='text-gray-400 mr-2'>Job Title:</span>
                                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500'>
                                            {interviewData?.jobPosition}
                                        </span>
                                    </h2>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                                    <h2 className='text-lg font-bold'>
                                        <span className='text-gray-400 mr-2'>Tech Stacks:</span>
                                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500'>
                                            {interviewData?.techStacks}
                                        </span>
                                    </h2>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
                                    <h2 className='text-lg font-bold'>
                                        <span className='text-gray-400 mr-2'>Job Experience:</span>
                                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500'>
                                            {interviewData?.jobExperience}
                                        </span>
                                    </h2>
                                </div>
                            </div>
                        </div>
                        {/* ... (previous interview details code remains the same) */}
                        <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6'>
                            <div className='flex items-center space-x-3 mb-4'>
                                <Lightbulb className='text-yellow-500' />
                                <h2 className='text-xl font-bold text-yellow-500'>
                                    Important Information
                                </h2>
                            </div>
                            <p className='text-gray-300 text-sm text-yellow-300'>
                                Enable your webcam and microphone for the AI-powered mock interview. 
                                This session includes 10 questions to help assess and improve your interview skills.
                            </p>
                            <p className='text-xs text-yellow-600 mt-3'>
                                <strong>Note:</strong> Your privacy is our priority. We do not record or store any personal data.
                            </p>
                        </div>
                    </div>

                    {/* Webcam Section */}
                    <div className='bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10'>
                        {webcamEnabled ? 
                            <div className='space-y-8'>
                                <Webcam
                                    ref={webcamRef}
                                    onUserMedia={() => setWebcamEnabled(true)}
                                    onUserMediaError={() => setWebcamEnabled(false)}
                                    mirrored={true}
                                    style={{
                                        height: 300,
                                        width: '100%',
                                        // borderRadius: '12px',
                                    }}
                                />
                                <Button 
                                    variant="destructive"
                                    onClick={disableWebcam}
                                    className='w-full flex items-center justify-center space-x-2 
                                    bg-red-500/20 border-red-500/30 
                                    hover:bg-red-500/40 text-red-400'
                                >
                                    <CameraOff size={16} />
                                    <span>Disable Camera</span>
                                </Button>
                            </div>
                            :
                            <div className='flex flex-col items-center space-y-6'>
                                <div className='bg-white/10 p-12 rounded-2xl'>
                                    <WebcamIcon 
                                        className='w-32 h-32 text-blue-400/50' 
                                        strokeWidth={1}
                                    />
                                </div>
                                <Button 
                                    onClick={() => setWebcamEnabled(true)}
                                    className='bg-gradient-to-r from-cyan-500 to-blue-500 
                                    hover:from-cyan-600 hover:to-blue-600 
                                    flex items-center space-x-2 font-bold'
                                >
                                    <WebcamIcon size={20} />
                                    <span>Enable Webcam & Microphone</span>
                                </Button>
                            </div>
                        }
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className='mt-10 flex justify-end space-x-4'>
                    <Link href='/dashboard'>
                        <Button 
                            variant="outline" 
                            className='bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white flex items-center space-x-2'
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Dashboard</span>
                        </Button>
                    </Link>
                    <Link href={`/dashboard/interview/${params.interviewId}/start`}>
                        <Button 
                            className='bg-gradient-to-r from-cyan-500 to-blue-500 
                            hover:from-cyan-600 hover:to-blue-600 
                            flex items-center space-x-2'
                        >
                            <Play size={16} />
                            <span>Start Interview</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Interview