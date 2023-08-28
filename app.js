const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const portNumber = process.env.PORT || 3000;
const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json());
// Enable CORS for all routes
app.use(cors({
    origin: frontendURL // Replace with your SvelteKit frontend URL
  }));

// Create Socket.io instance with CORS options
const io = new Server(server, {
    cors: {
      origin: frontendURL, // Your SvelteKit frontend URL
      methods: ["GET", "POST"]
    }
  });
// Example GET endpoint (existing)
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// POST endpoint to receive data and emit to Socket.io
app.post('/api/update', (req, res) => {
    const data = req.body;
  
    try {
      const { speckleUrl, passports } = data; // Changed from 'body' to 'data'
  
      if (speckleUrl && passports) {
        // Emit the event to connected clients
        io.emit('dataUpdated', data); // Assuming 'io' is your Socket.io server instance
  
        res.json({ message: speckleUrl });
      } else {
        res.status(400).json({ error: 'bad passportid or speckle url' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

io.on('connection', (socket) => {
    console.log('Client connected');
});

const port = portNumber;
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
