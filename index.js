
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/voice', async (req, res) => {
  const twiml = \`
    <Response>
      <Say voice="woman">Hello, this is SkyBot. What would you like to ask me?</Say>
      <Gather input="speech" action="/respond" method="POST" timeout="5" />
    </Response>
  \`;
  res.type('text/xml');
  res.send(twiml);
});

app.post('/respond', async (req, res) => {
  const userSpeech = req.body.SpeechResult || 'No input detected.';
  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: userSpeech }],
  });

  const reply = gptResponse.choices[0].message.content;

  const twiml = \`
    <Response>
      <Say voice="woman">\${reply}</Say>
    </Response>
  \`;
  res.type('text/xml');
  res.send(twiml);
});

app.get('/', (req, res) => {
  res.send('SkyBot Voice agent started');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('SkyBot Voice is live on port', PORT);
});
