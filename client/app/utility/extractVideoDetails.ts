import { extractVideoId } from "./ytVideoIdExtractor";

export const fetchVideoDetails = async (url:string) => {
    const videoId=extractVideoId(url);
    const apiKey =process.env.NEXT_PUBLIC_YT_API_KEY; // Replace with your API Key
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items.length > 0) {
            const video = data.items[0].snippet;
            return {
                title: video.title,
                thumbnail: video.thumbnails.high.url
            };
        } else {
           console.log("Video not found");
        }
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
};

