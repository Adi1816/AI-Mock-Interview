import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#06B6D4",
    colorBackground: "#0F172A",
    colorInputBackground: "rgba(15, 23, 42, 0.9)",
    colorInputText: "#F8FAFC",
    colorText: "#F8FAFC",
    colorTextSecondary: "#CBD5E1",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-slate-900/95 text-white border border-white/10 shadow-2xl",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-300",
    socialButtonsBlockButton: "bg-white/10 border-white/10 text-white hover:bg-white/15",
    formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold",
    formFieldInput: "bg-slate-950/80 border-white/10 text-white focus:border-cyan-400",
    formFieldLabel: "text-slate-200",
    footerActionText: "text-slate-400",
    footerActionLink: "text-cyan-300 hover:text-cyan-200",
    identityPreviewText: "text-white",
    userButtonPopoverCard: "bg-slate-900 text-white border border-white/10 shadow-2xl z-[9999]",
    userButtonPopoverActions: "bg-slate-900",
    userButtonPopoverActionButton: "hover:bg-slate-800 text-slate-100",
    userButtonPopoverFooter: "bg-slate-900",
  },
};
