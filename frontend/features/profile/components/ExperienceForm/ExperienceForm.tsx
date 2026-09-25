"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { createExperience, getExperienceById, updateExperience } from "../../services/experienceApi";

type ExperienceFormValues = {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

const experienceSchema: z.ZodType<ExperienceFormValues> = z
  .object({
    company: z.string().trim().min(2, "Company name is required").max(150, "Company name is too long"),
    position: z.string().trim().min(2, "Position is required").max(150, "Position is too long"),
    location: z.string().trim().max(150, "Location is too long").default(""),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().default(""),
    current: z.boolean().default(false),
    description: z.string().trim().min(10, "Description must contain at least 10 characters").max(3000, "Description is too long"),
  })
  .refine((data) => data.current || Boolean(data.endDate), {
    message: "End date is required",
    path: ["endDate"],
  });

interface ExperienceFormProps {
  experienceId?: string;
}

export function ExperienceForm({ experienceId }: ExperienceFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState("");
  const isEditing = Boolean(experienceId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema as any),
    defaultValues: {
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  });

  useEffect(() => {
    if (!experienceId) return;

    let active = true;

    getExperienceById(experienceId)
      .then((experience) => {
        if (!active) return;
        setValue("company", experience.company);
        setValue("position", experience.position);
        setValue("location", experience.location ?? "");
        setValue("startDate", experience.startDate);
        setValue("endDate", experience.endDate ?? "");
        setValue("current", Boolean(experience.current));
        setValue("description", experience.description);
      })
      .catch(() => {
        if (active) setSaveError("Unable to load experience details.");
      });

    return () => {
      active = false;
    };
  }, [experienceId, setValue]);

  const onSubmit = async (data: ExperienceFormValues) => {
    setSaveError("");

    try {
      const payload = {
        ...data,
        location: data.location || "",
        endDate: data.current ? "" : data.endDate || "",
      };

      if (isEditing && experienceId) {
        await updateExperience(experienceId, payload);
      } else {
        await createExperience(payload);
      }

      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save experience.");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1D2226]">
          {isEditing ? "Edit Experience" : "Add Experience"}
        </h1>

        <p className="mt-1 text-sm text-[#666666]">
          {isEditing ? "Update your professional work experience." : "Add your professional work experience."}
        </p>
      </div>

      {saveError ? <p className="mb-4 text-sm text-[#CC1016]">{saveError}</p> : null}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Company</label>
          <Input {...register("company")} placeholder="Company name" />
          {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Position</label>
          <Input {...register("position")} placeholder="Job title" />
          {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <Input {...register("location")} placeholder="Hyderabad, India" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <Input type="month" {...register("startDate")} />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <Input type="month" {...register("endDate")} />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("current")} />
          I currently work here
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            rows={6}
            placeholder="Describe your responsibilities, achievements and work..."
            className="w-full rounded-md border border-[#D9DDE1] bg-white p-3 text-sm outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Experience"}
          </Button>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-full border border-[#0A66C2] bg-white px-5 py-2 text-sm font-semibold text-[#0A66C2] transition-colors hover:bg-[#E8F3FF]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
