import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { toast } from 'sonner';

function RecordAnsSection({mockInterviewQues, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef(''); // Store transcript in a ref to avoid state update issues

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && !recognitionRef.current) {
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                
                if (!SpeechRecognition) {
                    console.error("❌ Speech Recognition not supported in this browser");
                    toast.error("Speech recognition not supported in your browser");
                    return;
                }
                
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                
                recognitionRef.current.onresult = (event) => {
                    let transcript = '';
                    // Get the final transcript from the event
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                    
                    console.log("🎙 Speech Result:", transcript);
                    transcriptRef.current = transcript.trim();
                    
                    // Update state for UI display
                    setUserAnswer(transcript.trim());
                };
                
                recognitionRef.current.onerror = (event) => {
                    console.error("❌ Speech Recognition Error:", event.error);
                    if (event.error === 'no-speech') {
                        console.log("No speech detected");
                    } else {
                        toast.error(`Speech recognition error: ${event.error}`);
                    }
                };
                
                recognitionRef.current.onend = () => {
                    console.log("🔄 Speech Recognition Ended");
                    
                    // Only auto-restart if we're still supposed to be recording
                    if (isRecording) {
                        console.log("🔄 Auto-restarting recognition");
                        try {
                            recognitionRef.current.start();
                        } catch (e) {
                            console.error("Failed to restart recognition:", e);
                        }
                    }
                };
                
                console.log("🎤 Speech Recognition initialized successfully");
            } catch (error) {
                console.error("❌ Failed to initialize speech recognition:", error);
                toast.error("Failed to initialize speech recognition");
            }
        }
    }, []);

    // Request microphone permission on component mount
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => console.log("🎙️ Mic Permission Granted"))
            .catch(err => {
                console.error("❌ Mic Permission Denied:", err);
                toast.error("Microphone access denied. Please check your browser permissions.");
            });
    }, []);

    const startRecording = () => {
        if (recognitionRef.current) {
            try {
                console.log("🎤 Starting recording...");
                transcriptRef.current = ''; // Clear previous transcript
                setUserAnswer(''); // Clear the UI
                recognitionRef.current.start();
                setIsRecording(true);
                toast.success("Recording started");
            } catch (error) {
                console.error("❌ Failed to start recording:", error);
                toast.error("Failed to start recording");
            }
        } else {
            toast.error("Speech recognition not available");
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            try {
                console.log("🛑 Stopping recording...");
                recognitionRef.current.stop();
                setIsRecording(false);
                
                // Get the final transcript from our ref
                const finalTranscript = transcriptRef.current;
                console.log("Final transcript:", finalTranscript);
                
                // Make sure we have a valid transcript before saving
                if (finalTranscript && finalTranscript.trim().length > 5) {
                    // Ensure UI is updated with final transcript
                    setUserAnswer(finalTranscript);
                    
                    // Wait a moment then save the answer
                    setTimeout(() => {
                        updateUserAnswer(finalTranscript);
                    }, 500);
                } else {
                    toast.error("No speech detected or answer too short");
                }
            } catch (error) {
                console.error("❌ Failed to stop recording:", error);
                toast.error("Failed to stop recording");
            }
        } else {
            console.warn("⚠️ Not recording, so can't stop!");
        }
    };

    const startStopRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const updateUserAnswer = async (finalTranscript) => {
        // Double-check we have valid text
        if (!finalTranscript || finalTranscript.trim().length < 5) {
            toast.error('Answer text too short or empty!');
            return;
        }
        
        console.log("Saving answer to database:", finalTranscript);
        toast.info('Processing your answer...');
        setLoading(true);
        
        try {
            const feedbackPrompt = "Question: " + mockInterviewQues[activeQuestionIndex]?.ques +
                ", User Answer: " + finalTranscript +
                ", Depending on question and user answer for given interview question" +
                " Please give us rating for answer and feedback as area of improvement if any." +
                "In Just 3 to 5 lines to improve it in JSON format with rating field and feedback field." +
                "Strictly follow these JSON rules:1. **Do not include any markdown formatting** (like ```json or ```)." +
                "2. Ensure that all answers are **single-line or properly escaped**." +
                "3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values.";
        
            const result = await chatSession.sendMessage(feedbackPrompt);
            const rawResponse = await result.response.text();
            console.log("Raw Response:", rawResponse);
            
            let parsedResponse;
            try {
                // Try direct parsing first
                parsedResponse = JSON.parse(rawResponse.trim());
            } catch (e) {
                // If that fails, try to extract JSON from markdown format
                try {
                    const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
                    if (jsonMatch) {
                        parsedResponse = JSON.parse(jsonMatch[1].trim());
                    } else {
                        throw new Error("Could not parse JSON response");
                    }
                } catch (jsonError) {
                    console.error("JSON parsing failed:", jsonError);
                    // Create fallback response
                    parsedResponse = {
                        feedback: "Could not parse feedback. The answer was recorded.",
                        rating: "N/A"
                    };
                }
            }
            
            console.log("Parsed feedback:", parsedResponse);
            
            const resp = await db.insert(UserAnswer)
                .values({
                    mockIdRef: interviewData?.mockId,
                    question: mockInterviewQues[activeQuestionIndex]?.ques,
                    correctAns: mockInterviewQues[activeQuestionIndex]?.ans,
                    userAnswer: finalTranscript, // Use the parameter instead of state
                    feedback: parsedResponse?.feedback || "No feedback available",
                    rating: parsedResponse?.rating || "N/A",
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-YYYY')
                });
            
            if (resp) {
                toast.success('User Answer Recorded Successfully!');
                console.log("🎉 Answer saved to database!");
                setUserAnswer(''); // Clear the UI after successful save
                transcriptRef.current = ''; // Clear the transcript ref
            } else {
                toast.error('⚠️ Failed to save answer to database.');
            }
        } catch (error) {
            console.error("🚨 Error updating user answer:", error);
            toast.error('❌ Something went wrong. Try again!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col justify-center items-center bg-pink-50 rounded-lg p-5 mt-20 shadow-lg'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt="webcam image"/>
                <Webcam
                    mirrored={true}
                    style={{
                        height: 300,
                        width: '100%',
                        zIndex: 10
                    }}
                />
            </div>
            
            {/* Display current transcript while recording */}
            {userAnswer && (
                <div className="bg-white rounded-lg p-4 my-4 w-full max-w-lg shadow-md">
                    <h3 className="font-medium mb-2">Your answer:</h3>
                    <p className="text-gray-700">{userAnswer}</p>
                </div>
            )}
            
            <Button 
                disabled={loading} 
                variant='outline' 
                className='my-5'
                onClick={startStopRecording}
            >
                {isRecording ? (
                    <>
                        <Mic className="text-red-700 animate-pulse" />
                        <span className='text-red-700 font-semibold animate-pulse ml-2'>Stop Recording</span>
                    </>
                ) : (
                    <>
                        <Mic className="mr-2" />
                        <span>Record Answer</span>
                    </>
                )}
            </Button>
        </div>
    );
}

export default RecordAnsSection;