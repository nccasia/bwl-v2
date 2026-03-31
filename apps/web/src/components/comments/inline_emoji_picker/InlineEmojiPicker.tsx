import { EMOJIS } from "@/types/gallery";

export function InlineEmojiPicker({ onPick }: { onPick: (e: string) => void }) {
    return (
        <div className="absolute bottom-full pb-2 left-0 z-50 pointer-events-auto">
            <div className="bg-background border rounded-full shadow-xl p-1.5 flex gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {EMOJIS.map(e => (
                    <button
                        key={e}
                        onClick={() => onPick(e)}
                        className="hover:scale-150 transition-all duration-200 px-1 py-0.5 text-xl leading-none hover:-translate-y-1 transform-gpu"
                    >
                        {e}
                    </button>
                ))}
            </div>
        </div>
    )
}