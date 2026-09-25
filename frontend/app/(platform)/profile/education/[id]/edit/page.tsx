import { EducationForm } from "@/features/profile/components/EducationForm";

export default function EditEducationPage({ params }: { params: { id: string } }) {
  return <EducationForm educationId={params.id} />;
}
