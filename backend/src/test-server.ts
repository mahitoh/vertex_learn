import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// Simple test routes
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.get('/test/:id', (req, res) => {
  res.json({ message: 'Test route with parameter working', id: req.params.id });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
