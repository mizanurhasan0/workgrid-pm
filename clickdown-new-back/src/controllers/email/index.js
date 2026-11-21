import NewTransport from './transport';

/**
 * Creates the mail sender. Returns an async function that resolves to true on success
 * and false on failure (errors are logged, never thrown into request handlers).
 * @param {Object} settings Runtime settings (smtp, emailName, emailFrom).
 */
export default function NewMailer(settings) {
  const transport = new NewTransport(settings);
  console.log('=> Mail service started!');

  /**
   * Sends an email.
   * @param {{receiver: string, subject: string, body: string, type: 'text'|'html'}} message
   * @returns {Promise<boolean>}
   */
  return async function sendMail({ receiver, subject, body, type }) {
    const mailObject = {
      to: receiver,
      from: {
        name: settings.emailName,
        address: settings.emailFrom,
      },
      subject,
    };
    if (type === 'text') mailObject.text = body;
    else if (type === 'html') mailObject.html = body;

    try {
      await transport.sendMail(mailObject);
      return true;
    } catch (e) {
      console.error('Mail sending failed:', e.message);
      return false;
    }
  };
}
