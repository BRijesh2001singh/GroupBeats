"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const createRateLimiter = ({ maxRequest, maxTimeWindow, redisClient }) => {
    return (key) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redisClient) {
            console.error("Redis client is not provided.");
            return false;
        }
        try {
            const requestCount = yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.incr(key));
            if (requestCount == 1) {
                yield (redisClient === null || redisClient === void 0 ? void 0 : redisClient.expire(key, maxTimeWindow));
            }
            return requestCount <= maxRequest;
        }
        catch (error) {
            console.error("Redis rate limiter failed", error);
            return false;
        }
    });
};
exports.createRateLimiter = createRateLimiter;
