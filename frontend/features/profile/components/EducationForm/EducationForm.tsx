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

import { createEducation, getEducationById, updateEducation } from "../../services/educationApi";

type EducationFormValues = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
};

const educationSchema: z.ZodType<EducationFormValues> = z.object({
  institution: z.string().trim().min(2, "Institution / university is required").max(200, "Institution name is too long"),
  degree: z.string().trim().min(2, "Degree is required").max(150, "Degree is too long"),
  fieldOfStudy: z.string().trim().max(150, "Field of study is too long").default(""),
  startDate: z.string().trim().default(""),
  endDate: z.string().trim().default(""),
  description: z.string().trim().max(3000, "Description cannot exceed 3000 characters").default(""),
});

interface EducationFormProps {
  educationId?: string;
}

export function EducationForm({ educationId }: EducationFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState("");
  const isEditing = Boolean(educationId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema as any),
    defaultValues: {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!educationId) return;

    let active = true;

    getEducationById(educationId)
      .then((education) => {
        if (!active) return;
        setValue("institution", education.institution);
        setValue("degree", education.degree);
        setValue("fieldOfStudy", education.fieldOfStudy ?? "");
        setValue("startDate", education.startDate ?? "");
        setValue("endDate", education.endDate ?? "");
        setValue("description", education.description ?? "");
      })
      .catch(() => {
        if (active) setSaveError("Unable to load education details.");
      });

    return () => {
      active = false;
    };
  }, [educationId, setValue]);

  const onSubmit = async (data: EducationFormValues) => {
    setSaveError("");

    try {
      const payload = {
        ...data,
        fieldOfStudy: data.fieldOfStudy || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        description: data.description || "",
      };

      if (isEditing && educationId) {
        await updateEducation(educationId, payload);
      } else {
        await createEducation(payload);
      }

      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save education.");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1D2226]">
          {isEditing ? "Edit Education" : "Add Education"}
        </h1>

        <p className="mt-1 text-sm text-[#666666]">
          {isEditing ? "Update your academic background." : "Add your academic background."}
        </p>
      </div>

      {saveError ? <p className="mb-4 text-sm text-[#CC1016]">{saveError}</p> : null}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Institution / University</label>
          <Input {...register("institution")} placeholder="e.g. Aditya Degree and PG College" />
          {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Degree</label>
          <Input {...register("degree")} placeholder="e.g. Master of Computer Applications" />
          {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Field of Study</label>
          <Input {...register("fieldOfStudy")} placeholder="e.g. Computer Science" />
          {errors.fieldOfStudy && <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1D2226]">Start Date</label>
            <Input type="month" {...register("startDate")} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1D2226]">End Date</label>
            <Input type="month" {...register("endDate")} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Description</label>
          <textarea
            {...register("description")}
            rows={6}
            placeholder="Describe your studies, achievements, activities, projects..."
            className="w-full rounded-md border border-[#D9DDE1] bg-white p-3 text-sm text-[#1D2226] outline-none transition focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Education"}
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
