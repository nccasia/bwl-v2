"use client";

import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { CreatePostDialog } from "./create-post-dialog";
import { useCreatePost } from "../hooks/use-create-post";

export default function CreatePost() {
  const { state, actions } = useCreatePost();
  return (
    <>
      <div className="mb-6 rounded-3xl bg-content1 p-4 md:p-5 shadow-sm border border-divider transition-all hover:shadow-md hover:shadow-primary/5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-[-2px] rounded-full bg-linear-to-tr from-primary to-purple-400 opacity-20 group-hover:opacity-40 transition-opacity" />
            <UserAvatar
              src={state.user?.avatar}
              name={state.user?.username}
              className="w-11 h-11 relative z-10 border border-white/5"
            />
          </div>
          <div
            className="flex-1 bg-content2/50 hover:bg-content2 transition-all rounded-2xl px-6 py-3 text-muted-foreground/80 text-[15px] border border-divider/40 cursor-pointer shadow-inner"
            onClick={() => actions.open()}
          >
            {state.t("home.what'sOnYourMind")}
          </div>
        </div>
      </div>
      {state.isOpen && <CreatePostDialog />}
    </>
  );
}
