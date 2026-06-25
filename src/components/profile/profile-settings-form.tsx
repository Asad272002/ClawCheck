"use client";

import { Camera, Loader2, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { AppUser } from "@/lib/auth/user";
import { saveRememberedAccount } from "@/lib/auth/remembered-accounts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileSettingsFormProps = {
  currentUser: AppUser;
};

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileSettingsForm({ currentUser }: ProfileSettingsFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const [fullName, setFullName] = useState(currentUser.name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl ?? "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(currentUser.avatarUrl ?? "");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedAvatarLabel, setSelectedAvatarLabel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const hasChanges = fullName.trim() !== currentUser.name || selectedAvatarFile !== null;
  const isBusy = saving || uploadingAvatar;

  const handleAvatarSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!ACCEPTED_AVATAR_TYPES.includes(selectedFile.type)) {
      toast.error("Please choose a PNG, JPG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Please keep the image under 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    previewObjectUrlRef.current = previewUrl;

    setSelectedAvatarFile(selectedFile);
    setSelectedAvatarLabel(selectedFile.name);
    setAvatarPreviewUrl(previewUrl);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const cleanedName = fullName.trim();
      let nextAvatarUrl = avatarUrl.trim();

      if (selectedAvatarFile) {
        setUploadingAvatar(true);

        const avatarPath = `${currentUser.id}/avatar`;
        const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(avatarPath, selectedAvatarFile, {
          cacheControl: "3600",
          contentType: selectedAvatarFile.type,
          upsert: true,
        });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from("profile-avatars").getPublicUrl(avatarPath);
        nextAvatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: cleanedName,
          avatar_url: nextAvatarUrl.length > 0 ? nextAvatarUrl : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      if (profileError) {
        throw profileError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: cleanedName,
          avatar_url: nextAvatarUrl.length > 0 ? nextAvatarUrl : null,
        },
      });

      if (authError) {
        throw authError;
      }

      saveRememberedAccount({
        id: currentUser.id,
        email: currentUser.email,
        name: cleanedName,
        avatarUrl: nextAvatarUrl.length > 0 ? nextAvatarUrl : null,
        providers: currentUser.providers,
      });

      setAvatarUrl(nextAvatarUrl);
      setAvatarPreviewUrl(nextAvatarUrl);
      setSelectedAvatarFile(null);
      setSelectedAvatarLabel(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update your profile.");
    } finally {
      setUploadingAvatar(false);
      setSaving(false);
    }
  };

  return (
    <Card className="section-panel">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Edit profile</CardTitle>
          </div>
          <Badge variant="outline" className="rounded-full border-border bg-background/70">
            Visible across reports
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              {avatarPreviewUrl ? (
                <div
                  aria-label={`${fullName || currentUser.name} avatar`}
                  role="img"
                  className="size-20 rounded-3xl border border-border/70 bg-cover bg-center shadow-sm"
                  style={{ backgroundImage: `url("${avatarPreviewUrl}")` }}
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-3xl bg-foreground text-2xl font-semibold text-background shadow-sm">
                  {(fullName || currentUser.name).charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition hover:bg-accent"
                aria-label="Upload profile image"
                disabled={isBusy}
              >
                {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Profile image</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, WEBP, or GIF up to 5 MB.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
                  <Upload className="size-4" />
                  {selectedAvatarFile ? "Replace image" : "Upload image"}
                </Button>
                {selectedAvatarLabel ? (
                  <Badge variant="outline" className="rounded-full border-border bg-background/70">
                    {selectedAvatarLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(",")}
            className="hidden"
            onChange={handleAvatarSelection}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Asad Khan"
              className="h-11 rounded-2xl px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email address</Label>
            <Input id="profile-email" value={currentUser.email} readOnly className="h-11 rounded-2xl px-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full border-border bg-background/70">
              Account name
            </Badge>
            <Badge variant="outline" className="rounded-full border-border bg-background/70">
              Avatar synced to DB
            </Badge>
          </div>
          <Button type="button" className="rounded-xl" onClick={handleSave} disabled={isBusy || fullName.trim().length < 2 || !hasChanges}>
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
