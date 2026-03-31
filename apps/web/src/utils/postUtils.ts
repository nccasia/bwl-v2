import { Post } from "@/types/gallery";

export const filterPostsWithImages = (posts: Post[]) => {
  return posts.filter(p => p.images && p.images.length > 0);
};

export const calculateTotalLikes = (reactions: any) => {
  let total = 0;
  Object.values(reactions).forEach((userList: any) => {
    if (Array.isArray(userList)) total += userList.length;
  });
  return total;
};