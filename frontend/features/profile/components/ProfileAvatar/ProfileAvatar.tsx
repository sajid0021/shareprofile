"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { getInitials, useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import { getMyProfile, saveMyProfileImage } from "../../services/profileApi";

interface ProfileAvatarProps {
  className: string;
  textClassName: string;
  allowUpload?: boolean;
  label?: string;
}

export function ProfileAvatar({
  className,
  textClassName,
  allowUpload = false,
  label = "Upload profile photo",
}: ProfileAvatarProps) {
  const user = useCurrentUser();
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyProfile()
      .then((profile) => setImage(profile?.profileImage || ""))
      .catch(() => undefined);
  }, []);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return;
    if (file.size > 2 * 1024 * 1024) return;

    setIsUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read image."));
        reader.readAsDataURL(file);
      });
      const profile = await saveMyProfileImage(dataUrl);
      setImage(profile.profileImage || dataUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const avatar = image ? (
    <Image src={image} alt="Your profile" fill unoptimized className="object-cover" />
  ) : (
    <span className={textClassName}>{getInitials(user)}</span>
  );

  if (!allowUpload) {
    return <div className={`relative overflow-hidden rounded-full ${className}`}>{avatar}</div>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label={label}
        className={`group relative overflow-hidden rounded-full ${className}`}
      >
        {avatar}
        <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100">
          {isUploading ? "Uploading" : "Upload"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
