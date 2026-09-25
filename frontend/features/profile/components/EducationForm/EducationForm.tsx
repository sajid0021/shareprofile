"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
const educationSchema = z.object({
  institution: z
    .string()
    .min(2, "Institution / university is required")
    .max(200, "Institution name is too long"),

  degree: z.string().min(2, "Degree is required").max(150, "Degree is too long"),

  fieldOfStudy: z.string().max(150, "Field of study is too long").optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  description: z.string().max(3000, "Description cannot exceed 3000 characters").optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

export function EducationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const onSubmit = (data: EducationFormValues) => {
    // Backend integration will be added after the frontend form is verified.
    console.log("Education:", data);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1D2226]">Add Education</h1>

        <p className="mt-1 text-sm text-[#666666]">Add your academic background.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">
            Institution / University
          </label>

          <Input {...register("institution")} placeholder="e.g. Aditya Degree and PG College" />

          {errors.institution && (
            <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Degree</label>

          <Input {...register("degree")} placeholder="e.g. Master of Computer Applications" />

          {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Field of Study</label>

          <Input {...register("fieldOfStudy")} placeholder="e.g. Computer Science" />

          {errors.fieldOfStudy && (
            <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy.message}</p>
          )}
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

          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit">Save Education</Button>

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
