export default function GiftItem({ gift, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#08111f",
        borderRadius: 8,
        padding: 10,
        cursor: "pointer",
        textAlign: "center",
        border: "1px solid #233",
      }}
    >
      <img
        src={gift.image}
        alt=""
        style={{ width: 60, height: 60, objectFit: "contain" }}
      />
      <div style={{ fontSize: 12, marginTop: 6 }}>{gift.name}</div>
      <div style={{ fontSize: 10, opacity: 0.7 }}>{gift.cost} coins</div>
    </div>
  );
}
