"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useResumeData } from "@/features/resume/hooks/useResumeData";
import type { Education, Experience, Project } from "@/features/profile/types/profile.types";

function formatMonthYear(dateValue?: string) {
  if (!dateValue) return "";

  const [year, month] = dateValue.split("-");
  if (!year || !month) return dateValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#D9DDE1] pt-6">
      <h2 className="text-lg font-semibold text-[#1D2226]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ResumePage() {
  const { user, profile, experiences, education, projects, isLoading, error } = useResumeData();
  const [imageFailed, setImageFailed] = useState(false);

  if (isLoading) return <Card className="p-6 text-sm text-[#666666]">Preparing your resume...</Card>;
  if (error || !profile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[#CC1016]">
          {error instanceof Error ? error.message : "Save your profile before generating a resume."}
        </p>
        <a className="mt-4 inline-flex text-sm font-semibold text-[#0A66C2]" href="/profile/edit">
          Complete your profile
        </a>
      </Card>
    );
  }

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : `${profile.firstName} ${profile.lastName}`;
  const email = user?.email || profile.email;

  return (
    <Card className="resume-document p-8">
      <div className="resume-actions mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {profile.profileImage && !imageFailed ? (
            <Image
              src={profile.profileImage}
              alt={fullName}
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 rounded-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              aria-label="Profile photo unavailable"
              className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E8F3FF] text-2xl font-semibold text-[#0A66C2]"
            >
              {`${fullName.split(" ")[0]?.[0] ?? ""}${fullName.split(" ").slice(-1)[0]?.[0] ?? ""}`.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-[#1D2226]">{fullName}</h1>
            <p className="mt-1 text-lg text-[#0A66C2]">{profile.headline}</p>
            <p className="mt-2 text-sm text-[#666666]">
              {[location, email, profile.phone].filter(Boolean).join(" · ")}
            </p>
            {profile.website ? (
              <a className="mt-1 block text-sm text-[#0A66C2]" href={profile.website}>
                {profile.website}
              </a>
            ) : null}
          </div>
        </div>
        <Button type="button" onClick={() => window.print()}>
          Download / Print PDF
        </Button>
      </div>

      <div className="space-y-6">
        {profile.about ? (
          <Section title="Professional Summary">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#555555]">{profile.about}</p>
          </Section>
        ) : null}

        {experiences.length ? (
          <Section title="Experience">
            <div className="space-y-5">
              {experiences.map((experience: Experience) => (
                <div key={experience.id}>
                  <h3 className="font-semibold text-[#1D2226]">{experience.position}</h3>
                  <p className="text-sm text-[#1D2226]">
                    {experience.company}
                    {experience.location ? ` · ${experience.location}` : ""}
                  </p>
                  <p className="text-sm text-[#666666]">
                    {formatMonthYear(experience.startDate)} -{" "}
                    {experience.current ? "Present" : formatMonthYear(experience.endDate)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555555]">
                    {experience.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {education.length ? (
          <Section title="Education">
            <div className="space-y-5">
              {education.map((item: Education) => (
                <div key={item.id}>
                  <h3 className="font-semibold text-[#1D2226]">{item.degree}</h3>
                  <p className="text-sm text-[#1D2226]">{item.institution}</p>
                  {item.fieldOfStudy ? <p className="text-sm text-[#666666]">{item.fieldOfStudy}</p> : null}
                  {item.startDate || item.endDate ? (
                    <p className="text-sm text-[#666666]">
                      {formatMonthYear(item.startDate)} - {formatMonthYear(item.endDate) || "Present"}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555555]">{item.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            <div className="space-y-5">
              {projects.map((project: Project) => (
                <div key={project.id}>
                  <h3 className="font-semibold text-[#1D2226]">{project.title}</h3>
                  {(project.startDate || project.endDate) ? (
                    <p className="text-sm text-[#666666]">
                      {project.startDate ? formatMonthYear(project.startDate) : ""}
                      {project.startDate && project.endDate ? " - " : ""}
                      {project.endDate ? formatMonthYear(project.endDate) : project.startDate ? "Present" : ""}
                    </p>
                  ) : null}
                  {project.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555555]">
                      {project.description}
                    </p>
                  ) : null}
                  {project.technologies?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <span key={technology} className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-xs text-[#0A66C2]">
                          {technology}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {project.url ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-[#0A66C2] hover:underline">
                      {project.url}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {profile.skills?.length ? (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#E8F3FF] px-3 py-1.5 text-sm text-[#0A66C2]">
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </Card>
  );
}
