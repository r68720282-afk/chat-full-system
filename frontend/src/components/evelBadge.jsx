export default function LevelBadge({ level }) {
  return (
    <div style={{
      background: '#0d1b2a',
      padding: '4px 10px',
      borderRadius: '10px',
      display: 'inline-block',
      fontSize: 12,
      border: '1px solid #4cc9f0'
    }}>
      ⭐ Level {level}
    </div>
  );
}
