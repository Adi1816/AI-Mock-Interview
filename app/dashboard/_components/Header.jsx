// "use client";

// import Image from 'next/image'
// import { UserButton } from '@clerk/nextjs'
// import { usePathname , useRouter } from 'next/navigation'
// import React, { useEffect } from 'react'

// function Header() {

//     const path=usePathname();
//     const router=useRouter(); //ye path de dega, jaise /dashbaord 
//     useEffect(()=>{
//         console.log(path)
//     }, [])

//   return (
//     <div className='flex p-2 items-center justify-between bg-transparent z-9999'>
//         <Image src='/logo.svg' width={50} height={50} alt='Logo'></Image>
//         <ul className='hidden md:flex gap-10'>
//         <li 
//                     className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
//                     ${path === '/' && 'text-primary font-bold'}`} 
//                     onClick={() => router.push('/dashboard')} // Home pe click par "/" route
//                 >
//                     Dashboard
//                 </li>
//             <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
//             ${path==='/dashboard/questions' && 'text-primary font-bold'}
//             `} >Questions</li>
//             <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
//             ${path==='/dashboard/upgrade' && 'text-primary font-bold'}
//             `} >Upgrade</li>
//             <li 
//                     className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
//                     ${path === '/' && 'text-primary font-bold'}`} 
//                     onClick={() => router.push('/')} // Home pe click par "/" route
//                 >
//                     Home
//                 </li>
//         </ul>
//         <UserButton/>

//     </div>
//   )
// }

// export default Header

// ----------------------------------------------------------------

"use client";

import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { 
  LayoutDashboard, 
  HelpCircle, 
  Rocket, 
  Home 
} from 'lucide-react'

function Header() {
    const path = usePathname();
    const router = useRouter();

    const navItems = [
        { 
            name: 'Dashboard', 
            icon: LayoutDashboard, 
            path: '/dashboard',
            active: path === '/dashboard'
        },
        { 
            name: 'Questions', 
            icon: HelpCircle, 
            path: '/dashboard/questions',
            active: path === '/dashboard/questions'
        },
        { 
            name: 'Upgrade', 
            icon: Rocket, 
            path: '/dashboard/upgrade',
            active: path === '/dashboard/upgrade'
        },
        { 
            name: 'Home', 
            icon: Home, 
            path: '/',
            active: path === '/'
        }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-blue-950/30 to-black/50 backdrop-blur-xl opacity-90"></div>
            
            {/* Border Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 
                bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

            <div className='relative z-50 flex p-4 items-center justify-between container mx-auto'>
                {/* Logo with Hover Effect */}
                <div 
                    className="flex items-center space-x-3 cursor-pointer group"
                    onClick={() => router.push('/')}
                >
                    <Image 
                        src='/logo.svg' 
                        width={50} 
                        height={50} 
                        alt='Logo' 
                        className="transition-transform group-hover:rotate-6 group-hover:scale-110"
                    />
                </div>

                {/* Navigation */}
                <nav className='hidden md:flex space-x-6'>
                    {navItems.map((item) => (
                        <div 
                            key={item.name}
                            className={`flex items-center space-x-2 
                                cursor-pointer 
                                group 
                                transition-all 
                                duration-300 
                                ${item.active 
                                    ? 'text-white' 
                                    : 'text-gray-200 hover:text-white'}`}
                            onClick={() => router.push(item.path)}
                        >
                            <item.icon 
                                className={`
                                    ${item.active 
                                        ? 'text-blue-500' 
                                        : 'text-gray-300 group-hover:text-blue-500'}
                                    transition-colors duration-300
                                `} 
                                size={20} 
                            />
                            <span className={`
                                text-sm font-light
                                ${item.active 
                                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500' 
                                    : ''}
                                group-hover:bg-clip-text group-hover:text-transparent 
                                group-hover:bg-gradient-to-r 
                                group-hover:from-cyan-300 
                                group-hover:to-blue-500
                                transition-all duration-300
                            `}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="flex items-center space-x-4">
                    <div className="relative z-[99999]">
                    <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                        elements: {
                            userButtonAvatarBox: 'w-12 h-12 hover:ring-blue-500 transition-all',
                            userButtonPopoverCard: 'z-[99999] bg-slate-900 border-white/10 shadow-2xl',
                        }
                        }}
                    />
                    </div>

                </div>
            </div>
        </header>
    )
}

export default Header