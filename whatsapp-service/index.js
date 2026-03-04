const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Create WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Show QR code in terminal
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

// Initialize client
client.initialize();

// API endpoint to send photo
app.post('/send-photo', async (req, res) => {
    const { phone, photoPath, caption } = req.body;

    try {
        // Format phone number (remove + and add @c.us)
        const formattedPhone = phone.replace('+', '') + '@c.us';

        // Check if file exists
        if (!fs.existsSync(photoPath)) {
            return res.status(404).json({ message: 'Photo file not found' });
        }

        // Create media from file
        const media = MessageMedia.fromFilePath(photoPath);

        // Send photo
        await client.sendMessage(formattedPhone, media, { caption: caption || 'Photo from Drishyamitra 📸' });

        console.log(`✅ Photo sent to ${phone}`);
        res.json({ message: 'Photo sent successfully!' });

    } catch (error) {
        console.error('Error sending photo:', error);
        res.status(500).json({ message: error.message });
    }
});

// API endpoint to send text message
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

// Health check
app.get('/status', (req, res) => {
    res.json({ status: 'running', whatsapp: client.info ? 'connected' : 'connecting' });
});

// Start server
app.listen(3001, () => {
    console.log('🚀 WhatsApp service running on port 3001');
});