import { Configuration, OpenAIApi } from 'openai';

// Import conditionnel de SendGrid : on ne l'utilise que si une clé est fournie
let sgMail;
if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  const { theme, duration, tone } = req.body;
  try {
    // Génération du script
    const prompt = `Crée un podcast de ${duration} minutes sur ${theme}. Structure : introduction, développement en plusieurs sections, conclusion. Tonalité : ${tone}. Fournis des sources fiables en conclusion.`;
    const chat = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    });
    const script = chat.data.choices[0].message.content;

    // Génération de l'audio (voix "verse")
    const speech = await openai.createSpeech({
      model: 'tts-1',
      input: script,
      voice: 'voice_verse',
      response_format: 'mp3'
    });

    // Envoi par mail uniquement si la clé SendGrid est présente
    if (sgMail && process.env.EMAIL_FROM && process.env.EMAIL_TO) {
      const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM,
        subject: `🎙️ Ton podcast MindCast sur ${theme}`,
        text: `Voici ton podcast sur ${theme}.`,
        html: `<p>Bonjour,<br>Voici ton épisode généré par MindCast.</p>`,
        attachments: [
          {
            content: Buffer.from(await speech.arrayBuffer()).toString('base64'),
            filename: `podcast-${Date.now()}.mp3`,
            type: 'audio/mpeg',
            disposition: 'attachment'
          }
        ]
      };
      await sgMail.send(msg);
    }

    // Réponse au navigateur : renvoie l'audio encodé en base64 + sources
    res.status(200).json({
      audioUrl: `data:audio/mpeg;base64,${Buffer.from(await speech.arrayBuffer()).toString('base64')}`,
      sources: ['UNESCO', 'OCDE', 'Le Monde'] // exemples de sources
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du podcast.' });
  }
}
