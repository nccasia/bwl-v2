"use client";

import { Button, TextArea } from "@heroui/react";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { SendHorizonal } from "lucide-react";
import { CommentInputProps } from "@/types/comment/comment";
import { useCommentsInput } from "../hooks";

export function CommentInput(props: CommentInputProps) {
  const result = useCommentsInput(props);

  if (!result) return null;

  const { state } = result;
  const {
    register,
    handleSubmit,
    onSubmit,
    handleKeyDown,
    isSubmitDisabled,
    isPending,
    t,
    user,
  } = state;

  return (
    <div className="flex gap-3 items-start group/input">
      <UserAvatar
        src={user.avatar}
        name={user.username}
        className="w-8 h-8 mt-1"
      />
      <div className="flex-1 flex flex-col gap-2">
        <form className="relative" onSubmit={handleSubmit(onSubmit)}>
          <TextArea
            {...register("content")}
            placeholder={props.placeholder || t("writeAComment")}
            className="w-full"
            autoFocus={props.autoFocus}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            isIconOnly
            variant="ghost"
            size="sm"
            className="absolute bottom-1 right-1 text-primary hover:bg-primary/10 rounded-lg transition-all"
            isPending={isPending}
            isDisabled={isSubmitDisabled}
          >
            <SendHorizonal size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
