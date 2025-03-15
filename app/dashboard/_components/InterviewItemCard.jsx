// import { Button } from '@/components/ui/button'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import React from 'react'

// function InterviewItemCard({interview}) {
//     const router=useRouter();
//     const onStart=()=>{
//         router.push(`/dashboard/interview/${interview?.mockId}`)
//         console.log('start clicked', interview?.mockId);
//     }
//     const onFeedback=()=>{
//         router.push(`/dashboard/interview/${interview?.mockId}/feedback`)
//         console.log('feedback clicked', interview?.mockId);
//     }
//   return (
//     <div className='border border-pink-100 shadow-md rounded-lg p-3'>
//         <h2 className='font-bold text-pink-600 text-lg'>{interview?.jobPosition}</h2>
//         <h2 className='font-bold text-gray-600 text-sm'>Years of Experience: {interview.jobExperience} years</h2>
//         <h2 className='font-bold text-gray-400 text-xs'>Created At: {interview.createdAt}</h2>

//         <div className='flex justify-between mt-3 gap-5'>
//             {/* <Link href={'/dashboard/interview/'+interview?.mockId}> */}
//             <Button size='sm' variant='outline' className='w-full font-bold'
//             onClick={onFeedback}>Feedback</Button>
//             {/* </Link> */}
//             <Button size='sm' className='w-full font-bold' 
//             onClick={onStart}>Start</Button>
//         </div>
//     </div>
//   )
// }

// export default InterviewItemCard

// ----------------------------------------------------------------

// import { Button } from '@/components/ui/button'
// import { Zap, FileText } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import React from 'react'

// function InterviewItemCard({interview}) {
//     const router=useRouter();
//     const onStart=()=>{
//         router.push(`/dashboard/interview/${interview?.mockId}`)
//         console.log('start clicked', interview?.mockId);
//     }
//     const onFeedback=()=>{
//         router.push(`/dashboard/interview/${interview?.mockId}/feedback`)
//         console.log('feedback clicked', interview?.mockId);
//     }

//     return (
//         <div 
//             className='bg-white/5 
//             backdrop-blur-xl 
//             border-2 border-transparent 
//             hover:border-blue-500/20 
//             rounded-2xl 
//             p-5
//             space-y-4 
//             transition-all 
//             duration-300 
//             transform 
//             hover:scale-105 
//             hover:shadow-2xl 
//             flex 
//             flex-col 
//             justify-between 
//             h-full w-80'
//         >
//             <div>
//                 <div className='flex justify-between items-center mb-4'>
//                     <h2 className='text-xl font-bold 
//                         bg-clip-text text-transparent 
//                         bg-gradient-to-r from-cyan-300 to-blue-500'>
//                         {interview?.jobPosition}
//                     </h2>
//                     <h2 className='text-xs text-gray-400 
//                         bg-white/10 
//                         px-2 py-2
//                         rounded-lg'>
//                         {interview.jobExperience} years
//                     </h2>
//                 </div>

//                 <div className='space-y-2'>
//                     <p className='text-sm text-gray-300 flex items-center space-x-2'>
//                         <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
//                         <span>Tech Stack: {interview?.techStacks || 'Not specified'}</span>
//                     </p>
//                     <p className='text-xs text-gray-400 flex items-center space-x-2'>
//                         <span className='w-2 h-2 bg-green-500 rounded-full'></span>
//                         <span>Created: {interview.createdAt}</span>
//                     </p>
//                 </div>
//             </div>

//             <div className='grid grid-cols-2 gap-5 mt-4'>
//                 <Button 
//                     variant="outline" 
//                     className='w-full flex items-center justify-center 
//                     bg-transparent border-white/20 text-white 
//                     hover:bg-white/10 hover:text-white
//                     rounded-lg'
//                     onClick={onFeedback}
//                 >
//                     <FileText size={12} />
//                     <span>Feedback</span>
//                 </Button>
//                 <Button 
//                     className='w-full flex items-center justify-center space-x-2 
//                     bg-gradient-to-r from-cyan-500 to-blue-500 
//                     hover:from-cyan-600 hover:to-blue-600
//                     py-2 px-3
//                     rounded-lg'
//                     onClick={onStart}
//                 >
//                     <Zap size={16} />
//                     <span>Start</span>
//                 </Button>
//             </div>
//         </div>
//     )
// }

// export default InterviewItemCard

// ----------------------------------------------------------------

"use client"
import { Button } from '@/components/ui/button'
import { Zap, FileText, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { deleteInterview } from '@/utils/interviewUtils'
import { toast } from 'sonner'

function InterviewItemCard({interview, onDelete}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const onStart = () => {
        router.push(`/dashboard/interview/${interview?.mockId}`)
    }

    const onFeedback = () => {
        router.push(`/dashboard/interview/${interview?.mockId}/feedback`)
    }

    const handleDelete = async () => {
        // Confirm deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this interview?");
        
        if (confirmDelete) {
            setIsDeleting(true);
            try {
                const result = await deleteInterview(interview?.mockId);
                
                if (result.success) {
                    toast.success("Interview deleted successfully");
                    // Call the onDelete prop to refresh the list
                    if (onDelete) {
                        onDelete(interview?.mockId);
                    }
                } else {
                    toast.error("Failed to delete interview");
                }
            } catch (error) {
                console.error("Deletion error:", error);
                toast.error("An error occurred while deleting the interview");
            } finally {
                setIsDeleting(false);
            }
        }
    }

    return (
        <div 
            className='bg-white/5 
            backdrop-blur-xl 
            border-2 border-transparent 
            hover:border-blue-500/20 
            rounded-2xl 
            p-5
            space-y-4 
            transition-all 
            duration-300 
            transform 
            hover:scale-105 
            hover:shadow-2xl 
            flex 
            flex-col 
            justify-between 
            h-full w-80'
        >
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold 
                        bg-clip-text text-transparent 
                        bg-gradient-to-r from-cyan-300 to-blue-500'>
                        {interview?.jobPosition}
                    </h2>
                    <h2 className='text-xs text-gray-400 
                        bg-white/10 
                        px-2 py-2
                        rounded-lg'>
                        {interview.jobExperience} years
                    </h2>
                </div>

                <div className='space-y-2'>
                    <p className='text-sm text-gray-300 flex items-center space-x-2'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                        <span>Tech Stack: {interview?.techStacks || 'Not specified'}</span>
                    </p>
                    <p className='text-xs text-gray-400 flex items-center space-x-2'>
                        <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                        <span>Created: {interview.createdAt}</span>
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-[1fr_1fr_auto] gap-3 mt-4'>
                <Button 
                    variant="outline" 
                    className='w-full flex items-center justify-center 
                    bg-transparent border-white/20 text-white 
                    hover:bg-white/10 hover:text-white
                    rounded-md'
                    onClick={onFeedback}
                >
                    <FileText size={12} className="mr-1" />
                    <span>Feedback</span>
                </Button>
                <Button 
                    className='w-full flex items-center justify-center space-x-1 
                    bg-gradient-to-r from-cyan-500 to-blue-500 
                    hover:from-cyan-600 hover:to-blue-600
                    py-2 px-2
                    rounded-md'
                    onClick={onStart}
                >
                    <Zap size={14} />
                    <span>Start</span>
                </Button>
                <Button 
                    variant="destructive"
                    disabled={isDeleting}
                    className='w-auto px-2
                    bg-red-500/20 border-red-500/30 
                    hover:bg-red-500/40 text-red-400
                    rounded-md'
                    onClick={handleDelete}
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard