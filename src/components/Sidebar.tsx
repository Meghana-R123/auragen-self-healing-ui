
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Overview",
    href: "/",
    icon: "▦",
  },
  {
    label: "Financial Application",
    href: "/application",
    icon: "▤",
  },
  {
    label: "Adaptive UI Studio",
    href: "/adaptive-ui",
    icon: "◇",
  },
  {
    label: "Interaction Monitor",
    href: "/interaction-monitor",
    icon: "⌁",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-[#0c1426] px-5 py-7">
      <Link href="/" className="mb-10 block">
        <h1 className="text-2xl font-bold tracking-wide text-indigo-400">
          AuraGen
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Adaptive Intelligence
        </p>
      </Link>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Workspace
      </p>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-indigo-500/15 font-medium text-indigo-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-lg">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
        <p className="text-sm font-medium text-indigo-300">
          AuraGen Engine
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Cognitive-load-aware interface adaptation.
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Engine available
        </div>
      </div>
    </aside>
  );
}
