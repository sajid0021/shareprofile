import { ProjectForm } from "@/features/profile/components/ProjectForm/ProjectForm";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return <ProjectForm projectId={params.id} />;
}
