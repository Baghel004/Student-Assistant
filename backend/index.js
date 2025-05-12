require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const Together = require('together-ai');
const path = require("path")
const fs = require('fs');

const app = express();
app.use(cors({
   origin: 'http://localhost:5173'} 
));
app.use(bodyParser.json());
app.use(express.json());


const together = new Together({ apiKey: process.env.SECRET_KEY });

const analyzeFilePath = path.join(__dirname, '/analyzer_api.py')



// Analyze endpoint
app.post('/api/analyze', (req, res) => {
  console.log("req came");
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  // console.log('Spawning Python process...');
  const pythonProcess = spawn('python', [analyzeFilePath, url]);

  let result = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    // console.log("PYTHON STDOUT:", data.toString());  // Log the raw data to inspect
    result += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    // console.log("PYTHON STDERR:", data.toString());  // Log any errors from Python
    error += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    console.log("Python process closed with exit code:", code);
    console.log("Raw Python result:", result);
    console.log("Raw Python error:", error);
  
    if (code !== 0 || error) {
      return res.status(500).json({ error: error || 'Failed to run analysis' });
    }
  
    try {
      // Ensure the response is properly parsed into JSON
      const parsed = JSON.parse(result.trim());  // Use trim to remove extra whitespace/newlines
      return res.json({
        fileName: url.split('/').pop(),
        fileType: 'text/csv',
        fileSize: null,  // You can fetch the file size if you want
        analysis1: parsed.weak_topics
      });
    } catch (e) {
      // console.error('Error parsing JSON:', e);
      return res.status(500).json({ error: 'Invalid JSON returned from script' });
    }});
});



// 2️⃣ Video Recommendation endpoint
app.post('/api/recommend', (req, res) => {
  const { topic } = req.body;
const filePath = path.join(__dirname, '/recommender_api.py')
  const py = spawn('python', [filePath, topic]);
  let out = '';
  py.stdout.on('data', d => (out += d.toString()));
  py.stderr.on('data', d => console.error(d.toString()));
  py.on('close', () => {
    const json = JSON.parse(out);
    res.json(json);
  });
});


// 🎯 Video Summarization Endpoint
app.post('/api/summarize', (req, res) => {
  const { videoUrl } = req.body;
  const filePath = path.join(__dirname, 'summarizer_api.py');

  const py = spawn('python', [filePath, videoUrl]);
  let out = '';
  let errOut = '';

  py.stdout.on('data', (d) => (out += d.toString()));
  py.stderr.on('data', (d) => (errOut += d.toString()));

  py.on('close', () => {
    if (errOut) console.error('Python stderr:', errOut);
    try {
      const json = JSON.parse(out);
      if (json.error) {
        return res.status(500).json({ error: json.error });
      }
      res.json({ summary: json.summary });
    } catch (err) {
      console.error('Failed to parse Python output:', out);
      res.status(500).json({ error: 'Summarizer returned invalid JSON.' });
    }
  });
});


// 4️⃣ Chat endpoint (Together.ai)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: [{ role: 'user', content: message }]
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`🚀 Backend listening on ${PORT}`));
