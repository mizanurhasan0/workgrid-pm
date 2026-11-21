import nodemailer from 'nodemailer';

/**
 * Builds the SMTP transport from settings.smtp.
 */
export default function NewTransport(settings) {
  return nodemailer.createTransport({
    host: settings.smtp.host,
    port: settings.smtp.port,
    secure: settings.smtp.port === 465,
    auth: settings.smtp.user ? {
      user: settings.smtp.user,
      pass: settings.smtp.password,
    } : undefined,
  });
}
