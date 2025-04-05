// import { Button } from '@/components/ui/button'
// import { db } from '@/utils/db';
// import { chatSession } from '@/utils/GeminiAiModel';
// import { UserAnswer } from '@/utils/schema';
// import { useUser } from '@clerk/nextjs';
// import { Mic } from 'lucide-react';
// import moment from 'moment';
// import Image from 'next/image'
// import React, { useEffect, useRef, useState } from 'react'
// import Webcam from 'react-webcam'
// import { toast } from 'sonner';

// function RecordAnsSection({mockInterviewQues, activeQuestionIndex, interviewData}) {
//     const [userAnswer, setUserAnswer] = useState('');
//     const {user} = useUser();
//     const [loading, setLoading] = useState(false);
//     const [isRecording, setIsRecording] = useState(false);
//     const recognitionRef = useRef(null);
//     const transcriptRef = useRef(''); // Store transcript in a ref to avoid state update issues

//     // Initialize speech recognition
//     useEffect(() => {
//         if (typeof window !== 'undefined' && !recognitionRef.current) {
//             try {
//                 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                
//                 if (!SpeechRecognition) {
//                     console.error("❌ Speech Recognition not supported in this browser");
//                     toast.error("Speech recognition not supported in your browser");
//                     return;
//                 }
                
//                 recognitionRef.current = new SpeechRecognition();
//                 recognitionRef.current.continuous = true;
//                 recognitionRef.current.interimResults = true;
                
//                 recognitionRef.current.onresult = (event) => {
//                     let transcript = '';
//                     // Get the final transcript from the event
//                     for (let i = 0; i < event.results.length; i++) {
//                         transcript += event.results[i][0].transcript + ' ';
//                     }
                    
//                     console.log("🎙 Speech Result:", transcript);
//                     transcriptRef.current = transcript.trim();
                    
//                     // Update state for UI display
//                     setUserAnswer(transcript.trim());
//                 };
                
//                 recognitionRef.current.onerror = (event) => {
//                     console.error("❌ Speech Recognition Error:", event.error);
//                     if (event.error === 'no-speech') {
//                         console.log("No speech detected");
//                     } else {
//                         toast.error(`Speech recognition error: ${event.error}`);
//                     }
//                 };
                
//                 recognitionRef.current.onend = () => {
//                     console.log("🔄 Speech Recognition Ended");
                    
//                     // Only auto-restart if we're still supposed to be recording
//                     if (isRecording) {
//                         console.log("🔄 Auto-restarting recognition");
//                         try {
//                             recognitionRef.current.start();
//                         } catch (e) {
//                             console.error("Failed to restart recognition:", e);
//                         }
//                     }
//                 };
                
//                 console.log("🎤 Speech Recognition initialized successfully");
//             } catch (error) {
//                 console.error("❌ Failed to initialize speech recognition:", error);
//                 toast.error("Failed to initialize speech recognition");
//             }
//         }
//     }, []);

//     // Request microphone permission on component mount
//     useEffect(() => {
//         navigator.mediaDevices.getUserMedia({ audio: true })
//             .then(() => console.log("🎙️ Mic Permission Granted"))
//             .catch(err => {
//                 console.error("❌ Mic Permission Denied:", err);
//                 toast.error("Microphone access denied. Please check your browser permissions.");
//             });
//     }, []);

//     const startRecording = () => {
//         if (recognitionRef.current) {
//             try {
//                 console.log("🎤 Starting recording...");
//                 transcriptRef.current = ''; // Clear previous transcript
//                 setUserAnswer(''); // Clear the UI
//                 recognitionRef.current.start();
//                 setIsRecording(true);
//                 toast.success("Recording started");
//             } catch (error) {
//                 console.error("❌ Failed to start recording:", error);
//                 toast.error("Failed to start recording");
//             }
//         } else {
//             toast.error("Speech recognition not available");
//         }
//     };

//     const stopRecording = () => {
//         if (recognitionRef.current && isRecording) {
//             try {
//                 console.log("🛑 Stopping recording...");
//                 recognitionRef.current.stop();
//                 setIsRecording(false);
                
//                 // Get the final transcript from our ref
//                 const finalTranscript = transcriptRef.current;
//                 console.log("Final transcript:", finalTranscript);
                
