"use client";

import {
  Modal,
  Button,
  TextArea,
  Tooltip,
  AlertDialog,
  Spinner,
} from "@heroui/react";
import { Image as ImageIcon, X, TriangleAlert } from "lucide-react";
import { useCreatePostDialog } from "../hooks/use-create-post-dialog";

import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { EmojiPicker } from "@/modules/shared/components/common/emoji-picker";
import { MediaPreviewGrid } from "@/modules/shared/components/post/media-preview-grid";

export function CreatePostDialog() {
  const { state, handles } = useCreatePostDialog();

  return (
    <>
      <Modal.Root
        isOpen={state.isOpen}
        onOpenChange={handles.handleCloseAttempt}
      >
        <Modal.Backdrop className="fixed inset-0 bg-black/50 z-100 animate-in fade-in duration-200" />
        <Modal.Container
          placement="center"
          className="fixed inset-0 z-100 flex items-center justify-center w-screen h-svh p-4"
        >
          <div
            className="w-full h-full flex items-center justify-center pointer-events-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handles.handleCloseAttempt(false);
              }
            }}
          >
            <Modal.Dialog className="bg-content1 rounded-[16px] shadow-2xl overflow-hidden max-w-[800px] w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 origin-center outline-none">
              <Modal.Header className="flex items-center justify-center relative p-4 border-b border-divider">
                <Modal.Heading className="text-[20px] font-bold text-foreground font-sans">
                  {state.t("title")}
                </Modal.Heading>
                <Modal.CloseTrigger
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-content3 hover:bg-content4 rounded-full transition-colors cursor-pointer outline-none"
                  onPress={() => handles.handleCloseAttempt(false)}
                >
                  <X size={20} className="text-foreground-secondary" />
                </Modal.CloseTrigger>
              </Modal.Header>

              <Modal.Body className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar
                    src={state.user?.avatar}
                    name={state.user?.username}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[15px] text-foreground font-sans">
                      {state.user?.username || "Anonymous"}
                    </span>
                  </div>
                </div>

                <div className="min-h-[140px] py-2">
                  <TextArea.Root
                    {...state.form.register("content")}
                    value={state.postContent}
                    placeholder={state.t("whats-on-your-mind", {
                      name: state.user?.username?.split(" ")[0] || "",
                    })}
                    className="w-full bg-transparent text-[20px] placeholder:text-muted-foreground outline-none border-none focus:ring-0 resize-none font-sans min-h-[120px] h-auto overflow-hidden"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      state.form.setValue("content", target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  {state.errors.content && (
                    <p className="text-danger text-xs mt-1 font-medium">
                      {state.errors.content.message}
                    </p>
                  )}
                </div>

                <MediaPreviewGrid
                  urls={state.previewUrls}
                  onRemove={handles.removeFile}
                />
              </Modal.Body>

              <div className="px-4 pb-2">
                <div className="p-3 border border-divider rounded-[12px] flex items-center justify-between shadow-sm bg-content1">
                  <span className="text-[15px] font-semibold text-foreground px-1 font-sans">
                    {state.t("add-to-your-post")}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={state.fileInputRef}
                      className="hidden"
                      onChange={handles.handleFileSelect}
                    />
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          variant="secondary"
                          className="bg-transparent hover:bg-content2 text-success min-w-0 border-none shadow-none"
                          onPress={handles.triggerFileInput}
                        >
                          <ImageIcon size={24} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content className="bg-content4 text-content4-foreground px-2 py-1 rounded text-xs">
                        {state.t("add-photo-or-video")}
                      </Tooltip.Content>
                    </Tooltip.Root>

                    <EmojiPicker onEmojiSelect={handles.onEmojiSelect} />
                  </div>
                </div>
              </div>

              <Modal.Footer className="p-4 border-t-0">
                <Button
                  variant="primary"
                  className="w-full h-10 font-bold text-[15px] rounded-[8px]"
                  onPress={() => state.form.handleSubmit(handles.onSubmit)()}
                  isDisabled={
                    (!state.form.formState.isValid &&
                      state.previewUrls.length === 0) ||
                    state.isPending
                  }
                  isPending={state.isPending}
                >
                  {state.isPending ? (
                    <Spinner size="lg" color="current" className="mr-2" />
                  ) : null}
                  {state.t("post")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        </Modal.Container>
      </Modal.Root>

      {state.isConfirmOpen && (
        <AlertDialog.Root
          isOpen={state.isConfirmOpen}
          onOpenChange={handles.setIsConfirmOpen}
        >
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/40 z-200 animate-in fade-in duration-200" />
          <AlertDialog.Container
            placement="center"
            className="fixed inset-0 z-200 flex items-center justify-center w-screen h-svh p-4"
          >
            <AlertDialog.Dialog className="bg-content1 rounded-[12px] shadow-xl max-w-[400px] w-full p-6 animate-in zoom-in-95 duration-200 outline-none">
              <AlertDialog.Header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-warning">
                  <TriangleAlert size={24} />
                  <AlertDialog.Heading className="text-[18px] font-bold text-foreground">
                    {state.t("are-you-sure")}
                  </AlertDialog.Heading>
                </div>
              </AlertDialog.Header>
              <AlertDialog.Body className="py-2">
                <p className="text-foreground-secondary text-[15px]">
                  {state.t("you-have-unsaved-changes")}
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer className="mt-4">
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="secondary"
                    className="flex-1 font-semibold"
                    onPress={handles.handleDiscard}
                  >
                    {state.t("discard-changes")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 font-semibold"
                    onPress={() => handles.setIsConfirmOpen(false)}
                  >
                    {state.t("keep-draft")}
                  </Button>
                </div>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Root>
      )}
    </>
  );
}
