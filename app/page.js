// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { CheckCircle, ArrowRight } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";  // Router import kiya
// import Footer from "@/components/ui/Footer";

// export default function LandingPage() {
//   const router = useRouter(); // Router instance create kiya

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6 bg-cover bg-center"
//     style={{ 
//       backgroundImage: "url('https://img.freepik.com/free-vector/watercolor-background_87374-57.jpg?t=st=1741549948~exp=1741553548~hmac=69b281a9c1366e521958d0caf2bab5bced8249845cbd41b53ced55d79aa3ae22&w=2000')",
//     }} 
//     >
//       {/* Logo */}
//       <Image 
//         src='/logo.svg' 
//         width={50} 
//         height={50} 
//         alt='Logo' 
//         className="absolute top-2 left-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[50px] lg:h-[50px]"
//       />
    
//       {/* Hero Section */}
//       <div className="text-center max-w-3xl">
//         <h1 className="text-3xl md:text-5xl font-bold leading-tight">Crack Your Dream Job with AI-Powered Mock Interviews</h1>
//         <p className="mt-4 text-md md:text-lg text-gray-900">
//           Experience real-time AI-driven interviews tailored to your skill level and job aspirations.
//         </p>
//         <div className="mt-6 flex justify-center gap-4">
//           <Button
//             className="px-6 py-3 text-lg font-bold bg-pink-600 hover:bg-pink-700"
//             onClick={() => router.push("/dashboard")} // Click par redirect
//           >
//             Get Started
//           </Button>
//           {/* <Button>hellooo</Button> */}
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
//         {["Realistic AI Interviews", "Instant Feedback", "Personalized Questions"].map((feature, index) => (
//           <Card key={index} className="bg-transparent border-pink-50">
//             <CardContent className="p-6 text-center ">
//               <CheckCircle className="text-pink-600 mx-auto mb-4" size={40} />
//               <h3 className="text-xl text-pink-500 font-semibold">{feature}</h3>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <Footer/>
//     </div>
//   );
// }


// ----------------------------------------------------------------


// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { CheckCircle, ArrowRight, Sparkles, Brain, Zap } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import Footer from "@/components/ui/Footer";
// import { motion } from "framer-motion";

// export default function LandingPage() {
//   const router = useRouter();

//   const features = [
//     {
//       title: "Realistic AI Interviews",
//       icon: Brain,
//       description: "Advanced neural networks simulate real-world interview scenarios",
//       color: "from-cyan-500 to-blue-600"
//     },
//     {
//       title: "Instant Feedback",
//       icon: Zap,
//       description: "Millisecond-precise analysis of your performance and potential",
//       color: "from-purple-500 to-pink-600"
//     },
//     {
//       title: "Personalized Learning",
//       icon: Sparkles,
//       description: "Adaptive AI tailors questions to your unique skill profile",
//       color: "from-green-400 to-emerald-600"
//     }
//   ];

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* Colorful Background Particles */}
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-background-shine 
//           bg-[radial-gradient(circle_farthest-side_at_0_0,rgba(255,0,182,0.2),transparent),
//           radial-gradient(circle_farthest-side_at_100%_100%,rgba(0,255,199,0.2),transparent)]
//           opacity-30 blur-3xl"></div>
//       </div>

//       {/* Content Container */}
//       <div className="relative z-10 container mx-auto px-5 py-2 flex flex-col items-center justify-center min-h-screen">
//         {/* Logo with Soft Glow */}
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="absolute top-3 left-1"
//         >
//           <Image 
//             src='/logo.svg' 
//             width={20} 
//             height={20} 
//             alt='Logo' 
//             className="w-6 h-6 md:w-10 md:h-10 filter brightness-150 saturate-150 animate-soft-pulse"
//           />
//         </motion.div>

//         {/* Hero Section with Refined Text */}
//         <motion.div 
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           className="text-center max-w-4xl"
//         >
//           <h1 className="text-3xl md:text-5xl font-extrabold leading-tight 
//             bg-clip-text text-transparent 
//             bg-gradient-to-r from-white via-white/80 to-white/60
//             animate-gradient-text
//             drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
//             Revolutionize Your Interview Preparation with AI
//           </h1>
//           <p className="mt-6 text-md md:text-lg text-gray-300 max-w-3xl mx-auto 
//             drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
//             Cutting-edge AI technology transforms interview preparation, providing hyper-personalized, intelligent coaching tailored to your unique professional journey.
//           </p>
          
//           <div className="mt-8 flex justify-center space-x-4">
//             <Button
//               className="px-8 py-8 text-2xl font-bold 
//               relative 
//               border-2 border-transparent
//               bg-black/30 backdrop-blur-xl
//               group
//               overflow-hidden"
//               onClick={() => router.push("/dashboard")}
//             >
//               {/* Animated Border Effect */}
//               <span className="absolute inset-0 border-2 border-transparent 
//                 group-hover:border-gradient-animated 
//                 transition-all duration-500 ease-in-out"></span>
              
