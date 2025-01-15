'use client'
import YouTube, { YouTubeProps,YouTubePlayer } from 'react-youtube';
import { useState,useRef} from 'react';
import { extractVideoId } from '../utility/ytVideoIdExtractor';
import { socket } from "../socketConfig/socketConfig";
import Image from 'next/image';
import {Pause,Play,Video,AudioLinesIcon}from "lucide-react"
interface SongData {
  songname: string;
  votes: number;
  songUrl: string;
  thumbnail: string;
}

interface YTmusicPlayerProps {
  songList: SongData[];
  roomcode:string;
}

export const YTmusicPlayer = ({ songList,roomcode }: YTmusicPlayerProps) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [currSongName,setCurrSongName]=useState<string>("");
  const [currSongThumbnail,setCurrSongThumbnail]=useState<string>("");
  const [musicPlayerStatus,setMusicPlayerStatus]=useState<boolean>(true);
  const [videoDisplay,setVideoDisplay]=useState<boolean>(false);
    const playerRef = useRef<YouTubePlayer|null>(null);
  // This effect updates when the songList or currentSongIndex changes
    const startPlayingQueue=()=>{
      if (songList.length === 0) {
        setError("Song Queue empty!");
        setVideoId(null);
      } else {
        setError('');
        playNext();
      }
    }
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.setPlaybackQuality("small");
    event.target.playVideo();
    playerRef.current=event.target;
  };
//video toggle
const videoToggle=()=>{
   setVideoDisplay(!videoDisplay);
}
const opts:YouTubeProps['opts']={  height: 'auto',
  width: 'auto',
  playerVars: {
    autoplay: 1,
    cc_load_policy: 0,
    rel: 0,}
  };
  // Play next song
  const playNext = () => {
    if (songList.length > 0) {
      const song=songList[0].songUrl;
      const newVideoId=extractVideoId(song);
      setVideoId(newVideoId);
      setCurrSongName(songList[0].songname);
      setCurrSongThumbnail(songList[0].thumbnail);
      const currentSong=songList[0].songname;
      const currentSongThumbanail=songList[0].thumbnail;
      socket.emit("add-current-song",{roomcode,song:{currentSong,currentSongThumbanail}});
      removeSong(song);
    }
else{
  setVideoId(null);
  setError("Queue is empty!")
}
  };
  //const on video end
const onPlayerEnd:YouTubeProps['onEnd']=()=>{
  playNext();
}
   //pause video
   const pauseVideo=()=>{
    if(playerRef.current){
      playerRef.current.pauseVideo();
      setMusicPlayerStatus(false);
    }
   }
  //
  const resumeVideo=()=>{
    if(playerRef.current){
      playerRef.current.playVideo();
      setMusicPlayerStatus(true);
    }
  }

      // song removal
    const removeSong=(songUrl:string) =>{
       socket.emit('remove-song',{roomcode,songUrl});
    }

  return (
    <div>
      <div className="w-full h-1/2">
      <div className='flex flex-row items-center'> 
      <button className='bg-purple-600 hover:bg-purple-700  text-sm md:text-lg px-4 mr-2 py-2 rounded-lg font-medium' onClick={startPlayingQueue}>Start Queue
      </button>
      <button  className='bg-purple-600 hover:bg-purple-700 text-sm md:text-lg px-4 py-2 rounded-lg font-medium mr-2' onClick={playNext}>Play Next
      </button>
      {
        musicPlayerStatus?(<button  className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium mr-2 ' onClick={pauseVideo}><Pause/>
      </button>):
        (<button  className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium mr-2' onClick={resumeVideo}><Play/>
      </button>)
      }
      {
       videoDisplay?(<button  className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium ' onClick={videoToggle}><AudioLinesIcon/>
      </button>):
        (<button  className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium ' onClick={videoToggle}><Video/>
      </button>)
      }
      
      </div>
      {videoId&&<h3 className="text-100 font-bold">Now Playing :{currSongName.substring(0,55)}.....</h3>}
        {videoId ? (
          <div>
                      <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} onEnd={onPlayerEnd} className={videoDisplay?"visible":"hidden"}/>
                       <Image
                                src={currSongThumbnail}
                                alt="Video Thumbnail"
                                width={450} // Width of the image (in pixels)
                                height={300} // Height of the image (in pixels)
                                quality={100} // Optional: Image quality (default is 75)
                                className={videoDisplay?"hidden":"visible rounded-lg ml-5 mt-1"}
                              />
          </div>
        ) : (
          <span className='text-red-500 my-2 font-[600]'>{error}</span>
        )}
      </div>

    </div>
  );
};
