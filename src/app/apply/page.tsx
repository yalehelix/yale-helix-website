"use client";

import { useState } from "react";
import Link from "next/link";
import { ui } from "../components/ui";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  classYear: string;
  major: string;
  areasOfInterest: string[];
  linkedin: string;
};

type Field = {
  key: keyof FormData;
  label: string;
  required?: boolean;
  kind?: "text" | "url" | "email" | "textarea" | "select" | "checkboxes" | "radio";
  rows?: number;
  placeholder?: string;
  options?: string[];
  help?: string;
  maxSelections?: number;
};

const CLASS_YEARS = ["2027", "2028", "2029", "2030"];

const AREAS_OF_INTEREST = [
  "Business Development",
  "Marketing & Communications",
  "Finance",
  "Operations",
  "Product Management",
  "Software Engineering / Computer Science",
  "Artificial Intelligence / Machine Learning",
  "Data Science / Statistics",
  "Computational Biology / Bioinformatics",
  "Biology / Biomedical Sciences",
  "Biotechnology / Life Sciences",
  "Wet Lab Research",
  "Clinical / Healthcare",
  "Public Health",
  "Policy & Regulatory Affairs",
  "Hardware Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Robotics",
  "CAD / 3D Modeling & Printing",
  "Design / UI/UX",
  "Other",
];

const SECTIONS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "Basic information",
    fields: [
      { key: "firstName", label: "First name", required: true },
      { key: "lastName", label: "Last name", required: true },
      { key: "email", label: "Yale email address", required: true, kind: "email" },
      { key: "classYear", label: "Class year", required: true, kind: "select", placeholder: "Select class year", options: CLASS_YEARS },
      { key: "major", label: "Major / intended major", required: true },
      {
        key: "areasOfInterest",
        label: "Which areas are you most interested in contributing to?",
        help: "Select up to five.",
        required: true,
        kind: "checkboxes",
        options: AREAS_OF_INTEREST,
        maxSelections: 5,
      },
      { key: "linkedin", label: "LinkedIn profile", kind: "url", placeholder: "https://linkedin.com/in/" },
    ],
  },
];

export default function StudentApplicationPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    classYear: "",
    major: "",
    areasOfInterest: [],
    linkedin: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCheckbox = (field: Field, option: string) => {
    setFormData((prev) => {
      const selected = prev[field.key] as string[];
      if (selected.includes(option)) {
        return { ...prev, [field.key]: selected.filter((s) => s !== option) };
      }
      if (field.maxSelections && selected.length >= field.maxSelections) {
        return prev;
      }
      return { ...prev, [field.key]: [...selected, option] };
    });
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.classYear.trim() !== "" &&
      formData.major.trim() !== "" &&
      formData.areasOfInterest.length > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const renderField = (field: Field) => {
    if (field.kind === "checkboxes") {
      const selected = (formData[field.key] as string[]) ?? [];
      return (
        <div key={field.key} className="sm:col-span-2">
          <label className={ui.label}>
            {field.label} {field.required && <span className={ui.required}>*</span>}
          </label>
          {field.help && <p className="mb-3 text-xs text-text-muted">{field.help}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {field.options?.map((opt) => {
              const checked = selected.includes(opt);
              const disabled = !checked && !!field.maxSelections && selected.length >= field.maxSelections;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleCheckbox(field, opt)}
                  disabled={disabled}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    checked
                      ? "border-accent bg-accent-soft text-text"
                      : disabled
                        ? "cursor-not-allowed border-hairline bg-surface text-text-muted/50"
                        : "border-hairline bg-surface text-text-muted hover:border-accent/40"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                      checked ? "border-accent bg-accent text-accent-fg" : "border-hairline"
                    }`}
                  >
                    {checked && <span className="text-[10px] leading-none">✓</span>}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const value = formData[field.key] as string;
    const common = {
      id: field.key,
      name: field.key,
      value,
      onChange: handleChange,
      required: field.required,
    };
    const spanFull = field.kind === "textarea" || field.kind === "select";

    return (
      <div key={field.key} className={spanFull ? "sm:col-span-2" : ""}>
        <label htmlFor={field.key} className={ui.label}>
          {field.label} {field.required && <span className={ui.required}>*</span>}
        </label>
        {field.help && <p className="mb-3 text-xs text-text-muted">{field.help}</p>}
        {field.kind === "textarea" ? (
          <textarea {...common} rows={field.rows ?? 3} className={ui.textarea} />
        ) : field.kind === "select" ? (
          <select {...common} className={ui.select}>
            <option value="">{field.placeholder ?? "Select"}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...common}
            type={field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text"}
            placeholder={field.placeholder}
            className={ui.input}
          />
        )}
      </div>
    );
  };

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <Link href="/" className={ui.returnButton}>
          &larr; Return to homepage
        </Link>

        <div className="mt-12">
          <p className={ui.eyebrow}>Join the future of healthcare innovation</p>
          <h1 className={ui.title}>Yale Helix 2026-2027 fellow application</h1>
          <p className={ui.subtitle}>
            Helix connects Yale students with early-stage startups where they can contribute to real
            projects across biotechnology, healthcare, engineering, software, AI, business, design, and
            more. Our application is designed to learn about both what you can contribute and how you
            approach unfamiliar problems. We care much more about curiosity, initiative, creativity, and
            thoughtful problem-solving than having previous startup experience. Please answer each
            question authentically and pay close attention to the word limits provided.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <div className="mb-6">
                <h2 className={ui.sectionTitle}>{section.title}</h2>
                <div className={ui.sectionRule} />
                {section.note && (
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{section.note}</p>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2">{section.fields.map(renderField)}</div>
            </section>
          ))}

          <div>
            <button type="submit" className={ui.primaryButton} disabled={true}>
              Submit application
            </button>
            <p className={ui.note}>
              This application is still being drafted, more sections are coming soon.
              <br />
              Questions? Contact us at{" "}
              <a href="mailto:admin@yalehelix.org" className={ui.link}>
                admin@yalehelix.org
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
