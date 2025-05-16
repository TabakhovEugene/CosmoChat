const ws = require('ws');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');

const app = express();
app.use(bodyParser.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CosmoChat Application Layer API',
            version: '1.0.0',
            description: 'API documentation for the CosmoChat application layer',
            contact: {
                name: 'Eugene Tabakhov',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Application Layer Server',
            },
        ],
    },
    apis: ['./websocket.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api-docs.yaml', (req, res) => {
    const yamlString = yaml.dump(swaggerDocs);
    res.setHeader('Content-Type', 'text/yaml');
    res.setHeader('Content-Disposition', 'attachment; filename=swagger-docs.yaml');
    res.send(yamlString);
});

// Earth WebSocket server (port 8005)
const earthWss = new ws.Server({ port: 8005 }, () => console.log(`Earth server started on 8005`));

// Mars WebSocket server (port 8010)
const marsWss = new ws.Server({ port: 8010 }, () => console.log(`Mars server started on 8010`));

earthWss.on('connection', function connection(ws) {
    console.log('New client connected to Earth');

    ws.on('message', async function (message) {
        try {
            const messageData = JSON.parse(message);
            console.log('Message received on Earth:', messageData);

            switch (messageData.event) {
                case 'message':
                    await sendToTransportLayer({
                        username: messageData.username,
                        sendTime: new Date(messageData.id).toISOString(),
                        message: messageData.message
                    });
                    console.log('Message sent to TransportLayer:', {
                        username: messageData.username,
                        sendTime: new Date(messageData.id).toISOString(),
                        message: messageData.message
                    });
                    break;
                case 'connection':
                    broadcastMessage(earthWss, messageData);
                    break;
            }
        } catch (error) {
            console.error('Error processing Earth message:', error);
        }
    });
});

// Mars WebSocket connections
marsWss.on('connection', function connection(ws) {
    console.log('New client connected to Mars');

    ws.on('message', function (message) {
        try {
            const messageData = JSON.parse(message);
            console.log('Message received on Mars:', messageData);
            if (messageData.event === 'connection') {
                broadcastMessage(marsWss, messageData);
                broadcastMessage(earthWss, messageData);
            }
        } catch (error) {
            console.error('Error processing Mars message:', error);
        }
    });
});

// Function to send message to all clients on a specific WebSocket server
function broadcastMessage(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Function to send message to transport layer via HTTP
async function sendToTransportLayer(message) {
    try {
        // Adjust the URL to your colleague's transport layer endpoint
        const response = await axios.post('http://192.168.43.115:8080/send', message);
        console.log('Message send to transport layer:', response.config.data);
    } catch (error) {
        console.error('Error sending to transport layer:', error);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - event
 *         - username
 *         - message
 *         - id
 *       properties:
 *         event:
 *           type: string
 *           description: Type of event ('message', 'connection')
 *         username:
 *           type: string
 *           description: Username of the message sender
 *         message:
 *           type: string
 *           description: Content of the message
 *         id:
 *           type: number
 *           description: Unique message identifier (timestamp)
 *         planet:
 *           type: string
 *           description: Planet of origin (Earth or Mars)
 *       example:
 *         event: message
 *         username: JohnDoe
 *         message: Hello from Earth!
 *         id: 1679234567890
 *         planet: Earth
 */

/**
 * @swagger
 * /receive:
 *   post:
 *     summary: Receive a message from the transport layer
 *     description: Endpoint for the transport layer to send messages to Mars clients
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message successfully received and broadcasted to Mars clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Message received and broadcasted to Mars
 *       400:
 *         description: Invalid message format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid message format
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

// HTTP endpoint to receive messages from transport layer
app.post('/receive', (req, res) => {
    try {
        const { message, sendTime, username, error } = req.body;
        console.log('Message received from transport layer:', req.body);

        if (!message || !username || !sendTime) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid message format'
            });
        }

        const broadcast = {
            event: 'message',
            username,
            message,
            id: Date.parse(sendTime),
            planet: 'Earth'
        };

        broadcastMessage(earthWss, broadcast);
        broadcastMessage(marsWss, broadcast);

        res.status(200).json({
            status: 'success',
            message: 'Message received and broadcasted to Mars and Earth'
        });
    } catch (error) {
        console.error('Error processing received message:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});


// Start HTTP server for receiving messages from transport layer
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});