"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { skillSchema, type SkillFormValues } from "../../schemas/skills.schema";

interface SkillsFormProps {
  initialSkills?: string[];
  onSave?: (skills: string[]) => void | Promise<void>;
}

export function SkillsForm({ initialSkills = [], onSave }: SkillsFormProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [saveError, setSaveError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill: "",
    },
  });

  const addSkill = () => {
    const value = getValues("skill").trim();

    if (value.length < 2) {
      setError("skill", {
        type: "manual",
        message: "Skill must contain at least 2 characters",
      });

      return;
    }

    const exists = skills.some((item) => item.toLowerCase() === value.toLowerCase());

    if (exists) {
      setError("skill", {
        type: "manual",
        message: "This skill has already been added",
      });

      return;
    }

    clearErrors("skill");

    setSkills((current) => [...current, value]);
    reset({ skill: "" });
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((current) => current.filter((skill) => skill !== skillToRemove));
  };

  const submitSkills = async () => {
    setSaveError("");

    try {
      await onSave?.(skills);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save skills.");
    }
  };

  const cancelChanges = () => {
    setSkills(initialSkills);
    reset({ skill: "" });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1D2226]">Skills</h2>

        <p className="mt-1 text-sm text-[#666666]">
          Add the professional skills you want to display on your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit(submitSkills)} className="space-y-6">
        {saveError ? <p className="text-sm text-[#CC1016]">{saveError}</p> : null}

        <div>
          <label htmlFor="skill" className="mb-2 block text-sm font-semibold text-[#1D2226]">
            Skill
          </label>

          <div className="flex gap-3">
            <Input
              id="skill"
              placeholder="e.g. React.js"
              {...register("skill")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSkill();
                }
              }}
            />

            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>

          {errors.skill ? (
            <p className="mt-2 text-sm text-[#CC1016]">{errors.skill.message}</p>
          ) : null}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#1D2226]">Your Skills</h3>

          {skills.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#D9DDE1] p-6 text-center">
              <p className="text-sm text-[#666666]">No skills added yet.</p>

              <p className="mt-1 text-xs text-[#8A8D91]">Add your first professional skill.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E8F3FF] px-3 py-2 text-sm font-medium text-[#0A66C2]"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="rounded-full p-0.5 hover:bg-[#D9EFFF]"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#D9DDE1] pt-5">
          <Button type="button" variant="secondary" onClick={cancelChanges}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Skills"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
