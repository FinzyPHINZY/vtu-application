import {
  generateVerificationCompletedEmail,
  generateVerificationFailedEmail,
  generateVerificationStartedEmail,
} from '../utils/email.js';
import sendEmail from './emailService.js';

export const sendVerificationStarted = async (user, type, number) => {
  try {
    const html = generateVerificationStartedEmail(user.firstName, type, number);

    await sendEmail(user.email, 'Verification started', html);
  } catch (error) {
    console.error('Failed to send receipt:', error);
    // Not throwing this error as this is not critical
  }
};

export const sendVerificationSuccess = async (
  user,
  accountName,
  accountNumber
) => {
  try {
    const html = generateVerificationCompletedEmail(
      user.firstName,
      accountName,
      accountNumber
    );

    await sendEmail(user.email, 'Verification successful', html);
  } catch (error) {
    console.error('Failed to send verification success email:', error);
  }
};

export const sendVerificationFailed = async (user) => {
  try {
    const html = generateVerificationFailedEmail(user.firstName);

    await sendEmail(user.email, 'Verification failed', html);
  } catch (error) {
    console.error('Failed to send verification failed email:', error);
  }
};
