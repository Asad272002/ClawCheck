"use client";

import { ChevronDown, CircleUserRound, LogOut, Repeat, UserRoundPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import type { AppUser } from "@/lib/auth/user";
import { saveRememberedAccount } from "@/lib/auth/remembered-accounts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountMenuProps = {
  currentUser: AppUser;
  triggerClassName: string;
  align?: "start" | "center" | "end";
  label?: string;
};

export function AccountMenu({
  currentUser,
  triggerClassName,
  align = "end",
  label = "Account",
}: AccountMenuProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    saveRememberedAccount({
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      providers: currentUser.providers,
    });
  }, [currentUser]);

  const handleSignOut = async (targetPath: string) => {
    await supabase.auth.signOut();
    router.push(targetPath);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName}>
        {currentUser.avatarUrl ? (
          <span
            aria-label={`${currentUser.name} avatar`}
            className="size-8 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("${currentUser.avatarUrl}")` }}
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
            <CircleUserRound className="size-4" />
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium">{currentUser.name}</span>
          <span className="block text-xs text-muted-foreground">{currentUser.email}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <div className="rounded-2xl border border-border bg-muted/45 p-3">
            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserRoundPen className="size-4" />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSignOut("/login?next=/dashboard&switch=1")}>
          <Repeat className="size-4" />
          Switch account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => handleSignOut("/login")}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