//                 // Make sure we have a valid transcript before saving
//                 if (finalTranscript && finalTranscript.trim().length > 5) {
//                     // Ensure UI is updated with final transcript
//                     setUserAnswer(finalTranscript);
                    
//                     // Wait a moment then save the answer
//                     setTimeout(() => {
//                         updateUserAnswer(finalTranscript);
//                     }, 500);
//                 } else {
//                     toast.error("No speech detected or answer too short");
//                 }
//             } catch (error) {
//                 console.error("❌ Failed to stop recording:", error);
//                 toast.error("Failed to stop recording");
//             }
//         } else {
//             console.warn("⚠️ Not recording, so can't stop!");
//         }
//     };

//     const startStopRecording = () => {
//         if (isRecording) {
//             stopRecording();
//         } else {
//             startRecording();
//         }
//     };

//     const updateUserAnswer = async (finalTranscript) => {
//         // Double-check we have valid text
//         if (!finalTranscript || finalTranscript.trim().length < 5) {
//             toast.error('Answer text too short or empty!');
//             return;
//         }
        
//         console.log("Saving answer to database:", finalTranscript);
//         toast.info('Processing your answer...');
//         setLoading(true);
        
//         try {
//             const feedbackPrompt = "Question: " + mockInterviewQues[activeQuestionIndex]?.ques +
//                 ", User Answer: " + finalTranscript +
//                 ", Depending on question and user answer for given interview question" +
//                 " Please give us rating for answer and feedback as area of improvement if any." +
//                 "In Just 3 to 5 lines to improve it in JSON format with rating field and feedback field." +
//                 "Strictly follow these JSON rules:1. **Do not include any markdown formatting** (like ```json or ```)." +
//                 "2. Ensure that all answers are **single-line or properly escaped**." +
//                 "3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values.";
        
//             const result = await chatSession.sendMessage(feedbackPrompt);
//             const rawResponse = await result.response.text();
//             console.log("Raw Response:", rawResponse);
            
//             let parsedResponse;
//             try {
//                 // Try direct parsing first
//                 parsedResponse = JSON.parse(rawResponse.trim());
//             } catch (e) {
//                 // If that fails, try to extract JSON from markdown format
//                 try {
//                     const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
//                     if (jsonMatch) {
//                         parsedResponse = JSON.parse(jsonMatch[1].trim());
//                     } else {
//                         throw new Error("Could not parse JSON response");
//                     }
//                 } catch (jsonError) {
//                     console.error("JSON parsing failed:", jsonError);
//                     // Create fallback response
//                     parsedResponse = {
//                         feedback: "Could not parse feedback. The answer was recorded.",
//                         rating: "N/A"
//                     };
//                 }
//             }
            
//             console.log("Parsed feedback:", parsedResponse);
            
//             const resp = await db.insert(UserAnswer)
//                 .values({
//                     mockIdRef: interviewData?.mockId,
//                     question: mockInterviewQues[activeQuestionIndex]?.ques,
//                     correctAns: mockInterviewQues[activeQuestionIndex]?.ans,
//                     userAnswer: finalTranscript, // Use the parameter instead of state
//                     feedback: parsedResponse?.feedback || "No feedback available",
//                     rating: parsedResponse?.rating || "N/A",
//                     userEmail: user?.primaryEmailAddress?.emailAddress,
//                     createdAt: moment().format('DD-MM-YYYY')
//                 });
            
//             if (resp) {
//                 toast.success('User Answer Recorded Successfully!');
//                 console.log("🎉 Answer saved to database!");
//                 setUserAnswer(''); // Clear the UI after successful save
//                 transcriptRef.current = ''; // Clear the transcript ref
//             } else {
//                 toast.error('⚠️ Failed to save answer to database.');
//             }
//         } catch (error) {
//             console.error("🚨 Error updating user answer:", error);
//             toast.error('❌ Something went wrong. Try again!');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className='flex flex-col items-center justify-center'>
//             <div className='flex flex-col justify-center items-center bg-pink-50 rounded-lg p-5 mt-20 shadow-lg'>
//                 <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt="webcam image"/>
//                 <Webcam
//                     mirrored={true}
//                     style={{
//                         height: 300,
//                         width: '100%',
//                         zIndex: 10
//                     }}
//                 />
//             </div>
            
