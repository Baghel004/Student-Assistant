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
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });
const together = new Together({ apiKey: process.env.SECRET_KEY });

const analyzeFilePath = path.join(__dirname, '/analyzer_api.py')
function runCli(scriptName, args, res, successHandler) {
  const scriptPath = path.join(__dirname, scriptName);
  const py = spawn('python', [scriptPath, ...args]);
  let out = '';

  py.stdout.on('data', d => out += d.toString());
  py.stderr.on('data', d => console.error(d.toString()));
  py.on('close', () => {
    try {
      const json = JSON.parse(out);
      if (json.error) return res.status(500).json({ error: json.error });
      return successHandler(json);
    } catch (err) {
      console.error(`Bad JSON from ${scriptName}:`, out);
      return res.status(500).json({ error: `${scriptName} returned invalid JSON.` });
    }
  });
}


// 1️⃣ File Analysis endpoint
app.post('/api/analyze', upload.single('file'), (req, res) => {
  const { path: filePath, originalname, mimetype, size } = req.file;
  runCli(
    'analyzer_api.py',
    [filePath],
    res,
    json => res.json({
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      analysis: json.weak_topics
    })
  );
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

// 3️⃣ Video Summarization endpoint
app.post('/api/summarize', (req, res) => {
  const { videoUrl } = req.body;
  const filePath = path.join(__dirname, '/summarizer_api.py')

  const py = spawn('python', [filePath, videoUrl]);
  let out = '';
  py.stdout.on('data', d => (out += d.toString()));
  py.stderr.on('data', d => console.error(d.toString()));
  py.on('close', () => {
    try {
      const json = JSON.parse(out);
      if (json.error) return res.status(500).json({ error: json.error });
      res.json({ summary: json.summary });
    } catch (err) {
      console.error('Bad JSON from summarizer:', out);
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
