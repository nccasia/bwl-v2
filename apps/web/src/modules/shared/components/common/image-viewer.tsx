"use client";

import { Modal, Button, Spinner } from "@heroui/react";
import { ChevronLeft, ChevronRight, X, Info, Hash } from "lucide-react";
import { useImageViewer } from "@/modules/shared/hooks/image-viewer/use-image-viewer";

export function ImageViewer() {
  const { state, actions } = useImageViewer();
  if (!state.isOpen) return null;
  return (
    <Modal.Root isOpen={state.isOpen} onOpenChange={actions.close}>
      <Modal.Backdrop className="fixed inset-0 bg-black/95 z-[500] animate-in fade-in duration-300 backdrop-blur-md" />
      <Modal.Container
        placement="center"
        className="fixed inset-0 z-[501] flex items-center justify-center w-screen h-svh outline-none"
      >
        <Modal.Dialog
          className="w-full h-full bg-transparent shadow-none border-none p-0 outline-none flex items-center justify-center relative touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) actions.close();
          }}
        >
          <div className="absolute top-6 right-6 z-[510] flex items-center gap-4">
            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-full text-white/70 flex items-center gap-2 border border-white/5">
              {state.isLoadingMeta ? (
                <Spinner size="sm" color="current" />
              ) : (
                <>
                  <Info size={18} />
                  <span className="text-xs hidden md:inline">
                    {state.metadata?.dimensions} • {state.metadata?.size}
                  </span>
                </>
              )}
            </div>
            <Button
              isIconOnly
              variant="ghost"
              className="text-white hover:bg-white/10 border-none h-12 w-12 rounded-full cursor-pointer bg-black/20 backdrop-blur-sm shadow-xl"
              onPress={actions.close}
            >
              <X size={28} />
            </Button>
          </div>

          {state.images.length > 1 && (
            <>
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[510]">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white hover:bg-white/10 border-none h-14 w-14 rounded-full hidden sm:flex cursor-pointer bg-black/20 backdrop-blur-sm shadow-xl"
                  onPress={actions.prev}
                >
                  <ChevronLeft size={40} />
                </Button>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[510]">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white hover:bg-white/10 border-none h-14 w-14 rounded-full hidden sm:flex cursor-pointer bg-black/20 backdrop-blur-sm shadow-xl"
                  onPress={actions.next}
                >
                  <ChevronRight size={40} />
                </Button>
              </div>
            </>
          )}

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[510] flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-white/10 shadow-2xl">
              {state.images.length > 1 && (
                <div className="px-4 py-1 text-white font-bold text-sm">
                  {state.currentIndex + 1} / {state.images.length}
                </div>
              )}

              <form
                onSubmit={state.form.handleSubmit(actions.onJumpTo)}
                className="flex items-center gap-1 bg-white/10 rounded-full px-2"
              >
                <Hash size={14} className="text-white/50" />
                <input
                  {...state.form.register("index", { valueAsNumber: true })}
                  className="bg-transparent text-white text-xs w-8 outline-none text-center font-bold h-8"
                  autoComplete="off"
                />
                <button type="submit" className="hidden" />
              </form>
            </div>

            {state.form.formState.errors.index && (
              <span className="text-danger text-[10px] bg-black/60 px-2 py-0.5 rounded">
                {state.form.formState.errors.index.message}
              </span>
            )}
          </div>

          <div className="w-full h-full flex items-center justify-center p-4 sm:p-20 pointer-events-none select-none">
            <img
              key={state.currentIndex}
              src={state.images[state.currentIndex]}
              alt={`View ${state.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300 pointer-events-auto"
            />
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  );
}
