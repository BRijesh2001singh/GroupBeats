export const isValidYoutubeVideoUrl = (url: string): boolean => {
    const ytRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?!.*\blist=)/;
    return ytRegex.test(url);
  };
