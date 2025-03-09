"use client";

import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname , useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function Header() {

    const path=usePathname();
    const router=useRouter(); //ye path de dega, jaise /dashbaord 
    useEffect(()=>{
        console.log(path)
    }, [])

  return (
    <div className='flex p-2 items-center justify-between bg-transparent'>
        <Image src='/logo.svg' width={50} height={50} alt='Logo'></Image>
        <ul className='hidden md:flex gap-10'>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
            ${path==='/dashboard' && 'text-primary font-bold'}
            `} >Dashboard</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
            ${path==='/dashboard/questions' && 'text-primary font-bold'}
            `} >Questions</li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
            ${path==='/dashboard/upgrade' && 'text-primary font-bold'}
            `} >Upgrade</li>
            <li 
                    className={`hover:text-primary hover:font-bold transition-all cursor-pointer 
                    ${path === '/' && 'text-primary font-bold'}`} 
                    onClick={() => router.push('/')} // Home pe click par "/" route
                >
                    Home
                </li>
        </ul>
        <UserButton/>

    </div>
  )
}

export default Header