import type { ReactNode } from "react";

export function GoldDivider() {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#B8975A]/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A]/50" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#B8975A]/30" />
    </div>
  );
}

export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-['Jost'] font-medium px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap"
      style={{
        borderColor: active ? "#B8975A" : "rgba(186,162,138,0.3)",
        background: active ? "#B8975A" : "#fff",
        color: active ? "#fff" : "#8B7B6E",
      }}
    >
      {label}
    </button>
  );
}

export function PageTitle({ eyebrow, title, center }: { eyebrow?: string; title: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27]">{title}</h1>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-[#B8975A]/20 border-t-[#B8975A] animate-spin" />
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-24">
      <p className="font-['Gilda_Display'] text-2xl text-[#3A2E27] mb-3">{title}</p>
      {text && <p className="font-['Jost'] text-[#8B7B6E] mb-6">{text}</p>}
      {action}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: ReactNode }) {
  const styles = {
    info: "bg-[#F0E8DF] text-[#3A2E27]",
    error: "bg-[#F8E0E0] text-[#8A2E2E]",
    success: "bg-[#E4EEDF] text-[#2E5A2E]",
  }[kind];
  return <div className={`rounded-xl px-4 py-3 text-sm font-['Jost'] ${styles}`}>{children}</div>;
}
