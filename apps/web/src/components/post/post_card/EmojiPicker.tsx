import { EMOJIS } from "@/types/gallery";
import { REACTION_MAP } from "@/utils/constants/reactions";

export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
    return (
        <div className="absolute bottom-full pb-3 left-0 z-50">
            <div className="bg-background border rounded-full shadow-xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {EMOJIS.map(e => (
                    <div key={e} className="relative group/emoji">
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-helvetica-neue mb-2 px-2 py-0.5 bg-black/80 text-white text-[14px] rounded pointer-events-none opacity-0 group-hover/emoji:opacity-100 transition-opacity whitespace-nowrap z-[60]">
                            {REACTION_MAP[e]?.label || "Thích"}
                        </div>
                        <button
                            onClick={() => onPick(e)}
                            className="hover:scale-150 cursor-pointer transition-all duration-200 px-1 py-0.5 text-2xl leading-none hover:-translate-y-1 transform-gpu"
                        >
                            {e}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
