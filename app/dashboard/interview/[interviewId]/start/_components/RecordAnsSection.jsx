import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import useSpeechToText from 'react-hook-speech-to-text';
import Webcam from 'react-webcam'
import { toast } from 'sonner';

function RecordAnsSection({mockInterviewQues, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const {user}=useUser();
    const [loading, setLoading] = useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: true
      });

      console.log("🔥 Hook Initialized:", isRecording);

      useEffect(() => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            console.error("❌ Speech Recognition API not supported in this browser");
            return;
        }
    
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
    
        recognition.onresult = (event) => {
            console.log("🎙 Speech Result:", event.results[0][0].transcript);
        };
    
        recognition.onerror = (event) => {
            console.error("❌ Speech Recognition Error:", event.error);
        };
    
        recognition.start();
        console.log("✅ Speech Recognition Started");
    
        return () => {
            recognition.stop();
            console.log("⛔ Speech Recognition Stopped");
        };
    }, []);

      navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log("🎙️ Mic Permission Granted"))
  .catch(err => console.error("❌ Mic Permission Denied:", err));


      useEffect(() => {
        if (error) {
            console.log("🚨 Speech Recognition Error:", error);
        }
    }, [error]);

    useEffect(() => {
        console.log("🛠 useEffect triggered for error:", error);
        if (error) {
            console.log("🚨 Speech Recognition Error:", error);
        }
    }, [error]);
    

      useEffect(()=>{
        console.log("🎤 isRecording:", isRecording);
    }, [isRecording]);
    

      useEffect(()=>{
        console.log("Speech Results:", results);
    }, [results]);
    

      useEffect(() => {
        if (results.length > 0) {
            setUserAnswer(prevAns => prevAns + " " + results.map(r => r.transcript).join(" "));
        }
    }, [results]);
    

    //   useEffect(()=>{
    //     results.map((result)=>{
    //         setUserAnswer(prevAns=>prevAns+result?.transcript)
    //     })
    //   }, [results])

      useEffect(()=>{
        if(!isRecording && userAnswer.length>10){
            updateUserAnswer();
        }
      }, [userAnswer])

    const startStopRecording = async()=>{
        if (isRecording) {
            stopSpeechToText();
        } 
        else {
            startSpeechToText();
        }
    };

    const updateUserAnswer = async()=>{
        console.log(userAnswer);
        setLoading(true);
        const feedbackPrompt="Question: "+mockInterviewQues[activeQuestionIndex]?.ques+
        ", User Answer: "+userAnswer+
        ", Depending on question and user answer for given interview question"+
        " Please give us rating for answer and feedback as area of improvement if any."+
        "In Just 3 to 5 lines to improve it in JSON format with rating field and feedback field."+
        "Strictly follow these JSON rules:1. **Do not include any markdown formatting** (like \`\`\`json or \`\`\`).2. Ensure that all answers are **single-line or properly escaped**.3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values."

        const result = await chatSession.sendMessage(feedbackPrompt);
        const rawResponse = await result.response.text();
        console.log("Raw Response:", rawResponse);
        const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
        if (!jsonMatch) throw new Error("Response does not contain JSON");

        const mockJsonResponse = jsonMatch[1].trim();
        console.log(mockJsonResponse);

        const parsedResponse = JSON.parse(mockJsonResponse);

        const resp=await db.insert(UserAnswer)
        .values({
            mockIdRef: interviewData?.mockId,
            question: mockInterviewQues[activeQuestionIndex]?.ques,
            correctAns: mockInterviewQues[activeQuestionIndex]?.ans,
            userAnswer: userAnswer,
            feedback: parsedResponse?.feedback,
            rating: parsedResponse?.rating,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY')
        })

        if(resp){
            toast('User Answer Recorded Successfully');
            setUserAnswer('');
            setResults([]);
        }
        else{
            toast('Please Record once again');
        }
        setResults([]);
        setLoading(false);


    }


  return (
    <div className='flex flex-col items-center justify-center'>
        <div className='flex flex-col justify-center items-center bg-pink-50 rounded-lg p-5 mt-20 shadow-lg'>
            <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt="webcam image"/>
            <Webcam
            mirrored={true}
            style={{
                height: 300,
                width: '100%',
                zIndex:10
            }}
            />
        </div>
        <Button disabled={loading} variant='outline' className='my-5'
        onClick={startStopRecording} >
            {isRecording?
            <>
                <Mic className="text-red-700 animate-pulse" />
                <span className='text-red-700 font-semibold animate-pulse'>Stop Recording</span>
            </>
            :
            'Record Answer'}
        </Button>

            {/* <Button onClick={()=>{console.log(userAnswer)}}>Show User Answer</Button> */}
    </div>
    
  )
}

export default RecordAnsSection