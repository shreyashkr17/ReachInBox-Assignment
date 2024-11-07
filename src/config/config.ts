import { ConnectionOptions } from "bullmq";
import dotenv from 'dotenv';

dotenv.config();

export const REDIS_CONFIG:ConnectionOptions = {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PWD
};