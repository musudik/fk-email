//import mailchimpTx from '@mailchimp/mailchimp_transactional'
const dotenv = require('dotenv');
const path = require('path');

// Environment setup
const environment = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${environment}`);
dotenv.config({ path: envPath });


var mailchimp = require("@mailchimp/mailchimp_transactional")(process.env.MAILCHIMP_API_KEY);


//Configure Mailchimp
// const mailchimp = Mailchimp.setConfig({
//   apiKey: process.env.MAILCHIMP_API_KEY,
//   server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., 'us1'
// });

// Initialize the Mailchimp client
// const client = mailchimp(process.env.MAILCHIMP_API_KEY);

/**
 * Sends email via Mailchimp Transactional API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} fromName - Name of the sender
 * @returns {Promise<Object>} - Response from Mailchimp API
 * @throws {Error} - If email sending fails
 */
async function sendMailchimpEmail(to, fromName, subject, htmlContent) {
  try {
    const message = {
      from_email: process.env.EMAIL_FROM,
      from_name: fromName,
      subject: subject,
      html: htmlContent,
      to: [{ email: to }],
    };
    
    // Test the API connection first
    // const pingResult = await mailchimp.messages.ping();
    // console.log('Ping result:', pingResult);
    const response = await mailchimp.messages.send({
      message
    });

    //const response = await mailchimp.messages.send({ message });
    console.log('Email sent successfully:', response);

    // const response = await mailchimp.messages.send({ message });
    // console.log('Email sent successfully:', response);
    
    return {
      success: true,
      messageId: response[0]?.id,
      status: response[0]?.status
    };
  } catch (error) {
    console.error('Mailchimp Transactional API Error:', error);
    throw error;
  }
}

// Test the API key on startup
// mailchimp.messages.ping()
//   .then(() => console.log('Mailchimp Transactional API connected successfully'))
//   .catch(error => console.error('Failed to connect to Mailchimp Transactional API:', error));

module.exports = {
  sendMailchimpEmail
};