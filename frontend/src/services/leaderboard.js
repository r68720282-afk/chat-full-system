import api from "./api";

export function getTopXP() {
  return api.get("/api/leaderboard/xp").then(r => r.data.users);
}

export function getTopLikes() {
  return api.get("/api/leaderboard/likes").then(r => r.data.users);
}

export function getTopGifts() {
  return api.get("/api/leaderboard/gifts").then(r => r.data.users);
}

export function likeUser(id) {
  return api.post(`/api/leaderboard/like/${id}`);
}
