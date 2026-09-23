"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  BriefcaseBusiness,
  ExternalLink,
  Globe2,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import type { ProfileFormValues } from "../../schemas/profile.schema";
import { getMyProfile, saveMyProfileImage } from "../../services/profileApi";

function getInitials(
  profile: ProfileFormValues | null,
  user: { firstName: string; lastName: string } | null,
) {
  const firstInitial = user?.firstName?.trim().charAt(0) ?? profile?.firstName?.trim().charAt(0) ?? "";
  const lastInitial = user?.lastName?.trim().charAt(0) ?? profile?.lastName?.trim().charAt(0) ?? "";

  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

export function ProfileOverview() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((savedProfile) => {
        if (active) setProfile(savedProfile);
      })
      .catch(() => {
        if (active) setError("Unable to load your profile.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImageError("");

    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Profile image must be smaller than 2 MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read image."));
        reader.readAsDataURL(file);
      });
      const updatedProfile = await saveMyProfileImage(image);
      setProfile(updatedProfile);
    } catch (uploadError) {
      setImageError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const hasProfile = Boolean(profile);

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : profile && `${profile.firstName} ${profile.lastName}`.trim();

  const location = profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : null;

  return (
    <div className="space-y-5">
      {isLoading ? <Card className="p-6 text-sm text-[#666666]">Loading your profile...</Card> : null}
      {error ? <Card className="p-6 text-sm text-[#CC1016]">{error}</Card> : null}
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-36 bg-[#0A66C2]" />

        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-16">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#D9DDE1] text-3xl font-semibold text-[#666666]"
                aria-label="Upload profile image"
              >
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt="Your profile"
                    width={128}
                    height={128}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(profile, user)
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {isUploadingImage ? "Uploading..." : "Upload photo"}
                </span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {imageError ? <p className="mt-2 text-sm text-[#CC1016]">{imageError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-full border border-[#0A66C2] bg-white px-5 py-2 text-sm font-semibold text-[#0A66C2] transition-colors hover:bg-[#E8F3FF]"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>

              <Link
                href="/profile/share"
                className="inline-flex items-center justify-center rounded-full bg-[#0A66C2] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-[#1D2226]">{fullName || "Your Name"}</h1>

            <p className="mt-1 text-base text-[#444444]">
              {profile?.headline || "Add your professional headline"}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#666666]">
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              ) : null}

              {user?.email || profile?.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user?.email || profile?.email}
                </span>
              ) : null}

              {profile?.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0A66C2] hover:underline"
                >
                  <Globe2 className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            {!hasProfile ? (
              <p className="mt-4 text-sm text-[#666666]">
                Complete your profile to display your professional information here.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1D2226]">About</h2>

          <Link
            href="/profile/edit"
            aria-label="Edit About"
            className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#555555]">
          {profile?.about || "No professional summary has been added yet."}
        </p>

        {!profile?.about ? (
          <Link
            href="/profile/edit"
            className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
          >
            Add your About section
          </Link>
        ) : null}
      </Card>

      {/* Experience */}
      <Card className="p-6" id="experience">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1D2226]">Experience</h2>

            <p className="mt-1 text-sm text-[#666666]">Your professional work experience</p>
          </div>

          <Link
            href="/profile/experience/new"
            aria-label="Add Experience"
            className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-[#8A8D91]" />

          <h3 className="mt-3 text-sm font-semibold text-[#1D2226]">No experience added yet</h3>

          <p className="mt-1 text-sm text-[#666666]">
            Add your professional experience to strengthen your profile.
          </p>

          <Link
            href="/profile/experience/new"
            className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
          >
            Add experience
          </Link>
        </div>
      </Card>

      {/* Education */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1D2226]">Education</h2>

            <p className="mt-1 text-sm text-[#666666]">Your academic background</p>
          </div>

          <Link
            href="/profile/education/new"
            aria-label="Add Education"
            className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-[#8A8D91]" />

          <h3 className="mt-3 text-sm font-semibold text-[#1D2226]">No education added yet</h3>

          <p className="mt-1 text-sm text-[#666666]">
            Add your educational qualifications to your profile.
          </p>

          <Link
            href="/profile/education/new"
            className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
          >
            Add education
          </Link>
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1D2226]">Skills</h2>

            <p className="mt-1 text-sm text-[#666666]">Technologies and professional skills</p>
          </div>

          <Link
            href="/profile/skills"
            aria-label="Manage Skills"
            className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
          <h3 className="text-sm font-semibold text-[#1D2226]">No skills added yet</h3>

          <p className="mt-1 text-sm text-[#666666]">
            Add relevant skills so people can understand your expertise.
          </p>

          <Link
            href="/profile/skills"
            className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
          >
            Add skills
          </Link>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-[#1D2226]">Contact information</h2>

        <div className="mt-5 space-y-4">
          {profile?.email ? (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#666666]" />

              <div>
                <p className="text-xs text-[#888888]">Email</p>

                <p className="text-sm text-[#1D2226]">{profile.email}</p>
              </div>
            </div>
          ) : null}

          {profile?.phone ? (
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center text-[#666666]">+</div>

              <div>
                <p className="text-xs text-[#888888]">Phone</p>

                <p className="text-sm text-[#1D2226]">{profile.phone}</p>
              </div>
            </div>
          ) : null}

          {profile?.website ? (
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-[#666666]" />

              <div>
                <p className="text-xs text-[#888888]">Website</p>

                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0A66C2] hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            </div>
          ) : null}

          {!profile?.email && !profile?.phone && !profile?.website ? (
            <div className="rounded-md bg-[#F8F9FA] p-4 text-sm text-[#666666]">
              No contact information has been added yet.
            </div>
          ) : null}
        </div>
      </Card>

      {/* Profile action */}
      <div className="flex justify-end">
        <Link
          href="/profile/edit"
          className="inline-flex items-center justify-center rounded-full bg-[#0A66C2] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
        >
          <Button type="button" className="hidden">
            Edit
          </Button>
          <Pencil className="mr-2 h-4 w-4" />
          Update Profile
        </Link>
      </div>
    </div>
  );
}
