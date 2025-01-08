import Redis from "ioredis";

type RateLimiterOptions={
    maxRequest:number;
    maxTimeWindow:number;
    redisClient?:Redis;
};
export const createRateLimiter=({maxRequest,maxTimeWindow,redisClient}:RateLimiterOptions)=>{
    return async (key:string):Promise<boolean>=>{
        if (!redisClient) {
            console.error("Redis client is not provided.");
            return false;
        }
     try {
          const requestCount=await redisClient?.incr(key);
          if(requestCount==1){
           await redisClient?.expire(key,maxTimeWindow);
          }
          return requestCount<=maxRequest;
     } catch (error) {
        console.error("Redis rate limiter failed",error);
        return false;
     }
    }
}