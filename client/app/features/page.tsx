'use client'

import { Music, Users, ThumbsUp, List, Speaker, PlusCircle } from 'lucide-react'
import { Navbar } from '../components/navbar';
export default function FeaturesPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white  ">
      <header className="container mx-auto py-6 px-4">
        <Navbar/>
      </header>

      <main className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-12 text-center animate-fade-in-down">
          Features of GroupBeats
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Room Creation</h2>
            </div>
            <p>Admins can create private rooms and invite others to join, ensuring a personalized music experience.</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Speaker className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Single Source Playback</h2>
            </div>
            <p>Admin acts as the single source of sound, perfect for parties or gatherings with a shared speaker system.</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <List className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Collaborative Queue</h2>
            </div>
            <p>Users can view and interact with the music queue, adding their favorite songs to the playlist.</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <ThumbsUp className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Song Voting</h2>
            </div>
            <p>Like songs in the queue to move them up, ensuring the most popular tracks get played sooner.</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <PlusCircle className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Add Your Own Songs</h2>
            </div>
            <p>Users can contribute to the playlist by adding their own song choices to the queue.</p>
          </div>

          <div className="bg-purple-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Music className="h-8 w-8 mr-2 text-purple-300" />
              <h2 className="text-2xl font-semibold">Synchronized Listening</h2>
            </div>
            <p>Enjoy music together in real-time, no matter where you are, creating a shared listening experience.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

