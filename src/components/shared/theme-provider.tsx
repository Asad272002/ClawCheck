"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useMemo } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scriptProps = useMemo(
    () => (typeof window === "undefined" ? undefined : ({ type: "application/json" } as const)),
    []
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
