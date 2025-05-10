require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { VapiClient } = require('./dist');

// Initialize the Vapi client with your API token
const vapiClient = new VapiClient({
  token: process.env.VAPI_API_TOKEN
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Endpoint to initiate a call
app.post('/initiate-call', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Create a call using the Vapi SDK
    const callResponse = await vapiClient.calls.create({
      phoneNumberId: process.env.PHONE_NUMBER_ID,
      assistantId: process.env.ASSISTANT_ID,
      customer: {
        number: phoneNumber
      }
    });

    // Return the call details
    res.status(200).json({
      success: true,
      message: 'Call initiated successfully',
      callId: callResponse.data.id,
      callDetails: callResponse.data
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message
    });
  }
});

// Endpoint to get call status
app.get('/call/:id', async (req, res) => {
  try {
    const callId = req.params.id;
    
    if (!callId) {
      return res.status(400).json({ error: 'Call ID is required' });
    }

    // Get call details using the Vapi SDK
    const callResponse = await vapiClient.calls.get(callId);

    res.status(200).json({
      success: true,
      callDetails: callResponse.data
    });
  } catch (error) {
    console.error('Error getting call details:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get call details',
      error: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Call initiation endpoint: http://localhost:${PORT}/initiate-call`);
});