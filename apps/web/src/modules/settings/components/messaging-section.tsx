"use client";
import { Card, Chip } from "@heroui/react";
import { MessageSquareOff, MessageSquare } from "lucide-react";
import { useAppearanceSection } from "../hooks";

export const MessagingSection = () => {
  const { state, actions } = useAppearanceSection();
  return (
    <Card className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 border-none mt-6 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">Messaging</h3>
          <p className="text-sm text-zinc-500 font-medium">
            Control your message notifications and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => actions.setMuteAll(!state.muteAll)}
          className="flex flex-col gap-4 bg-zinc-200/50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-700/50 cursor-pointer transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-2xl transition-colors ${state.muteAll ? "bg-red-500 text-white" : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500"}`}
              >
                {state.muteAll ? (
                  <MessageSquareOff size={24} />
                ) : (
                  <MessageSquare size={24} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-base">Mute All Messages</h4>
                <p className="text-xs text-zinc-500 font-medium">
                  Disable all message notifications
                </p>
              </div>
            </div>

            <div
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${state.muteAll ? "bg-red-500" : "bg-zinc-400 dark:bg-zinc-600"}`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${state.muteAll ? "translate-x-7" : "translate-x-0"}`}
              />
            </div>
          </div>
          <div className="mt-2">
            <Chip
              size="sm"
              variant="tertiary"
              className={`font-bold transition-colors ${state.muteAll ? "bg-red-500/10 text-red-500" : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500"}`}
            >
              {state.muteAll ? "Muted" : "Active"}
            </Chip>
          </div>
        </div>
      </div>
    </Card>
  );
};
