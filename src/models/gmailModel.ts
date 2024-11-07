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