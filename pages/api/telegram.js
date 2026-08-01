export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // YOUR Telegram credentials - Replace with your values
    const botToken = '5335711328:AAHg9nmm95zhtag5kJ4U_Cu1wIzZsQyCAYY'; // Replace with your bot token
    const chatId = '683247717'; // Your Chat ID from the response

    // Send message to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_notification: false,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram error:', error);
    return res.status(500).json({ error: error.message });
  }
}