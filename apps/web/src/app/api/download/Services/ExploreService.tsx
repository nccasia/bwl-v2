import { BE_URL } from "@/types/gallery";

export const fetchPostsApi = async (BE_URL: string) => {
  const res = await fetch(`${BE_URL}/bwl?limit=100`);
  if (!res.ok) throw new Error("Fetch posts failed");

  const json = await res.json();
  return json.data || json || [];
};

export const fetchReactionsApi = async (BE_URL: string, postId: string) => {
  const res = await fetch(`${BE_URL}/bwl/${postId}/reactions`);
  return res.json();
};

export const sendReaction = async (postId: string, userId: string, emoji: string) => {
  const res = await fetch(`${BE_URL}/bwl/${postId}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, emoji }),
  });

  if (!res.ok) throw new Error("Request failed");
  return res.json();
};