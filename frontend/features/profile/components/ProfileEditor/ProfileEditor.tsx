"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { profileSchema, type ProfileFormValues } from "../../schemas/profile.schema";
import { getMyProfile, saveMyProfile } from "../../services/profileApi";
import { getCurrentUser } from "@/features/auth/services/authApi";

const defaultValues: ProfileFormValues = {
  username: "your-username",
  firstName: "",
  lastName: "",
  headline: "",
  about: "",
  city: "",
  state: "",
  country: "India",
  email: "",
  phone: "",
  website: "",
};

export function ProfileEditor() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getMyProfile(), getCurrentUser()])
      .then(([profile, user]) => {
        if (active) reset(profile ?? defaultValues);
        if (active && user) {
          reset({ ...(profile ?? defaultValues), firstName: user.firstName, lastName: user.lastName, email: user.email });
        }
      })
      .catch(() => {
        if (active) setLoadError("Unable to load your profile. Check that the API is running.");
      });
    return () => {
      active = false;
    };
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSaveError("");
    setSaved(false);
    try {
      await saveMyProfile(data);
      setSaved(true);
      router.push("/profile");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1D2226]">Edit Profile</h1>

        <p className="mt-1 text-sm text-[#666666]">
          Keep your professional information up to date.
        </p>
      </div>

      {loadError ? <p className="mb-4 text-sm text-[#CC1016]">{loadError}</p> : null}
      {saveError ? <p className="mb-4 text-sm text-[#CC1016]">{saveError}</p> : null}
      {saved ? <p className="mb-4 text-sm text-[#057642]">Profile saved.</p> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#1D2226]">Basic information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                First name
              </label>

              <Input id="firstName" {...register("firstName")} />

              {errors.firstName ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.firstName.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                Last name
              </label>

              <Input id="lastName" {...register("lastName")} />

              {errors.lastName ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <label htmlFor="username" className="mb-2 block text-sm font-medium">
            Username
          </label>

          <Input id="username" placeholder="your-username" {...register("username")} />

          {errors.username ? (
            <p className="mt-1 text-xs text-[#CC1016]">{errors.username.message}</p>
          ) : null}

          <p className="mt-1 text-xs text-[#666666]">Your public profile will use this username.</p>
        </section>

        <section>
          <label htmlFor="headline" className="mb-2 block text-sm font-medium">
            Professional headline
          </label>

          <Input
            id="headline"
            placeholder="Frontend Developer | React | Next.js"
            {...register("headline")}
          />

          {errors.headline ? (
            <p className="mt-1 text-xs text-[#CC1016]">{errors.headline.message}</p>
          ) : null}
        </section>

        <section>
          <label htmlFor="about" className="mb-2 block text-sm font-medium">
            About
          </label>

          <textarea
            id="about"
            rows={6}
            {...register("about")}
            className="w-full resize-y rounded-md border border-[#D9DDE1] bg-white px-3 py-3 text-sm outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
            placeholder="Write a short professional summary..."
          />

          {errors.about ? (
            <p className="mt-1 text-xs text-[#CC1016]">{errors.about.message}</p>
          ) : null}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#1D2226]">Location</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium">
                City
              </label>

              <Input id="city" {...register("city")} />

              {errors.city ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.city.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium">
                State
              </label>

              <Input id="state" {...register("state")} />

              {errors.state ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.state.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-medium">
                Country
              </label>

              <Input id="country" {...register("country")} />

              {errors.country ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.country.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#1D2226]">Contact</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>

              <Input id="email" type="email" readOnly disabled {...register("email")} />

              {/* Account email belongs to User, so profile editing cannot make them diverge. */}
              <p className="mt-1 text-xs text-[#666666]">
                This is your account email and cannot be changed here.
              </p>

              {errors.email ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <Input id="phone" type="tel" {...register("phone")} />
            </div>

            <div>
              <label htmlFor="website" className="mb-2 block text-sm font-medium">
                Website
              </label>

              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register("website")}
              />

              {errors.website ? (
                <p className="mt-1 text-xs text-[#CC1016]">{errors.website.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-[#D9DDE1] pt-5">
          <Button type="button" variant="ghost" onClick={() => router.push("/profile")}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
