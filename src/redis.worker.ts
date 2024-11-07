import { Queue, Worker } from "bullmq";
import { REDIS_CONFIG } from "./config/config";
import { FETCH_EMAILS_QUEUE, SEND_REPLIES_QUEUE } from "./constants/constants";
import { GmailService } from "./services/gmail.services";
import { generateReplyContent, getLabel } from "./automate/automate";

const fetchEmailsQueue = new Queue(FETCH_EMAILS_QUEUE, {
    connection: REDIS_CONFIG
});

const sendRepliesQueue = new Queue(SEND_REPLIES_QUEUE, {
    connection: REDIS_CONFIG
});

const emailFetchingWorker = new Worker(
    FETCH_EMAILS_QUEUE, 
    async (job) => {
        const { tokens } = job.data;
        const gmailService = new GmailService(tokens);
        
        const emails = await gmailService.listEmails();
        console.log(emails);
        
        for (const email of emails) {
            await sendRepliesQueue.add('process-reply', {
                tokens,
                emailData: email
            });
        }
        
        return `Processed ${emails.length} emails`;
    },
    {
        connection: REDIS_CONFIG
    }
);

const replySendingWorker = new Worker(
    SEND_REPLIES_QUEUE, 
    async (job) => {
        const { tokens, emailData } = job.data;
        const gmailService = new GmailService(tokens);

        const label = await getLabel(emailData.content);

        const content = await generateReplyContent(emailData.content,emailData.subject,label);
        
        const replyContent = `Thank you for your email regarding "${content}".\n\n`
            + "I am currently out of office and will respond to your message as soon as possible.\n\n"
            + "Best regards";

        const subject = `[${label.toUpperCase()}] ${emailData.subject}`;
        
        const replyData: ReplyData = {
            to: emailData.from,
            subject: subject,
            content: replyContent,
            threadId: emailData.threadId,
            label: label
        };

        console.log(replyData);
        
        await gmailService.sendReply(replyData);

        console.log(`Sent reply to ${emailData.from}`);
        
        // return `Sent reply to ${emailData.from}`;
    },
    { 
        connection: REDIS_CONFIG,
    }
);


export async function startEmailProcessing(tokens: any) {
    try {
        await fetchEmailsQueue.add('fetch-emails', { tokens }, {
            repeat: {
                every: 5 * 60 * 1000
            }
        });
        
        console.log('Email processing started');
    } catch (error) {
        console.error('Error starting email processing:', error);
        throw error;
    }
}