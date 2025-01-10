'use client';
import { useEffect, useState } from 'react';
import { socket } from "../socketConfig/socketConfig";
import Image from 'next/image';

interface currSongData {
  currentSong?: string;
  currentSongThumbanail?: string;
}

export const NonAdminSongPage = () => {
  const [currentSong, setCurrentSong] = useState<currSongData | null>(null);

  useEffect(() => {
    // Listen for the "get-current-song" event
    socket.on("get-current-song", (song) => {
      if (song.currentlyPlaying) {
        setCurrentSong(song.currentlyPlaying);
      } else {
        setCurrentSong(null);
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off("get-current-song");
    };
  }, []);

  return (
    <div>
      {currentSong?.currentSongThumbanail ? (
        <div className='flex flex-col justify-center items-center'>
          <h3 className="text-100 font-bold">
            Now Playing: {currentSong.currentSong?.substring(0, 55) || "Unknown Song"}
          </h3>
          {currentSong.currentSongThumbanail ? (
            <Image
              src={currentSong.currentSongThumbanail}
              alt="Video Thumbnail"
              width={450} // Width of the image (in pixels)
              height={300} // Height of the image (in pixels)
              quality={100} // Optional: Image quality (default is 75)
              className="rounded-lg ml-5 mt-1"
            />
          ) : (
            <p className="text-white-500">Thumbnail not available.</p>
          )}
        </div>
      ) : (
        <h1 className="text-white-600">No song currently playing.</h1>
      )}
    </div>
  );
};
