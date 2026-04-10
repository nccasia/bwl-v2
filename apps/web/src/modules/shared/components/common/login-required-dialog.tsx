"use client";

import React from "react";
import { AlertDialog, Button } from "@heroui/react";
import { LogIn } from "lucide-react";
import { useLoginRequired } from "@/modules/shared/hooks/use-login-required";

export function LoginRequiredDialog() {
  const { state, actions } = useLoginRequired();

  if (!state.isOpen) return null;

  return (
    <AlertDialog.Root isOpen={state.isOpen} onOpenChange={actions.close}>
      <AlertDialog.Backdrop className="fixed inset-0 bg-black/60 z-[200] animate-in fade-in duration-300 backdrop-blur-sm" />
      <AlertDialog.Container
        placement="center"
        className="fixed inset-0 z-[200] flex items-center justify-center w-screen h-svh p-4"
      >
        <div
          className="w-full h-full flex items-center justify-center pointer-events-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              actions.close();
            }
          }}
        >
          <AlertDialog.Dialog className="bg-content1 rounded-[24px] shadow-2xl max-w-[440px] w-full p-8 animate-in zoom-in-95 duration-300 outline-none border border-divider">
            <AlertDialog.Header className="flex flex-col gap-4 items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <LogIn size={32} />
              </div>
              <AlertDialog.Heading className="text-[22px] font-black text-foreground tracking-tight">
                Yêu cầu đăng nhập
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="py-4 text-center">
              <p className="text-muted-foreground text-[16px] leading-relaxed font-medium mb-6">
                Vui lòng đăng nhập để thực hiện hành động này và tận hưởng đầy đủ
                các tính năng của BWL Social.
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer className="mt-8">
              <div className="flex flex-col gap-3 w-full">
                <Button
                  className="w-full h-12 rounded-2xl font-bold text-[16px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onPress={actions.handleLogin}
                >
                  Đăng nhập ngay
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-2xl font-bold text-muted-foreground text-[15px] border-none hover:bg-content2 transition-all"
                  onPress={actions.handleCancel}
                >
                  Để sau
                </Button>
              </div>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </div>
      </AlertDialog.Container>
    </AlertDialog.Root>
  );
}
