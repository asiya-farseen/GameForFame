const sendWebhook = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }
};

const sendEmail = async (apiKey, from, to, subject, message) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: { email: from },
      subject,
      content: [
        {
          type: 'text/plain',
          value: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid failed: ${response.status} ${response.statusText} ${errorText}`);
  }
};

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = {
      status: 405,
      body: { error: 'Method not allowed. Use POST.' },
    };
    return;
  }

  const { id, title, text, mediaType, selectedAt } = req.body || {};

  if (!id || !title || !selectedAt) {
    context.res = {
      status: 400,
      body: { error: 'Missing id, title, or selectedAt in request body.' },
    };
    return;
  }

  const payload = {
    id,
    title,
    text: text || '',
    mediaType: mediaType || '',
    selectedAt,
  };

  let webhookSent = false;
  let emailSent = false;

  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      await sendWebhook(webhookUrl, payload);
      webhookSent = true;
    }

    const sendgridKey = process.env.SENDGRID_API_KEY;
    const sendgridFrom = process.env.SENDGRID_FROM;
    const sendgridTo = process.env.SENDGRID_TO;
    if (sendgridKey && sendgridFrom && sendgridTo) {
      const subject = `Figmma choice selected: ${title}`;
      const message = `A user selected:\n\n- id: ${id}\n- title: ${title}\n- text: ${text || 'N/A'}\n- mediaType: ${mediaType || 'N/A'}\n- selectedAt: ${selectedAt}`;
      await sendEmail(sendgridKey, sendgridFrom, sendgridTo, subject, message);
      emailSent = true;
    }

    context.res = {
      status: 200,
      body: {
        success: true,
        webhookSent,
        emailSent,
        payload,
      },
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: {
        error: error.message || 'Notification failed.',
      },
    };
  }
};
