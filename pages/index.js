import { useState } from 'react';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [duration, setDuration] = useState(10);
  const [tone, setTone] = useState('narratif');
  const [loading, setLoading] = useState(false);
  const [podcast, setPodcast] = useState(null);

  const createPodcast = async () => {
    setLoading(true);
    const res = await fetch('/api/create-podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, duration, tone })
    });
    const data = await res.json();
    setPodcast(data);
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0a0a23', color: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
      <h1>MindCast – La voix qui révèle le meilleur de toi.</h1>
      <p>Crée ton podcast personnalisé en choisissant un thème, une durée et un ton.</p>
      <div>
        <label>Thème :
          <input value={theme} onChange={e => setTheme(e.target.value)} />
        </label>
      </div>
      <div>
        <label>Durée (minutes) :
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </label>
      </div>
      <div>
        <label>Tonalité :
          <select value={tone} onChange={e => setTone(e.target.value)}>
            <option value="narratif">Narratif</option>
            <option value="dialogue">Dialogue</option>
            <option value="guidé">Guidé</option>
            <option value="dynamique">Dynamique</option>
          </select>
        </label>
      </div>
      <button onClick={createPodcast} disabled={loading}>Générer mon podcast</button>

      {loading && <p>Génération en cours…</p>}

      {podcast && (
        <div>
          <h2>Ton podcast est prêt !</h2>
          <audio controls src={podcast.audioUrl}></audio>
          <p><strong>Sources utilisées :</strong> {podcast.sources.join(', ')}</p>
          <p>Nous t’avons également envoyé cet épisode à ton adresse e‑mail.</p>
        </div>
      )}
    </div>
  );
}
