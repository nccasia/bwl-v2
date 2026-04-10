import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { postReactionSchema, PostReactionInput, ReactionType } from "@/schemas/post/reaction";
import { postService } from "@/services/post/post-service";
import { useReactionStore } from "@/stores/post/reaction-store";

export function usePostReaction(
  postId: string,
  initialCount: number = 0,
  onAction?: (action: () => void) => void,
) {
  const queryClient = useQueryClient();
  const { setReaction, getReaction } = useReactionStore();
  const currentReaction = getReaction(postId);

  const [showPicker, setShowPicker] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<PostReactionInput>({
    resolver: valibotResolver(postReactionSchema),
    defaultValues: {
      postId,
      type: currentReaction,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PostReactionInput) => {
      return postService.reactToPost(data.postId, data.type);
    },
    onMutate: async (newData) => {
      setReaction(postId, newData.type);
      return { previousReaction: currentReaction };
    },
    onError: (err, newData, context) => {
      if (context?.previousReaction !== undefined) {
        setReaction(postId, context.previousReaction);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const onReact = (type: ReactionType | null) => {
    const newType = type === currentReaction ? null : type;
    form.setValue("type", newType);
    mutation.mutate({ postId, type: newType });
  };

  const handleAction = (action: () => void) => {
    if (onAction) {
      onAction(action);
    } else {
      action();
    }
  };

  const handleMouseEnter = () => {
    handleAction(() => {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPicker(true);
      }, 500);
    });
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePickerMouseLeave = () => {
    setShowPicker(false);
  };

  const handleSelect = (type: ReactionType) => {
    onReact(type);
    setShowPicker(false);
  };

  const handleOnPress = () => {
    handleAction(() => onReact(currentReaction || "LIKE"));
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const totalCount = initialCount + (currentReaction ? 1 : 0);

  return {
    state: {
      currentReaction,
      isPending: mutation.isPending,
      showPicker,
      totalCount,
    },
    handles: {
      handleMouseEnter,
      handleMouseLeave,
      handlePickerMouseLeave,
      handleSelect,
      handleOnPress,
      setShowPicker,
    },
    actions: {
      form,
    },
  };
}
