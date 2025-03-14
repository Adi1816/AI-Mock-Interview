// import { Lightbulb, Volume1, Volume2 } from 'lucide-react';
// import React, { useState } from 'react'

// function QuestionsSection({mockInterviewQues, activeQuestionIndex}) {
//     console.log("miq: " ,mockInterviewQues);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const textToSpeech = (text) => {
//         if('speechSynthesis' in window){
//             const msg = new SpeechSynthesisUtterance(text);
//             msg.onstart = () => setIsSpeaking(true);  
//             msg.onend = () => setIsSpeaking(false);   
//             window.speechSynthesis.speak(msg);
//         }
//         else{
//             alert('Sorry! Your browser does not support text-to-speech');
//         }
//     }
//   return mockInterviewQues && (
//     <div className='p-5 border border-pink-200 rounded-lg mt-10 shadow-lg'>
//         <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
//             {mockInterviewQues && mockInterviewQues.map((question, index)=>(
//                 <h2 key={index} className=
//                 {`p-2 bg-white shadow-lg rounded-full font-semibold text-sm text-center cursor-pointer 
//                 ${activeQuestionIndex===index && 'text-pink-500 text-lg'}`}>
//                     Question # {index+1}</h2>
//             ))}
//         </div>
//         <h2 className='mt-10 text-lg text-pink-500 font-semibold'>Q. {mockInterviewQues[activeQuestionIndex]?.ques}</h2>
//         <div className='mt-2 cursor-pointer' onClick={() => textToSpeech(mockInterviewQues[activeQuestionIndex]?.ques)}>
//                 {isSpeaking ? <Volume2 className="animate-pulse text-pink-500" /> : <Volume2 className='text-pink-500' />}
//         </div>
//         <div className='border rounded-lg p-4 bg-yellow-100 border-yellow-300 mt-10'>
//             <h2 className='flex gap-2 items-center text-yellow-600'>
//                 <Lightbulb/>
//                 <strong>READ: </strong>
//             </h2>
//             <h2 className='mt-3 text-yellow-600 text-xs md:text-sm'>It is recommended to enable video webcam and microphone to start your AI generated mock interview. It has 10 questions which you can answer and at last you will get the report on the basis of your answer.</h2>
//                 <h2 className='mt-3 text-yellow-600 text-xs md:text-sm'><strong>NOTE:</strong> We never record your video or save any private stuff. You can disable the access of webcam anytime, if you want. <strong>Give a buffer time of 2 seconds before and after clicking on the Record Box.</strong>
//             </h2>
//         </div>

//     </div>
//   )
// }

// export default QuestionsSection

// ----------------------------------------------------------------

import { Lightbulb, Volume2 } from 'lucide-react';
import React, { useState } from 'react'

function QuestionsSection({mockInterviewQues, activeQuestionIndex, onQuestionChange}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const textToSpeech = (text) => {
        if('speechSynthesis' in window){
            const msg = new SpeechSynthesisUtterance(text);
            msg.onstart = () => setIsSpeaking(true);  
            msg.onend = () => setIsSpeaking(false);   
            window.speechSynthesis.speak(msg);
        }
        else{
            alert('Sorry! Your browser does not support text-to-speech');
        }
    }

    const handleQuestionChange = (index) => {
        if (onQuestionChange) {
            onQuestionChange(index);
        }
    }

  return mockInterviewQues && (
    <div className='mt-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-6'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {mockInterviewQues && mockInterviewQues.map((question, index)=>(
                <button 
                    key={index} 
                    onClick={() => handleQuestionChange(index)}
                    className={`
                        p-2 
                        rounded-xl 
                        text-center 
                        cursor-pointer 
                        transition-all 
                        duration-300 
                        focus:outline-none
                        ${activeQuestionIndex === index 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'}
                    `}
                >
                    <span className='text-sm font-light'>
                        Question #{index+1}
                    </span>
                </button>
            ))}
        </div>

        <div className='space-y-4'>
            <h2 className='text-xl font-bold 
                bg-clip-text text-transparent 
                bg-gradient-to-r from-cyan-300 to-blue-500'>
                Q. {mockInterviewQues[activeQuestionIndex]?.ques}
            </h2>
            
            <div 
                className='inline-block cursor-pointer 
                bg-white/10 p-2 rounded-full 
                hover:bg-white/20 transition-all'
                onClick={() => textToSpeech(mockInterviewQues[activeQuestionIndex]?.ques)}
            >
                {isSpeaking ? 
                    <Volume2 className="animate-pulse text-blue-400" /> : 
                    <Volume2 className='text-blue-400' />
                }
            </div>
        </div>

        <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6'>
            <div className='flex items-center space-x-3 mb-4'>
                <Lightbulb className='text-yellow-500' />
                <h2 className='text-xl font-bold text-yellow-500'>
                    Important Information
                </h2>
            </div>
            <p className='text-gray-300 text-sm mb-3 text-yellow-300'>
                Enable your webcam and microphone for the AI-powered mock interview. 
                This session includes 10 questions to help assess and improve your interview skills.
            </p>
            <p className='text-xs text-yellow-600'>
                <strong>Note:</strong> Your privacy is our priority. We do not record or store any personal data. 
                Give a buffer time of 2 seconds before and after clicking on the Record Box.
            </p>
        </div>
    </div>
  )
}

export default QuestionsSection