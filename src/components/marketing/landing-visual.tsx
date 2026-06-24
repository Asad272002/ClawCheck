"use client";

import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/shared/scene-background").then((mod) => mod.SceneBackground),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0">
        <div className="absolute left-12 top-10 size-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-12 top-16 size-20 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute inset-x-10 top-12 bottom-10 rounded-[2rem] border border-border/70 bg-white/30 dark:bg-white/4" />
      </div>
    ),
  }
);

export function LandingVisual() {
  return (
    <div className="absolute inset-0 hidden lg:block">
      <SceneBackground />
    </div>
  );
}
