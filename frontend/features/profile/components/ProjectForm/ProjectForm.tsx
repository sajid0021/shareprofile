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

import { createProject, getProjectById, updateProject } from "../../services/projectApi";

type ProjectFormValues = {
  title: string;
  description: string;
  technologiesInput: string;
  url: string;
  startDate: string;
  endDate: string;
};

const projectSchema: z.ZodType<ProjectFormValues> = z.object({
  title: z.string().trim().min(2, "Project title is required").max(200, "Title is too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(3000, "Description is too long"),
  technologiesInput: z.string().trim().default(""),
  url: z.string().trim().default(""),
  startDate: z.string().trim().default(""),
  endDate: z.string().trim().default(""),
});

interface ProjectFormProps {
  projectId?: string;
}

export function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState("");
  const isEditing = Boolean(projectId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema as any),
    defaultValues: {
      title: "",
      description: "",
      technologiesInput: "",
      url: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    getProjectById(projectId)
      .then((project) => {
        if (!active) return;

        setValue("title", project.title);
        setValue("description", project.description);
        setValue("technologiesInput", project.technologies?.join(", ") ?? "");
        setValue("url", project.url ?? "");
        setValue("startDate", project.startDate ?? "");
        setValue("endDate", project.endDate ?? "");
      })
      .catch(() => {
        if (active) setSaveError("Unable to load project details.");
      });

    return () => {
      active = false;
    };
  }, [projectId, setValue]);

  const onSubmit = async (data: ProjectFormValues) => {
    setSaveError("");

    const technologies = [...new Set(
      data.technologiesInput
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean)
        .map((technology) => technology.toLowerCase())
        .map((technology) => technology.charAt(0).toUpperCase() + technology.slice(1)),
    )];

    if (technologies.length === 0) {
      setSaveError("Add at least one technology.");
      return;
    }

    const trimmedUrl = data.url.trim();

    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setSaveError("Project URL must start with http:// or https://");
      return;
    }

    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        technologies,
        url: trimmedUrl,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      if (isEditing && projectId) {
        await updateProject(projectId, payload);
      } else {
        await createProject(payload);
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save project.");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1D2226]">
          {isEditing ? "Edit Project" : "Add Project"}
        </h1>

        <p className="mt-1 text-sm text-[#666666]">
          {isEditing ? "Update your project information." : "Showcase your work and professional projects."}
        </p>
      </div>

      {saveError ? <p className="mb-4 text-sm text-[#CC1016]">{saveError}</p> : null}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Project Title</label>
          <Input {...register("title")} placeholder="Portfolio Website" />
          {errors.title ? <p className="mt-1 text-sm text-red-600">{errors.title.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Description</label>
          <textarea
            {...register("description")}
            rows={6}
            placeholder="Describe the project, your role, and impact."
            className="w-full rounded-md border border-[#D9DDE1] bg-white p-3 text-sm outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
          />
          {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Technologies</label>
          <Input {...register("technologiesInput")} placeholder="React.js, Next.js, Node.js" />
          <p className="mt-1 text-xs text-[#666666]">Separate technologies with commas.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1D2226]">Project URL</label>
          <Input {...register("url")} placeholder="https://example.com" />
          {errors.url ? <p className="mt-1 text-sm text-red-600">{errors.url.message}</p> : null}
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

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Project" : "Save Project"}
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
