'use client'

import { useEffect, useState } from "react";
import { socket } from "../socketConfig/socketConfig";
import { Copy, Check, ThumbsUp, ThumbsDown, Music, LogOut,Plus,Trash } from 'lucide-react';
import { isValidYoutubeVideoUrl } from "../utility/ytLinkValidator";
import Image from 'next/image';
import { fetchVideoDetails } from "../utility/extractVideoDetails";
import { YTmusicPlayer } from "./ytMusicPlayer";
import { useSession } from "next-auth/react";
import { checkIsAdmin } from "../utility/checkAdmin";
import { NonAdminSongPage } from "./nonAdminSongPage";
import {toast,ToastContainer} from "react-toastify";

interface SongData {
    songname: string;
    votes: number;
    songUrl: string;
    thumbnail: string;
}

interface UserVotes {
    [songname: string]: 'up' | 'down' | null;
}

interface AddSongResponse {
    status: "success" | "error";
}

export const SongRoom = ({ roomname }: { roomname: string }) => {
    const [songname, setSongname] = useState<string>("");
    const [songQueue, setSongQueue] = useState<SongData[]>([]);
    const [roomcode, setRoomCode] = useState<string>("");
    const [error, setError] = useState<string>();
    const [copied, setCopied] = useState(false);
    const [userVotes, setUserVotes] = useState<UserVotes>({});
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [userCount,setUserCount]=useState<number>(0);
    const session = useSession();
    const [toastId,setToastId]=useState<string|null>(null);

    const addSongHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSongname(e.target.value);
        setError("");
    };

    const submitVotes = (songname: string, vote: 'up' | 'down') => {
        const currentVote = userVotes[songname];
    
        if (currentVote === vote) {
            socket.emit("votes", { songname, votes: vote === 'up' ? -1 : 1, roomcode });
            setUserVotes((prev) => ({
                ...prev,
                [songname]: null,
            }));
        } else {
            const voteValue = vote === 'up' ? 1 : -1;
    
            socket.emit("votes", { songname, votes: voteValue, roomcode });
            setUserVotes((prev) => ({
                ...prev,
                [songname]: vote,
            }));
        }
    };
    
    useEffect(() => {
        socket.emit('join-room', { roomcode: roomname });
        socket.on('user-joined', (data) => {
            setRoomCode(data);
        });
        socket.on("user-count",(data)=>{
            if(data==0)return;
            if(data==-1){
                setUserCount((prev)=>prev-1);
            }
            else
            setUserCount(data);
        })
        socket.on('get-songs', (songs: SongData[]) => {
            setSongQueue(songs);
        });

        if(session.data?.user?.backendId){
            const checkAdminStatus = async () => {
                const res = await checkIsAdmin(session.data?.user?.backendId, roomname);

                setIsAdmin(res);
            }
            checkAdminStatus();
        }
        return () => {
            socket.off("join-room");
            socket.off("user-joined");
            socket.off("get-songs");
            socket.off("user-count");
        };
    }, [roomname, session.data?.user?.backendId]);
    const submitSong = async () => {
        if (songname?.length === 0) {
            setError("Song name cannot be empty!");
            return;
        }
        try {
            if (!isValidYoutubeVideoUrl(songname)) {
                setError("Please enter a valid YouTube video link");
                return;
            }
            const videoDetails = await fetchVideoDetails(songname);
            if (!videoDetails) {
                setError("Failed to fetch video details");
                return;
            }        
            const {title, thumbnail} = videoDetails;
            socket.emit('add-song', { roomcode, songname, title, thumbnail }, (response: AddSongResponse) => {
                if (response.status === "error") {
                    setError("Song already exists in queue!");
                } else {
                    setSongname("");
                }
            });
        } catch {
            setError("Error fetching details")
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomname || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const removeSong = (songUrl: string) => {
        socket.emit('remove-song', {roomcode, songUrl});
    }
//handle exit room confirmation with TOAST

    const exitRoom = () => {
        if(toast.isActive(toastId as string))return;
          // Check screen width
  if (window.innerWidth <= 768) {
    // Show native confirmation dialog for small screens
    const userConfirmed = window.confirm("Are you sure you want to exit the room?");
    if (userConfirmed) {
      window.location.reload(); // Perform the action
    }
  }
 else{  const id= toast(
        <div>
            <p className="text-white md:text-lg text-sm">Are you sure you want to exit room?</p>
            <div className="flex flex-row justify-evenly text-white mt-1">
                <button onClick={()=>{
                    toast.dismiss();
                    window.location.reload();
                }} className="md:p-1 hover:text-black ">Yes</button>
                <button onClick={()=>toast.dismiss()}  className="md:p-1 hover:text-black">No</button>
            </div>
        </div>,{
            position:'top-center',
            autoClose:false,
            closeOnClick:true,
            draggable:false,
            hideProgressBar:true,
            className:"bg-purple-800 p-3"
        }
    )
    setToastId(id as string)  //avoid toast pile up on button clicks
}
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white p-4 md:p-8">
            <ToastContainer/>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Music className="h-10 w-10 text-purple-300" />
                        <span className="text-3xl font-bold text-purple-300">GroupBeats</span>
                    </div>
                    <div className="flex items-center space-x-4 flex-wrap">
                        <div className="flex items-center bg-purple-800 p-2 rounded-lg overflow-hidden shadow-lg">
                            <h3 className="font-bold mr-2 text-sm">Share Room Code:</h3>
                            <span className="px-3 py-2 bg-purple-700 rounded text-sm ">{roomname}</span>
                            <button
                                onClick={copyRoomCode}
                                className="bg-purple-600 hover:bg-purple-500 px-3 py-2 ml-2 rounded transition-colors text-white"
                                title={copied ? "Copied" : "Copy room code"}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <button
                            onClick={exitRoom}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 md:px-4 md:py-2 px-1 py-1 rounded-lg transition-colors md:my-0 my-2"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="md:font-bold font-medium md:my-0 my-2">Exit Room</span>
                        </button>
                        <span>Listeners:{userCount==0?0:userCount-1}</span>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/2">
                        <div className="mb-6">
                            <div className="flex">
                                <input
                                    value={songname}
                                    className="text-black px-4 py-3 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    onChange={addSongHandler}
                                    placeholder="Enter YouTube video link"
                                    onKeyDown={(e) => {
                                        if(e.key === "Enter") submitSong();
                                    }}
                                />
                                <button
                                    onClick={submitSong}
                                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-r-lg font-bold transition-colors"
                                >
                                    <Plus/>
                                </button>
                            </div>
                            {error && <span className="text-red-400 block mt-2">{error}</span>}
                        </div>
                        <div className="bg-purple-800 bg-opacity-50 rounded-lg p-6 h-[calc(100vh-300px)] overflow-y-auto shadow-xl overflow-x-hidden">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 text-purple-300">Song Queue</h2>
                            <div className="space-y-4">
                                {songQueue.map((item, ind) => (
                                    <div key={ind} className="flex items-center justify-between flex-wrap bg-purple-700 bg-opacity-60 p-4 rounded-lg hover:bg-purple-600 transition-colors overflow-hidden  ">
                                        <div className="flex items-center md:space-x-4 flex-1">
                                            <Image 
                                                src={item.thumbnail}
                                                alt="video thumbnail"
                                                width={80}
                                                height={60}
                                                className="rounded-lg"
                                            />
                                            <span className="text-white truncate flex-1 text-sm md:text-md">{item.songname.substring(0,35)}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 space-y-2 md:space-y-0">
                                            <span className="font-bold">{item.votes}</span>
                                            {userVotes[item.songUrl] === 'up' ? (
                                                <button
                                                    onClick={() => submitVotes(item.songUrl, 'down')}
                                                    className="md:p-2 p-1 rounded bg-red-500 hover:bg-red-600 transition-colors"
                                                >
                                                    <ThumbsDown className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => submitVotes(item.songUrl, 'up')}
                                                    className="md:p-2 p-1 rounded bg-green-500 hover:bg-green-600 transition-colors"
                                                >
                                                    <ThumbsUp className="w-5 h-5" />
                                                </button>
                                            )}
                                            {isAdmin&&<button 
                                                onClick={() => removeSong(item.songUrl)}
                                                className="md:p-2 p-1 rounded bg-red-600 hover:bg-red-700 transition-colors"
                                            >
                                                <span className="font-bold"><Trash/></span>
                                            </button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <div className="bg-purple-800 h-full bg-opacity-50 rounded-lg p-6 h-[calc(100vh-300px)] shadow-xl">
                            {isAdmin ? (
                                <YTmusicPlayer songList={songQueue} roomcode={roomcode} />
                            ) : (
                                <NonAdminSongPage />
                            )}
                        </div>
                    </div>
                </div>
                {session.data?.user && (
                    <h1 className="text-xl font-medium mt-6 text-purple-300">
                        Room Owner: {session.data?.user?.name}
                    </h1>
                )}
            </div>
        </div>
    );
};

