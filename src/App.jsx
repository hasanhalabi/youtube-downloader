// src/App.jsx
import React, { useState, useEffect } from 'react';

const App = () => {
  const [url, setUrl] = useState('');
  const [downloads, setDownloads] = useState([]);

  const handleDownload = async () => {
    if (!url.trim()) return;
    const id = Date.now();
    setDownloads(prev => [
      ...prev,
      { id, title: 'Fetching video info...', progress: '0%', status: 'in-progress' }
    ]);
    try {
      const result = await window.api.downloadVideo({ id, url });
      setDownloads(prev =>
        prev.map(item =>
          item.id === id ? { ...item, title: result.title, progress: '100%', status: 'completed' } : item
        )
      );
    } catch (error) {
      setDownloads(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'error', error: error.message } : item
        )
      );
    }
    setUrl('');
  };

  useEffect(() => {
    window.api.onDownloadProgress((data) => {
      setDownloads(prev =>
        prev.map(item =>
          item.id === data.id ? { ...item, progress: data.progress } : item
        )
      );
    });
  }, []);

  return (
    // Set the text color to white here (or you could use a CSS file)
    <div style={{ color: 'white', backgroundColor: '#312450', minHeight: '100vh', padding: '20px' }}>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleDownload(); }}
        style={{ padding: '8px', fontSize: '16px', width: '60%' }}
      />
      <button onClick={handleDownload} style={{ padding: '8px 16px', fontSize: '16px', marginLeft: '10px' }}>
        Download
      </button>
      <ul>
        {downloads.map(download => (
          <li key={download.id} style={{ marginTop: '10px' }}>
            {download.title} - {download.progress}{' '}
            {download.status === 'error' && `(Error: ${download.error})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;