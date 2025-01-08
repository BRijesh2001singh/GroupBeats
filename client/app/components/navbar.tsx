
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link';
import {Music} from "lucide-react"
export const Navbar=()=>{
    const session=useSession();
    return(
    <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <Music className="h-8 w-8" />
      <span className="text-2xl font-bold">GroupBeats</span>
    </div>
    <nav>
      <ul className="flex space-x-4">
        <li><Link href="/" className="hover:text-purple-300 transition-colors">Home</Link></li>
        <li><Link href="/features" className="hover:text-purple-300 transition-colors">Features</Link></li>
        <li><a href="/contact" className="hover:text-purple-300 transition-colors">Contact</a></li>
        {session.data?.user?(<button onClick={()=>signOut()}>SignOut</button>):(<button onClick={()=>signIn()}>SignIn</button>)}
      </ul>
    </nav>
  </div>
    )
}