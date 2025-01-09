'use client'
import { useState } from 'react'
import { Users, Headphones } from 'lucide-react'
import { socket } from "../socketConfig/socketConfig"
import { SongRoom } from '../components/songRoom'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import {v4 as uuid}from "uuid"
import { Navbar } from './navbar'
export default function LandingPage() {
  const [roomname, setRoomname] = useState<string>('')
  const [status, setStatus] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
  const session=useSession();
  const apiurl=process.env.NEXT_PUBLIC_API_URL;

  const createRoom = async() => {
    if (isUpdatingRoom) return; // Prevent duplicate requests
    setIsUpdatingRoom(true);
    if(session.data?.user&&session.data.user.name){

      const newRoomName=uuid();
    try {
        const response=await axios.post(`${apiurl}/api/updateroom`,{
          id:session.data?.user.backendId,
          roomId:newRoomName
        })
        if(response.status===200){
        setRoomname(newRoomName);
        setStatus(true);
        }
        else {
          alert("Error setting new room Id!")
        }
  
    } catch {
      alert("Unable to connect to server")
    }
    }
    else{
      alert("Please Login to create new room.");
    }
    setIsUpdatingRoom(false);
  }

  const checkRoomStatus = () => {

    socket.emit("check-room", { roomcode: roomname })
    socket.once("room-status", (data) => {
      if (data.exists) {
        setStatus(true)
      } else {
        setError("Room does not exist!")
      }
    })
  }

  if (status) {
    return <SongRoom roomname={roomname} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <header className="container mx-auto py-6 px-4">
        <Navbar/>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 animate-fade-in-down">
          Listen Together, Anywhere
        </h1>
        <p className="text-xl mb-12 animate-fade-in-up">
          Create or join a room and enjoy synchronized <b>ADS FREE</b> music with friends and family.
        </p>
        <div className="flex justify-center space-x-4">
        <button
  onClick={createRoom}
  disabled={isUpdatingRoom}
  className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center ${
    isUpdatingRoom ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
            <Users className="mr-2 h-5 w-5" />  {isUpdatingRoom ? (
        <>
          <div
            className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"
            aria-hidden="true"
          ></div>
          Creating new room
        </>
      ) : (
        "Create Room"
      )}
          </button>
          <button 
            onClick={() => setIsJoinDialogOpen(true)}
            className="bg-transparent hover:bg-white hover:text-purple-900 border border-white text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center animate-bounce-in"
          >
            <Headphones className="mr-2 h-5 w-5" /> Join Room
          </button>
        </div>
      </main>

      {isJoinDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-purple-900 text-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
            <input 
              type="text"
              placeholder="Enter room code" 
              className="w-full bg-purple-800 text-white border border-purple-700 rounded-lg px-4 py-2 mb-4 placeholder-purple-400"
              onChange={(e) => setRoomname(e.target.value)}
              value={roomname}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setIsJoinDialogOpen(false)
                  setError('')
                }}
                className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={checkRoomStatus}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="absolute bottom-0 w-full py-4 text-center text-purple-300 ">
        <p>&copy; 2024 GroupBeats. All rights reserved.</p>
      </footer>
    </div>
  )
}

