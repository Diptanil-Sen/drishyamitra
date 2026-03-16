const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('📱 Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp is connected and ready!');
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp authenticated!');
});

client.on('auth_failure', () => {
  console.log('❌ WhatsApp authentication failed!');
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);
});

client.initialize();

app.post('/send-photo', async (req, res) => {
  const { phone, photoPath, caption } = req.body;
  try {
    const formattedPhone = phone.replace('+', '') + '@c.us';

    if (!fs.existsSync(photoPath)) {
      return res.status(404).json({ message: 'Photo file not found' });
    }

    const media = MessageMedia.fromFilePath(photoPath);
    await client.sendMessage(formattedPhone, media, { caption: caption || 'Photo from Drishyamitra 📸' });

    console.log(`✅ Photo sent to ${phone}`);
    res.json({ message: 'Photo sent successfully!' });
  } catch (error) {
    console.error('Error sending photo:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body;
  try {
    const formattedPhone = phone.replace('+', '') + '@c.us';
    await client.sendMessage(formattedPhone, message);

    console.log(`✅ Message sent to ${phone}`);
    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/status', (req, res) => {
  res.json({ status: 'running', whatsapp: client.info ? 'connected' : 'connecting' });
});

app.listen(3001, () => {
  console.log('🚀 WhatsApp service running on port 3001');
});