import { ExperienceForm } from "@/features/profile/components/ExperienceForm";

export default function EditExperiencePage({ params }: { params: { id: string } }) {
  return <ExperienceForm experienceId={params.id} />;
}
