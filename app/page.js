"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";  // Router import kiya
import Footer from "@/components/ui/Footer";

export default function LandingPage() {
  const router = useRouter(); // Router instance create kiya

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6 bg-cover bg-center"
    style={{ 
      backgroundImage: "url('https://img.freepik.com/free-vector/watercolor-background_87374-57.jpg?t=st=1741549948~exp=1741553548~hmac=69b281a9c1366e521958d0caf2bab5bced8249845cbd41b53ced55d79aa3ae22&w=2000')",
    }} 
    >
      {/* Logo */}
      <Image 
        src='/logo.svg' 
        width={50} 
        height={50} 
        alt='Logo' 
        className="absolute top-2 left-2"
      />
    
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold leading-tight">Crack Your Dream Job with AI-Powered Mock Interviews</h1>
        <p className="mt-4 text-lg text-gray-900">
          Experience real-time AI-driven interviews tailored to your skill level and job aspirations.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            className="px-6 py-3 text-lg font-bold bg-pink-600 hover:bg-pink-700"
            onClick={() => router.push("/dashboard")} // Click par redirect
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        {["Realistic AI Interviews", "Instant Feedback", "Personalized Questions"].map((feature, index) => (
          <Card key={index} className="bg-transparent border-pink-50">
            <CardContent className="p-6 text-center ">
              <CheckCircle className="text-pink-600 mx-auto mb-4" size={40} />
              <h3 className="text-xl text-pink-500 font-semibold">{feature}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Footer/>



      {/* Call to Action */}
      {/* <div className="mt-16 text-center">
        <h2 className="text-3xl font-semibold">Stay Updated!</h2>
        <p className="text-gray-400 mt-2">
          Join our waitlist and be the first to access AI-driven interview prep.
        </p>
        <div className="mt-4 flex gap-2">
          <Input type="email" placeholder="Enter your email" className="w-72 bg-gray-800 border-gray-700" />
          <Button className="bg-green-600 hover:bg-green-700 flex items-center">
            Subscribe <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </div> */}
    </div>
  );
}
