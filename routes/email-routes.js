const express = require('express');
const { Resend } = require('resend');
const Mailchimp = require('@mailchimp/mailchimp_marketing');
const router = express.Router();
const path = require('path');
const ejs = require('ejs');

const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Mailchimp
Mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Configure EJS templates
const templatesDir = path.join(__dirname, '../templates/emails');

const SOCIAL_ICONS = {
  facebook: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZElEQVR4nO2UO0sDQRSFP42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZGBZdnY2+yQB8cJwy9w55947M7uwwn+CBmwBHaALvAKPQBsoi7dKzgPgDfgEboEGUAIOgbEEjIEHYB8oAsfAC/ChWlFy6sA78KyauVjHwANwpvxPJ+dYgDPVvwQOgG3gWv7EzLmQwTFwAGwCl/KdW3LqMrgS4Fy+M0vOlQxuBLiQ78aSU5PBnQAX8h1bckoymArQkO/IklOQwVSApnxrP8mpymAiQEu+VUvOhgwmArTlW7Lk5GUwEeBevkVLTlYGYwG68i1YcjIy+BKgJ9+8JScF9GUwEKAv35wlJwkMZNAXYCBfypKTAAYy6AkwlC9hyYkDQxl0BRjJF7PkhP8HhzLoCDCWr9UWHPkXLDkr/Dl8A7T6bKPvNgzHAAAAAElFTkSuQmCC`,
  twitter: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWklEQVR4nO2UPUsDQRCGH42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZCAsu3u7l/MSEAcGbmfmfXZ25xb+8dfRAA6BLtADXoEnoA2UxVsh5wB4Bz6BW6ABFIFD4E0CxsAjsAcUgRPgBfhQrSg5deAN6KtmLtYJ8AicK//LyTkR4Ez1r4B9YAe4kT8xcy5kcAwcANvAtXznlpy6DK4FuJDv3JJzLYM7AS7lO7fkVGUwFaAp35klpySDqQAt+Y4sOXkZTAVoy7duyVmXwUSAjnxrlpysDMYC3Mu3YslJy2AkQFe+RUtOChjIYChAX745S04SGMpgIMBAvpQlJwEMZdATYChf3JITAwYy6AowlC9myYkCfRl0BBjJt2LJifwPDmTQFmAs36otOPQvWHL+8OX4AhXRbKOTqkNkAAAAAElFTkSuQmCC`,
  instagram: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABjElEQVR4nO2UPUsDQRDHf42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZOAiu7d7l7sEQQcGbmfm/e3s7C78Y9FRA46BHtAHXoEnoANUxFsl5xB4Az6AW6AJFIBD4FUCJsADsA8UgRPgGXhXrSg5DeAV6KtmLtYJ8ACcKf/TyTkR4Ez1r4ADYBO4kT8xcy5kcAwcAFvAtXznlpy6DK4FuJDv3JJzLYM7AS7lO7fkVGUwFaAl35klpySDqQBt+Y4sOXkZTAXoyLduyVmTwUSArnxrlpyMDMYC3Mu3YslJyWAkQE++RUtOEhjKYCRAX745S04CGMpgIMBAvpQlJw4MZdATYChfzJITBQYy6AowlC9qyYn8Dw5k0BZgLN+KLTj0L1hy4sBYBh0BxvKt2oLD/4IlJwaMZNAVYCTfsi049C9YcqLACAZtAU22rdiCQ/+CJScCjGTQEWAs36otOPQvWHL+8OX4AggXeSM0Y1O0AAAAAElFTkSuQmCC`,
  linkedin: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZ0lEQVR4nO2UPUsDQRSFP42FIFgIYmOhP8DCwkLBQgQrC0Hs/A2WNhYWFhYWFhYWFhYWFhYWFhYiKIqFIBaCWAiCYCEIFsJ6ZGBZdnY2+yQB8cJwy9w55947M7uwwn+CBmwBHaALvAKPQBsoi7dKzgPgDfgEboEGUAIOgbEEjIEHYB8oAsfAC/ChWlFy6sA78KyauVjHwANwppPJ+dYgDPVvwQOgG3gWv7EzLmQwTFwAGwCl/KdW3LqMrgS4Fy+M0vOlQxuBLiQ78ySU5PBnQAX8h1bckoymArQkO/IklOQwVSApnxrP8mpymAiQEu+VUvOhgwmArTlW7Lk5GUwEeBevkVLTlYGYwG68i1YcjIy+BKgJ9+8JScF9GUwEKAv35wlJwkMZNAXYCBfypKTAAYy6AkwlC9hyYkDQxl0BRjJF7PkhP8HhzLoCDCWr9UWHPkXLDkr/Dl8A7T6bKPvNgzHAAAAAElFTkSuQmCC`
};