//             {/* Display current transcript while recording */}
//             {userAnswer && (
//                 <div className="bg-white rounded-lg p-4 my-4 w-full max-w-lg shadow-md">
//                     <h3 className="font-medium mb-2">Your answer:</h3>
//                     <p className="text-gray-700">{userAnswer}</p>
//                 </div>
//             )}
            
//             <Button 
//                 disabled={loading} 
//                 variant='outline' 
//                 className='my-5'
//                 onClick={startStopRecording}
//             >
//                 {isRecording ? (
//                     <>
//                         <Mic className="text-red-700 animate-pulse" />
//                         <span className='text-red-700 font-semibold animate-pulse ml-2'>Stop Recording</span>
//                     </>
//                 ) : (
//                     <>
//                         <Mic className="mr-2" />
//                         <span>Record Answer</span>
//                     </>
//                 )}
//             </Button>
//         </div>
//     );
// }

// export default RecordAnsSection;

// ----------------------------------------------------------------

// import { Button } from '@/components/ui/button'
// import { db } from '@/utils/db';
// import { chatSession } from '@/utils/GeminiAiModel';
// import { UserAnswer } from '@/utils/schema';
// import { useUser } from '@clerk/nextjs';
// import { Mic, StopCircle } from 'lucide-react';
// import moment from 'moment';
// import Image from 'next/image'
// import React, { useEffect, useRef, useState } from 'react'
// import Webcam from 'react-webcam'
// import { toast } from 'sonner';