//               <span className="relative z-10 flex items-center 
//                 bg-gradient-to-r from-cyan-300 to-blue-500 
//                 bg-clip-text text-transparent 
//                 group-hover:text-white 
//                 transition-all duration-300">
//                 Start Your AI Journey
//                 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//               </span>
//             </Button>
//           </div>
//         </motion.div>

//         {/* Features Section with Enhanced Cards */}
//         <motion.div 
//           initial={{ opacity: 0, y: 100 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.3 }}
//           className="mt-10 grid md:grid-cols-3 gap-8 max-w-5xl w-full"
//         >
//           {features.map((feature, index) => (
//             <Card 
//               key={index} 
//               className="bg-white/5 
//               backdrop-blur-xl 
//               border-2 border-transparent
//               relative 
//               group
//               overflow-hidden
//               hover:border-gradient-animated
//               transition-all duration-500"
//             >
//               {/* Subtle Gradient Background */}
//               <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} 
//                 opacity-10 group-hover:opacity-20 
//                 transition-opacity duration-300`}></div>
              
//               <CardContent className="p-8 text-center relative z-10">
//                 <feature.icon 
//                   className="text-white/70 mx-auto mb-6 
//                   group-hover:text-white 
//                   transition-colors duration-300 
//                   animate-soft-pulse" 
//                   size={50} 
//                 />
//                 <h3 className="text-xl text-white font-bold mb-4 
//                   group-hover:text-transparent 
//                   group-hover:bg-clip-text 
//                   group-hover:bg-gradient-to-r 
//                   group-hover:from-white group-hover:to-white/60 
//                   transition-all duration-300">
//                   {feature.title}
//                 </h3>
//                 <p className="text-gray-300 text-xs 
//                   group-hover:text-white/80 
//                   transition-colors duration-300">
//                   {feature.description}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </motion.div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Sparkles, Brain, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "Realistic AI Interviews",
      icon: Brain,
      description: "Advanced neural networks simulate real-world interview scenarios",
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "Instant Feedback",
      icon: Zap,
      description: "Millisecond-precise analysis of your performance and potential",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Personalized Learning",
      icon: Sparkles,
      description: "Adaptive AI tailors questions to your unique skill profile",
      color: "from-green-400 to-emerald-600"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white no-scrollbar">
      {/* Content Container */}
      <div className="relative z-10 container mx-auto flex flex-col items-center justify-center min-h-screen">
        {/* Logo with Soft Glow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-3 left-1">
          <Image 
            src='/logo.svg' 
            width={20} 
            height={20} 
            alt='Logo' 
            className="w-6 h-6 md:w-10 md:h-10 filter brightness-150 saturate-150 animate-soft-pulse"
          />
        </motion.div>

        {/* Hero Section with Refined Text */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl pt-2 md:-mt-20"  // Added padding-top and made it responsive
        >
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight 
            bg-clip-text text-transparent 
            bg-gradient-to-r from-white via-white/80 to-white/60
            animate-gradient-text
            drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Revolutionize Your Interview Preparation with AI
          </h1>
          <p className="mt-4 text-md md:text-lg text-gray-300 max-w-3xl mx-auto 
            drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Cutting-edge AI technology transforms interview preparation, providing hyper-personalized, intelligent coaching tailored to your unique professional journey.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              className="px-8 py-8 text-2xl font-bold 
              relative 
              border-2 border-transparent
              bg-black/30 backdrop-blur-xl
              group
              overflow-hidden"
              onClick={() => router.push("/dashboard")}
            >
              
              <span className="relative z-10 flex items-center 
                bg-gradient-to-r from-cyan-300 to-blue-500 
                bg-clip-text text-transparent 
                group-hover:text-white 
                transition-all duration-300 ">
                Start Your AI Interview
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Features Section with Enhanced Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 grid md:grid-cols-3 gap-8 max-w-5xl w-full"
        >
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white/5 
              backdrop-blur-xl 
              border-2 border-transparent
              relative 
              group
              overflow-hidden
              hover:border-gradient-animated
              transition-all duration-500"
            >
              {/* Subtle Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} 
                opacity-10 group-hover:opacity-20 
                transition-opacity duration-300`}></div>
              
              <CardContent className="p-8 text-center relative z-10">
                <feature.icon 
                  className="text-white/70 mx-auto mb-6 
                  group-hover:text-white 
                  transition-colors duration-300 
                  animate-soft-pulse" 
                  size={50} 
                />
                <h3 className="text-xl text-white font-bold mb-4 
                  group-hover:text-transparent 
                  group-hover:bg-clip-text 
                  group-hover:bg-gradient-to-r 
                  group-hover:from-white group-hover:to-white/60 
                  transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-xs 
                  group-hover:text-white/80 
                  transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

