import { useEffect, useState } from 'react';
import image5 from './assets/img5.jpg';
import image6 from './assets/img6.jpg';
import vid1 from './assets/vid1.mp4';
import vid2 from './assets/vid2.mp4';
import vid3 from './assets/vid3.mp4';
import vid4 from './assets/vid4.mp4';

const surprises = [
  {
    id: 1,
    title: 'Moonlit whisper',
    text: 'A soft glow for your first choice',
    mediaType: 'video',
    src: vid1,
    color: '#ff7aa2',
  },
  {
    id: 2,
    title: 'Golden hush',
    text: 'A little warmth, a little wonder',
    mediaType: 'image',
    src: image5,
    color: '#ffb347',
  },
  {
    id: 3,
    title: 'Starlit memory',
    text: 'A gentle spark that lingers',
    mediaType: 'image',
    src: image6,
    color: '#7c3aed',
  },
  {
    id: 4,
    title: 'Quiet bloom',
    text: 'The softest reveal of all',
    mediaType: 'video',
    src: vid2,
    color: '#38bdf8',
  },
  {
    id: 5,
    title: 'Silent echo',
    text: 'A lingering shimmer after the first choice',
    mediaType: 'video',
    src: vid3,
    color: '#22c55e',
  },
  {
    id: 6,
    title: 'Hidden shimmer',
    text: 'A quiet final reveal from the last asset',
    mediaType: 'video',
    src: vid4,
    color: '#0ea5e9',
  },
];

function App() {
  const [step, setStep] = useState<'intro' | 'play' | 'thanks' | 'burst'>('intro');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [firstClicked, setFirstClicked] = useState<number | null>(null);
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const selected = surprises.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!popupImage) return;

    const timer = window.setTimeout(() => {
      setPopupImage(null);
      setStep('thanks');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [popupImage]);

  useEffect(() => {
    const saved = window.localStorage.getItem('first-clicked-choice');
    if (saved) {
      setFirstClicked(Number(saved));
    }
  }, []);

  const notifySelection = async (item: {
    id: number;
    title: string;
    text: string;
    mediaType: string;
  }) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          text: item.text,
          mediaType: item.mediaType,
          selectedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Notification failed', error);
    }
  };

  const handlePick = (id: number) => {
    const item = surprises.find((item) => item.id === id);
    if (!item) return;

    if (firstClicked === null) {
      setFirstClicked(id);
      window.localStorage.setItem('first-clicked-choice', String(id));
    }

    setSelectedId(id);
    setPopupImage(item.src);
    notifySelection(item);
  };

  const resetFlow = () => {
    setSelectedId(null);
    setFirstClicked(null);
    setPopupImage(null);
    window.localStorage.removeItem('first-clicked-choice');
    setStep('play');
  };

  const handleIntroClick = () => {
    setStep('burst');
    window.setTimeout(() => {
      setStep('play');
    }, 800);
  };

  return (
    <div className="app-shell">
      <div className="balloons" aria-hidden="true">
        <span style={{ ['--delay' as string]: '0s' }}>🌙</span>
        <span style={{ ['--delay' as string]: '1s' }}>✨</span>
        <span style={{ ['--delay' as string]: '2s' }}>🌸</span>
        <span style={{ ['--delay' as string]: '3s' }}>🌫️</span>
      </div>

      <div className="app-card">
        {step === 'intro' && (
          <section className="panel intro-panel">
            <p className="eyebrow">A little poem for your heart</p>
            <h1>Sugam alle ??</h1>
            <p className="intro-copy">Some words, some light, and one soft beginning.</p>
            <button onClick={handleIntroClick}>SUGAMMMM</button>
          </section>
        )}

        {step === 'play' && (
          <section className="panel">
            <p className="eyebrow">A quiet invitation</p>
            <h2>Choose the one that feels most true</h2>
            <div className="box-grid">
              {surprises.map((item) => (
                <button
                  key={item.id}
                  className={`box-card ${selectedId === item.id ? 'active' : ''}`}
                  onClick={() => handlePick(item.id)}
                  style={{ borderColor: item.color }}
                >
                  <span className="hover-label">Click to reveal</span>
                  <span className="box-number">{item.id}</span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </button>
              ))}
            </div>

            {popupImage && (
              <div className="popup-image">
                {surprises.find((item) => item.src === popupImage)?.mediaType === 'video' ? (
                  <video src={popupImage} autoPlay muted playsInline />
                ) : (
                  <img src={popupImage} alt="A magical reveal" />
                )}
              </div>
            )}

            <div className="actions-row">
              <button className="secondary" onClick={resetFlow}>Again</button>
            </div>
          </section>
        )}

        {step === 'burst' && (
          <section className="burst-screen">
            <div className="burst-balloon">🎈</div>
            <div className="burst-balloon two">🎈</div>
            <div className="burst-balloon three">🎈</div>
            <div className="burst-balloon four">🎈</div>
            <div className="burst-text">✨</div>
          </section>
        )}

        {step === 'thanks' && (
          <section className="panel thanks-panel">
            <p className="eyebrow">A soft ending</p>
            <h1>Thank you</h1>
            <p>Your little choice has been received with warmth and care.</p>
            <button onClick={() => setStep('intro')}>Go back</button>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
