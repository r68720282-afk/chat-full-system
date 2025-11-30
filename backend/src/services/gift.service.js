import api from "./api";

export async function getGifts() {
  const r = await api.get("/api/gifts");
  return r.data.gifts;
}

export async function sendGiftRoom(room, giftId) {
  const r = await api.post("/api/gifts/room", { room, giftId });
  return r.data;
}

export async function sendGiftDM(to, giftId) {
  const r = await api.post("/api/gifts/dm", { to, giftId });
  return r.data;
}
