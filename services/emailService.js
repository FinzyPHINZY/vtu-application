import { Resend } from 'resend';
import ApiError from '../utils/error.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'no-reply@info.bolddatapay.com',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new ApiError(
        400,
        false,
        'Failed to send email',
        `Email failed: ${error.message}`
      );
    }

    console.log('Email sent successfully:', data.id);

    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export default sendEmail;