async function sendMail(to, subject, htmlContent) {
  try {
    const response = await Mailchimp.messages.send({
      message: {
        from_email: process.env.EMAIL_FROM,
        subject: subject,
        html: htmlContent,
        to: [{ email: to }]
      }
    });
    return response;
  } catch (error) {
    console.error('Mailchimp API Error:', error);
    throw error;
  }
}

// Quiz Confirmation Email
router.post('/api/email/quiz-confirmation', async (req, res) => {
  try {
    const { to, name, quizTitle, quizDate, fees, iban, quizLink, paymentMethod, paymentStatus } = req.body;

    const html = await ejs.renderFile(
      path.join(templatesDir, 'iquiz_confirmation.ejs'),
      {
        logoUrl: process.env.EMAIL_LOGO_URL,
        name,
        quizTitle,
        quizDate,
        fees,
        iban,
        quizLink,
        paymentMethod,
        paymentStatus,
        SOCIAL_ICONS
      }
    );

    try {
      // Try sending with Resend first
      const resendData = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: 'Quiz Registration Confirmation',
        html: html
      });

      // If Resend fails, try Mailchimp as backup
      if (!resendData) {
        const mailchimpData = await sendMail(
          to,
          'Quiz Registration Confirmation',
          html
        );
        console.log('Email sent via Mailchimp:', mailchimpData);
      } else {
        console.log('Email sent via Resend:', resendData);
      }

      res.status(200).json({ 
        success: true,
        message: 'Email sent successfully'
      });
    } catch (emailError) {
      console.error('Email Service Error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Quiz Confirmation Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send quiz confirmation email',
      error: error.message
    });
  }
});

// Business Email
router.post('/api/email/business', async (req, res) => {
  try {
    const { to, subject, templateData } = req.body;
    
    const html = await ejs.renderFile(
      path.join(templatesDir, 'business_email.ejs'),
      templateData
    );

    try {
      // Try sending with Resend first
      const resendData = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: subject,
        html: html
      });

      // If Resend fails, try Mailchimp as backup
      if (!resendData) {
        const mailchimpData = await sendMail(to, subject, html);
        console.log('Email sent via Mailchimp:', mailchimpData);
      } else {
        console.log('Email sent via Resend:', resendData);
      }

      res.status(200).json({ 
        success: true,
        message: 'Business email sent successfully'
      });
    } catch (emailError) {
      console.error('Email Service Error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send business email',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Business Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send business email',
      error: error.message
    });
  }
});

// General Autoreply Email
router.post('/api/email/autoreply', async (req, res) => {
  try {
    const { to, subject, templateData } = req.body;
    
    const html = await ejs.renderFile(
      path.join(templatesDir, 'general_autoreply.ejs'),
      templateData
    );

    try {
      // Try sending with Resend first
      const resendData = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: subject,
        html: html
      });

      // If Resend fails, try Mailchimp as backup
      if (!resendData) {
        const mailchimpData = await sendMail(to, subject, html);
        console.log('Email sent via Mailchimp:', mailchimpData);
      } else {
        console.log('Email sent via Resend:', resendData);
      }

      res.status(200).json({ 
        success: true,
        message: 'Autoreply email sent successfully'
      });
    } catch (emailError) {
      console.error('Email Service Error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send autoreply email',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Autoreply Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send autoreply email',
      error: error.message
    });
  }
});

module.exports = router;
