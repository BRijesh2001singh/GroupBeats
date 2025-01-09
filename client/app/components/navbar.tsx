import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link';
import { Music } from "lucide-react"
import { useState } from 'react';

export const Navbar = () => {
  const session = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 relative">
      <div className="flex items-center space-x-2">
        <Music className="h-8 w-8" />
        <span className="text-2xl font-bold">GroupBeats</span>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/" className="hover:text-purple-300 transition-colors">Home</Link></li>
            <li><Link href="/features" className="hover:text-purple-300 transition-colors">Features</Link></li>
            <li><a href="/contact" className="hover:text-purple-300 transition-colors">Contact</a></li>
            {session.data?.user ? (
              <button onClick={() => signOut()} className="hover:text-purple-300 transition-colors">SignOut</button>
            ) : (
              <button onClick={() => signIn()} className="hover:text-purple-300 transition-colors">SignIn</button>
            )}
          </ul>
        </nav>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-purple-300 rounded-lg bg-opacity-90 shadow-lg p-4 z-50">
          <nav>
            <ul className="space-y-4">
              <li><Link href="/" className="text-black block text-center hover:text-purple-300 transition-colors">Home</Link></li>
              <li><Link href="/features" className="text-black block text-center hover:text-purple-300 transition-colors">Features</Link></li>
              <li><a href="/contact" className=" text-black block text-center hover:text-purple-300 transition-colors">Contact</a></li>
              {session.data?.user ? (
                <button onClick={() => signOut()} className=" text-black block text-center w-full hover:text-purple-300 transition-colors">SignOut</button>
              ) : (
                <button onClick={() => signIn()} className="text-black block w-full text-center t hover:text-purple-300 transition-colors">SignIn</button>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