// function RecordAnsSection({mockInterviewQues, activeQuestionIndex, interviewData}) {
//     const [userAnswer, setUserAnswer] = useState('');
//     const {user} = useUser();
//     const [loading, setLoading] = useState(false);
//     const [isRecording, setIsRecording] = useState(false);
//     const recognitionRef = useRef(null);
//     const transcriptRef = useRef(''); // Store transcript in a ref to avoid state update issues

    // // Initialize speech recognition
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && !recognitionRef.current) {
    //         try {
    //             const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                
    //             if (!SpeechRecognition) {
    //                 console.error("❌ Speech Recognition not supported in this browser");
    //                 toast.error("Speech recognition not supported in your browser");
    //                 return;
    //             }
                
    //             recognitionRef.current = new SpeechRecognition();
    //             recognitionRef.current.continuous = true;
    //             recognitionRef.current.interimResults = true;
                
    //             recognitionRef.current.onresult = (event) => {
    //                 let transcript = '';
    //                 // Get the final transcript from the event
    //                 for (let i = 0; i < event.results.length; i++) {
    //                     transcript += event.results[i][0].transcript + ' ';
    //                 }
                    
    //                 console.log("🎙 Speech Result:", transcript);
    //                 transcriptRef.current = transcript.trim();
                    
    //                 // Update state for UI display
    //                 setUserAnswer(transcript.trim());
    //             };
                
    //             recognitionRef.current.onerror = (event) => {
    //                 console.error("❌ Speech Recognition Error:", event.error);
    //                 if (event.error === 'no-speech') {
    //                     console.log("No speech detected");
    //                 } else {
    //                     toast.error(`Speech recognition error: ${event.error}`);
    //                 }
    //             };
                
    //             recognitionRef.current.onend = () => {
    //                 console.log("🔄 Speech Recognition Ended");
                    
    //                 // Only auto-restart if we're still supposed to be recording
    //                 if (isRecording) {
    //                     console.log("🔄 Auto-restarting recognition");
    //                     try {
    //                         recognitionRef.current.start();
    //                     } catch (e) {
    //                         console.error("Failed to restart recognition:", e);
    //                     }
    //                 }
    //             };
                
    //             console.log("🎤 Speech Recognition initialized successfully");
    //         } catch (error) {
    //             console.error("❌ Failed to initialize speech recognition:", error);
    //             toast.error("Failed to initialize speech recognition");
    //         }
    //     }
    // }, []);

    // // Request microphone permission on component mount
    // useEffect(() => {
    //     navigator.mediaDevices.getUserMedia({ audio: true })
    //         .then(() => console.log("🎙️ Mic Permission Granted"))
    //         .catch(err => {
    //             console.error("❌ Mic Permission Denied:", err);
    //             toast.error("Microphone access denied. Please check your browser permissions.");
    //         });
    // }, []);

    // const startRecording = () => {
    //     if (recognitionRef.current) {
    //         try {
    //             console.log("🎤 Starting recording...");
    //             transcriptRef.current = ''; // Clear previous transcript
    //             setUserAnswer(''); // Clear the UI
    //             recognitionRef.current.start();
    //             setIsRecording(true);
    //             toast.success("Recording started");
    //         } catch (error) {
    //             console.error("❌ Failed to start recording:", error);
    //             toast.error("Failed to start recording");
    //         }
    //     } else {
    //         toast.error("Speech recognition not available");
    //     }
    // };

    // const stopRecording = () => {
    //     if (recognitionRef.current && isRecording) {
    //         try {
    //             console.log("🛑 Stopping recording...");
    //             recognitionRef.current.stop();
    //             setIsRecording(false);
                
    //             // Get the final transcript from our ref
    //             const finalTranscript = transcriptRef.current;
    //             console.log("Final transcript:", finalTranscript);
                
    //             // Make sure we have a valid transcript before saving
    //             if (finalTranscript && finalTranscript.trim().length > 5) {
    //                 // Ensure UI is updated with final transcript
    //                 setUserAnswer(finalTranscript);
                    
    //                 // Wait a moment then save the answer
    //                 setTimeout(() => {
    //                     updateUserAnswer(finalTranscript);
    //                 }, 500);
    //             } else {
    //                 toast.error("No speech detected or answer too short");
    //             }
    //         } catch (error) {
    //             console.error("❌ Failed to stop recording:", error);
    //             toast.error("Failed to stop recording");
    //         }
    //     } else {
    //         console.warn("⚠️ Not recording, so can't stop!");
    //     }
    // };

    // const startStopRecording = () => {
    //     if (isRecording) {
    //         stopRecording();
    //     } else {
    //         startRecording();
    //     }
    // };

    // const updateUserAnswer = async (finalTranscript) => {
    //     // Double-check we have valid text
    //     if (!finalTranscript || finalTranscript.trim().length < 5) {
    //         toast.error('Answer text too short or empty!');
    //         return;
    //     }
        
    //     console.log("Saving answer to database:", finalTranscript);
    //     toast.info('Processing your answer...');
    //     setLoading(true);
        
    //     try {
    //         const feedbackPrompt = "Question: " + mockInterviewQues[activeQuestionIndex]?.ques +
    //             ", User Answer: " + finalTranscript +
    //             ", Depending on question and user answer for given interview question" +
    //             " Please give us rating for answer and feedback as area of improvement if any." +
    //             "In Just 3 to 5 lines to improve it in JSON format with rating field and feedback field." +
    //             "Strictly follow these JSON rules:1. **Do not include any markdown formatting** (like ```json or ```)." +
    //             "2. Ensure that all answers are **single-line or properly escaped**." +
    //             "3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values.";
        
    //         const result = await chatSession.sendMessage(feedbackPrompt);
    //         const rawResponse = await result.response.text();
    //         console.log("Raw Response:", rawResponse);
            
    //         let parsedResponse;
    //         try {
    //             // Try direct parsing first
    //             parsedResponse = JSON.parse(rawResponse.trim());
    //         } catch (e) {
    //             // If that fails, try to extract JSON from markdown format
    //             try {
    //                 const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
    //                 if (jsonMatch) {
    //                     parsedResponse = JSON.parse(jsonMatch[1].trim());
    //                 } else {
    //                     throw new Error("Could not parse JSON response");
    //                 }
    //             } catch (jsonError) {
    //                 console.error("JSON parsing failed:", jsonError);
    //                 // Create fallback response
    //                 parsedResponse = {
    //                     feedback: "Could not parse feedback. The answer was recorded.",
    //                     rating: "N/A"
    //                 };
    //             }
    //         }
            
    //         console.log("Parsed feedback:", parsedResponse);
            
    //         const resp = await db.insert(UserAnswer)
    //             .values({
    //                 mockIdRef: interviewData?.mockId,
    //                 question: mockInterviewQues[activeQuestionIndex]?.ques,
    //                 correctAns: mockInterviewQues[activeQuestionIndex]?.ans,
    //                 userAnswer: finalTranscript, // Use the parameter instead of state
    //                 feedback: parsedResponse?.feedback || "No feedback available",
    //                 rating: parsedResponse?.rating || "N/A",
    //                 userEmail: user?.primaryEmailAddress?.emailAddress,
    //                 createdAt: moment().format('DD-MM-YYYY')
    //             });
            
    //         if (resp) {
    //             toast.success('User Answer Recorded Successfully!');
    //             console.log("🎉 Answer saved to database!");
    //             setUserAnswer(''); // Clear the UI after successful save
    //             transcriptRef.current = ''; // Clear the transcript ref
    //         } else {
    //             toast.error('⚠️ Failed to save answer to database.');
    //         }
    //     } catch (error) {
    //         console.error("🚨 Error updating user answer:", error);
    //         toast.error('❌ Something went wrong. Try again!');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

//     return (
//         <div className='flex flex-col items-center justify-center space-y-4 h-full -mt-4'>
//             {/* Webcam Section */}
//             <div className='bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-3 w-full'>
//                 <div className='relative rounded-2xl overflow-hidden'>
//                     <Webcam
//                         mirrored={true}
//                         style={{
//                             height: 300,
//                             width: '100%',
//                             objectFit: 'cover',
//                             borderRadius: '1rem'
//                         }}
//                     />
//                     <div className='absolute top-4 right-4 bg-black/30 rounded-full p-2'>
//                         <Image 
//                             src='/webcam.png' 
//                             width={30} 
//                             height={30} 
//                             alt="webcam overlay" 
//                             className='opacity-60'
//                         />
//                     </div>
//                 </div>
//             </div>
            
//             {/* Transcript Display with Max Height and Scrolling */}
//             {userAnswer && (
//                 <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 w-full border border-white/10 max-h-40 overflow-y-auto">
//                     <h3 className="text-xl font-semibold mb-4 
//                         bg-clip-text text-transparent 
//                         bg-gradient-to-r from-cyan-300 to-blue-500">
//                         Your Answer
//                     </h3>
//                     <p className="text-gray-300 break-words">{userAnswer}</p>
//                 </div>
//             )}
            
//             {/* Record Button */}
//             <Button 
//                 disabled={loading} 
//                 className={`
//                     w-full 
//                     py-6
//                     flex items-center justify-center 
//                     space-x-3 
//                     ${isRecording 
//                         ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/40 text-red-400' 
//                         : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'}
//                 `}
//                 onClick={startStopRecording}
//             >
//                 {isRecording ? (
//                     <>
//                         <StopCircle className="animate-pulse" size={24} />
//                         <span className='font-semibold animate-pulse'>Stop Recording</span>
//                     </>
//                 ) : (
//                     <>
//                         <Mic size={24} />
//                         <span>Record Your Answer</span>
//                     </>
//                 )}
//             </Button>
//         </div>
//     );
// }

// export default RecordAnsSection;


"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle, CameraOff, Edit, Check, Camera } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { toast } from 'sonner';

function RecordAnsSection({mockInterviewQues, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const [editableAnswer, setEditableAnswer] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [webcamEnabled, setWebcamEnabled] = useState(true);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');
    const webcamRef = useRef(null);

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
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                    
                    console.log("🎙 Speech Result:", transcript);
                    transcriptRef.current = transcript.trim();
                    
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

    const toggleWebcam = () => {
        if (webcamRef.current && webcamEnabled) {
            const mediaStream = webcamRef.current.stream;
            const tracks = mediaStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        setWebcamEnabled(!webcamEnabled);
    };

    const startRecording = () => {
        if (recognitionRef.current) {
            try {
                console.log("🎤 Starting recording...");
                transcriptRef.current = '';
                setUserAnswer('');
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
                
                const finalTranscript = transcriptRef.current;
                
                if (finalTranscript && finalTranscript.trim().length > 5) {
                    setUserAnswer(finalTranscript);
                    setEditableAnswer(finalTranscript);
                    setIsEditing(true);
                } else {
                    toast.error("No speech detected or answer too short");
                }
            } catch (error) {
                console.error("❌ Failed to stop recording:", error);
                toast.error("Failed to stop recording");
            }
        }
    };

    const startStopRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleEditAnswer = () => {
        setEditableAnswer(userAnswer);
        setIsEditing(true);
    };

    const handleSaveEditedAnswer = () => {
        if (editableAnswer.trim().length < 5) {
            toast.error('Answer is too short');
            return;
        }

        setUserAnswer(editableAnswer);
        setIsEditing(false);
        updateUserAnswer(editableAnswer);
    };

    const updateUserAnswer = async (finalTranscript) => {
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
                " Please give us rating for answer and feedback as area of improvement if any. The rating should be upon 5." +
                "In Just 3 to 5 lines to improve it in JSON format with rating field and feedback field." +
                "Strictly follow these JSON rules:1. **Do not include any markdown formatting** (like ```json or ```)." +
                "2. Ensure that all answers are **single-line or properly escaped**." +
                "3. Do **not** use line breaks (\\n) or extra spaces inside the JSON values.";
        
            const result = await chatSession.sendMessage(feedbackPrompt);
            const rawResponse = await result.response.text();
            console.log("Raw Response:", rawResponse);
            
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(rawResponse.trim());
            } catch (e) {
                try {
                    const jsonMatch = rawResponse.match(/```json([\s\S]*?)```/);
                    if (jsonMatch) {
                        parsedResponse = JSON.parse(jsonMatch[1].trim());
                    } else {
                        throw new Error("Could not parse JSON response");
                    }
                } catch (jsonError) {
                    console.error("JSON parsing failed:", jsonError);
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
                    userAnswer: finalTranscript,
                    feedback: parsedResponse?.feedback || "No feedback available",
                    rating: parsedResponse?.rating || "N/A",
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-YYYY')
                });
            
            if (resp) {
                toast.success('User Answer Recorded Successfully!');
                console.log("🎉 Answer saved to database!");
                setUserAnswer('');
                transcriptRef.current = '';
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
        <div className='flex flex-col items-center justify-center space-y-4 h-full'>
            {/* Webcam Section */}
            <div className='bg-white/4 backdrop-blur-xl rounded-3xl border border-white/10 p-3 w-full'>
                <div className='relative rounded-2xl overflow-hidden'>
                    {webcamEnabled ? (
                        <Webcam
                            ref={webcamRef}
                            mirrored={true}
                            style={{
                                height: 350,
                                width: '100%',
                                objectFit: 'cover',
                                borderRadius: '1rem'
                            }}
                        />
                    ) : (
                        <div className='h-[300px] flex items-center justify-center bg-gray-800 rounded-2xl'>
                            <CameraOff className='text-gray-500' size={64} />
                        </div>
                    )}
                    
                    <div className='absolute top-4 right-4 bg-black/50 rounded-sm'>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={toggleWebcam}
                            className='text-white hover:bg-black/50 hover:text-white'
                        >
                            {webcamEnabled ? <CameraOff size={20} /> : <Camera size={20} />}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Transcript Display with Editing */}
            {userAnswer && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 w-full border border-white/10 max-h-48 overflow-y-auto">
                    <div className='flex justify-between items-center mb-2'>
                        <h3 className="text-xl font-bold 
                            bg-clip-text text-transparent 
                            bg-gradient-to-r from-cyan-300 to-blue-500">
                            Your Answer
                        </h3>
                        {!isEditing ? (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleEditAnswer}
                                className='flex items-center space-x-2 text-black'
                            >
                                <Edit size={16} />
                                <span>You can edit after recording</span>
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleSaveEditedAnswer}
                                className='flex items-center space-x-2 font-bold border-green-500 text-green-500 hover:bg-green-500/10 hover:text-white'
                            >
                                <Check size={16} />
                                <span>Done</span>
                            </Button>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <textarea
                            value={editableAnswer}
                            onChange={(e) => setEditableAnswer(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />
                    ) : (
                        <p className="text-gray-300 break-words">{userAnswer}</p>
                    )}
                </div>
            )}
            
            {/* Record Button */}
            <Button 
                disabled={loading} 
                className={`
                    w-full 
                    py-6
                    flex items-center justify-center 
                    space-x-3 
                    ${isRecording 
                        ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/40 text-red-400' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'}
                `}
                onClick={startStopRecording}
            >
                {isRecording ? (
                    <>
                        <StopCircle className="animate-pulse" size={24} />
                        <span className='font-bold animate-pulse'>Stop Recording</span>
                    </>
                ) : (
                    <>
                        <Mic size={24} />
                        <span>Record Your Answer</span>
                    </>
                )}
            </Button>
        </div>
    );
}

export default RecordAnsSection;