const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const corsOptions ={
  origin:'*', 
  credentials:true,      
  optionSuccessStatus:200
}
const app = express();
const server = http.createServer(app);

const portNumber = process.env.PORT || 3000;
//production fronend url 
const frontendURL = process.env.FRONTEND_URL || "https://strong-cajeta-eda609.netlify.app";
//development frontend url
//const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(express.json());
// Enable CORS for all routes
app.use(cors(corsOptions,{
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

// Storing client sockets
const clientSockets = {};
// POST endpoint to receive data and emit to Socket.io
app.post('/api/update', (req, res) => {
  const data = req.body;

  console.log('Received update request with data:', data);

  try {
    const { speckleUrl, passports, userId } = data;

    if (!speckleUrl || !passports) {
      return res.status(400).json({
        status: 'error',
        message: 'Both speckleUrl and passports are required.'
      });
    }

    if (userId && clientSockets[userId]) {
      clientSockets[userId].emit('dataUpdated', data);
      return res.json({
        status: 'success',
        message: `Update sent specifically to user: ${userId}`,
        data: { speckleUrl }
      });
    }

    // If no userID is provided, or if the socket doesn't exist, emit to all connected clients
    console.error('Error No UserID Session Register');
    res.status(404).json({
      status: 'error',
      message: 'No userId connection have been stablish with the pass userId.',
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred processing the request.',
      errors: [ error.message ]
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

io.on('connection', (socket) => {
  console.log('Client connected');

  // When a client registers with a user ID
  socket.on('register', (userID) => {
    console.log(`Client registered with ID ${userID}`);
    clientSockets[userID] = socket;

    socket.on('disconnect', () => {
    console.log(`Client removed with ID ${userID}`);
      delete clientSockets[userID];
    });
  });
});

const port = portNumber;
server.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
