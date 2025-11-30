// frontend/src/components/MediaPreview.jsx
import React from 'react';
import { getMediaUrl } from '../services/media';

export default function MediaPreview({ media, style }) {
  // media: { fileId, type, filename }
  if (!media || !media.fileId) return null;
  const url = getMediaUrl(media.fileId);
  const t = (media.type || '').toLowerCase();

  if (t.startsWith('image/')) {
    return <img src={url} alt={media.filename || ''} style={{ maxWidth: '100%', borderRadius: 8, ...style }} />;
  }
  if (t.startsWith('video/')) {
    return (
      <video controls style={{ maxWidth: '100%', borderRadius: 8, ...style }}>
        <source src={url} type={media.type} />
        Your browser does not support the video tag.
      </video>
    );
  }
  // audio / other
  if (t.startsWith('audio/')) {
    return (
      <audio controls style={style}>
        <source src={url} type={media.type} />
        Your browser does not support the audio element.
      </audio>
    );
  }
  // fallback: provide download link
  return (
    <a href={url} download style={{ color: '#9aa' }}>
      Download {media.filename || 'file'}
    </a>
  );
}
