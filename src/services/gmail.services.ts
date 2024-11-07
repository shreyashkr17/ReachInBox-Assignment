import { Queue, Worker } from 'bullmq';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface EmailData {
    messageId: string;
    from: string;
    subject: string;
    receivedDate: string;
    content: string;
    threadId: string;
}

interface ReplyData {
    to: string;
    subject: string;
    content: string;
    threadId: string;
    label: string;
}

export class GmailService {
    private oauth2Client: OAuth2Client;
    private gmail: any;

    constructor(tokens: any) {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        
        this.oauth2Client.setCredentials(tokens);
        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    async listEmails(maxResults = 1): Promise<EmailData[]> {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults,
                q: 'in:inbox is:unread'
            });

            const emails: EmailData[] = [];
            
            for (const message of response.data.messages) {
                const email = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full'
                });

                const headers = email.data.payload.headers;
                const from = headers.find((h: any) => h.name === 'From').value;
                const subject = headers.find((h: any) => h.name === 'Subject').value;
                const date = headers.find((h: any) => h.name === 'Date').value;
                
                let content = '';
                if (email.data.payload.parts && email.data.payload.parts[0].body.data) {
                    content = Buffer.from(email.data.payload.parts[0].body.data, 'base64').toString();
                }

                emails.push({
                    messageId: email.data.id,
                    threadId: email.data.threadId,
                    from,
                    subject,
                    receivedDate: date,
                    content
                });
            }

            return emails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    async sendReply(replyData: ReplyData): Promise<void> {
        try {
            const message = [
                'Content-Type: text/plain; charset="UTF-8"\n',
                'MIME-Version: 1.0\n',
                'Content-Transfer-Encoding: 7bit\n',
                `To: ${replyData.to}\n`,
                `Subject: Re: ${replyData.subject}\n\n`,
                replyData.content
            ].join('');

            const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId: replyData.threadId
                }
            });
        } catch (error) {
            console.error('Error sending reply:', error);
            throw error;
        }
    }
}