import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';
import {
  JobNotificationAnnotationState,
  JobNotificationAnnotationUpdate,
} from '../types';
import { AIMessage } from '@langchain/core/messages';

export async function sendNotification(
  state: JobNotificationAnnotationState
): Promise<Partial<JobNotificationAnnotationUpdate>> {
  const { email, bestEmployee } = state;

  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Email options
  const mailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: bestEmployee!.email,
    subject: email.subject,
    text: email.content,
  };

  const result: string = await new Promise((resolve, reject) => {
    const { bestEmployee } = state;
    // Send the email
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          reject('Error sending email: ' + error.message);
        } else {
          resolve(
            `Email sent successfully to the best employee: ${bestEmployee?.fullName} at ${bestEmployee?.email}`
          );
        }
      }
    );
  });

  return {
    emailSent: result,
    messages: [...state.messages, new AIMessage(result)],
  };
}
