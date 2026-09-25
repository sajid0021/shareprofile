"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import type { ProfileFormValues } from "../../schemas/profile.schema";
import { deleteEducation, getMyEducation } from "../../services/educationApi";
import { deleteExperience, getMyExperiences } from "../../services/experienceApi";
import { getMyProfile, saveMyProfileImage } from "../../services/profileApi";
import { deleteProject, getMyProjects } from "../../services/projectApi";
import type { Education, Experience, Project } from "../../types/profile.types";

function getInitials(
  profile: ProfileFormValues | null,
  user: { firstName: string; lastName: string } | null,
) {
  const firstInitial = user?.firstName?.trim().charAt(0) ?? profile?.firstName?.trim().charAt(0) ?? "";
  const lastInitial = user?.lastName?.trim().charAt(0) ?? profile?.lastName?.trim().charAt(0) ?? "";

  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

function formatMonthYear(dateValue?: string) {
  if (!dateValue) {
    return "";
  }

  const [year, month] = dateValue.split("-");

  if (!year || !month) {
    return dateValue;
  }

  const parsedDate = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function ProfileOverview() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const experiencesQuery = useQuery({
    queryKey: ["experiences"],
    queryFn: getMyExperiences,
  });

  const educationQuery = useQuery({
    queryKey: ["education"],
    queryFn: getMyEducation,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getMyProjects,
  });

  const profile = profileQuery.data ?? null;
  const experiences = experiencesQuery.data ?? [];
  const education = educationQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const isLoading =
    profileQuery.isLoading || experiencesQuery.isLoading || educationQuery.isLoading || projectsQuery.isLoading;

  const error = profileQuery.isError
    ? profileQuery.error instanceof Error
      ? profileQuery.error.message
      : "Unable to load your profile."
    : "";
  const experienceError = experiencesQuery.isError
    ? experiencesQuery.error instanceof Error
      ? experiencesQuery.error.message
      : "Unable to load experience."
    : "";
  const educationError = educationQuery.isError
    ? educationQuery.error instanceof Error
      ? educationQuery.error.message
      : "Unable to load education."
    : "";
  const projectsError = projectsQuery.isError
    ? projectsQuery.error instanceof Error
      ? projectsQuery.error.message
      : "Unable to load projects."
    : "";

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
      queryClient.setQueryData(["profile"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (uploadError) {
      setImageError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!window.confirm("Delete experience? This action cannot be undone.")) return;

    try {
      await deleteExperience(experienceId);
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Unable to delete experience.");
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    if (!window.confirm("Delete education? This action cannot be undone.")) return;

    try {
      await deleteEducation(educationId);
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Unable to delete education.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Delete project? This action cannot be undone.")) return;

    try {
      await deleteProject(projectId);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Unable to delete project.");
    }
  };

  const hasProfile = Boolean(profile);
  const hasExperiences = experiences.length > 0;
  const hasEducation = education.length > 0;
  const hasProjects = projects.length > 0;
  const skills = profile?.skills ?? [];
  const hasSkills = skills.length > 0;

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : profile && `${profile.firstName} ${profile.lastName}`.trim();

  const location = profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : null;

  return (
    <div className="space-y-5">
      {isLoading ? <Card className="p-6 text-sm text-[#666666]">Loading your profile...</Card> : null}
      {error ? <Card className="p-6 text-sm text-[#CC1016]">{error}</Card> : null}

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

        {experienceError ? <p className="mt-4 text-sm text-[#CC1016]">{experienceError}</p> : null}

        {!hasExperiences ? (
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
        ) : (
          <div className="mt-5 space-y-5">
            {experiences.map((experience: Experience) => {
              const startDate = formatMonthYear(experience.startDate);
              const endDate = experience.current ? "Present" : formatMonthYear(experience.endDate);

              return (
                <div key={experience.id} className="border-b border-[#E8E6E1] pb-5 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1D2226]">{experience.position}</h3>
                      <p className="mt-1 text-sm text-[#1D2226]">{experience.company}</p>
                      {experience.location ? <p className="mt-1 text-sm text-[#666666]">{experience.location}</p> : null}
                      <p className="mt-1 text-sm text-[#666666]">
                        {startDate} - {endDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/experience/${experience.id}/edit`}
                        aria-label="Edit experience"
                        title="Edit experience"
                        className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        aria-label="Delete experience"
                        title="Delete experience"
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {experience.description ? (
                    <p className="mt-3 text-sm leading-6 text-[#555555]">{experience.description}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

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

        {educationError ? <p className="mt-4 text-sm text-[#CC1016]">{educationError}</p> : null}

        {!hasEducation ? (
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
        ) : (
          <div className="mt-5 space-y-5">
            {education.map((item: Education) => {
              const startDate = item.startDate ? formatMonthYear(item.startDate) : "";
              const endDate = item.endDate ? formatMonthYear(item.endDate) : "Present";

              return (
                <div key={item.id} className="border-b border-[#E8E6E1] pb-5 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1D2226]">{item.degree}</h3>
                      <p className="mt-1 text-sm text-[#1D2226]">{item.institution}</p>
                      {item.fieldOfStudy ? <p className="mt-1 text-sm text-[#666666]">{item.fieldOfStudy}</p> : null}
                      {(startDate || endDate) ? (
                        <p className="mt-1 text-sm text-[#666666]">
                          {startDate}
                          {startDate && endDate ? " - " : ""}
                          {endDate}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/education/${item.id}/edit`}
                        aria-label="Edit education"
                        title="Edit education"
                        className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        aria-label="Delete education"
                        title="Delete education"
                        onClick={() => handleDeleteEducation(item.id)}
                        className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.description ? (
                    <p className="mt-3 text-sm leading-6 text-[#555555]">{item.description}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

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

        {!hasSkills ? (
          <div className="mt-5 rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
            <h3 className="text-sm font-semibold text-[#1D2226]">No skills added yet</h3>
            <p className="mt-1 text-sm text-[#666666]">Add relevant skills so people can understand your expertise.</p>
            <Link
              href="/profile/skills"
              className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
            >
              Add skills
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill: string) => (
              <span key={skill} className="inline-flex items-center rounded-full bg-[#E8F3FF] px-3 py-2 text-sm font-medium text-[#0A66C2]">
                {skill}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1D2226]">Projects</h2>
            <p className="mt-1 text-sm text-[#666666]">Your recent work and case studies</p>
          </div>

          <Link
            href="/profile/projects/new"
            aria-label="Add Project"
            className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        {projectsError ? <p className="mt-4 text-sm text-[#CC1016]">{projectsError}</p> : null}

        {!hasProjects ? (
          <div className="mt-5 rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
            <h3 className="text-sm font-semibold text-[#1D2226]">No projects added yet</h3>
            <p className="mt-1 text-sm text-[#666666]">Add projects to showcase your work.</p>
            <Link
              href="/profile/projects/new"
              className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2] hover:underline"
            >
              Add project
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {projects.map((project: Project) => (
              <div key={project.id} className="border-b border-[#E8E6E1] pb-5 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D2226]">{project.title}</h3>
                    {(project.startDate || project.endDate) ? (
                      <p className="mt-1 text-sm text-[#666666]">
                        {project.startDate ? formatMonthYear(project.startDate) : ""}
                        {project.startDate && project.endDate ? " - " : ""}
                        {project.endDate ? formatMonthYear(project.endDate) : project.startDate ? "Present" : ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/projects/${project.id}/edit`}
                      aria-label="Edit project"
                      title="Edit project"
                      className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      aria-label="Delete project"
                      title="Delete project"
                      onClick={() => handleDeleteProject(project.id)}
                      className="rounded-full p-2 text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {project.description ? <p className="mt-3 text-sm leading-6 text-[#555555]">{project.description}</p> : null}

                {project.technologies?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span key={technology} className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-xs font-medium text-[#0A66C2]">
                        {technology}
                      </span>
                    ))}
                  </div>
                ) : null}

                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-sm font-medium text-[#0A66C2] hover:underline"
                  >
                    {project.url}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

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
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0A66C2] hover:underline">
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
