"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FileUpload from "../components/FileUpload";
import { ui } from "../components/ui";

type FormData = {
  startupName: string;
  contactName: string;
  email: string;
  website: string;
  linkedin: string;
  startupDescription: string;
  primaryProblem: string;
  solution: string;
  currentStage: string;
  targetCustomers: string;
  businessModel: string;
  competitors: string;
  team: string;
  milestoneAchievements: string;
  twelveMonthGoals: string;
  studentRoles: string;
  otherAccelerators: string;
  additionalInfo: string;
  // Mentorship
  mentorWhy: string;
  mentorQualities: string;
  studentDevelopment: string;
  // Students
  fellowCount: string;
  skillSets: string[];
  skillSetsOther: string;
  exampleProjects: string;
  desiredSkills: string;
  involvementLevel: string;
  pitchDeck: string;
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
};

const SKILL_SETS = [
  "Business Development",
  "Marketing & Communications",
  "Finance",
  "Operations",
  "Product Management",
  "Software Engineering",
  "Artificial Intelligence / Machine Learning",
  "Data Science",
  "Computational Biology / Bioinformatics",
  "Wet Lab Research",
  "Biotechnology / Life Sciences",
  "Robotics",
  "Hardware Engineering",
  "Design / UX",
  "Public Health",
  "Policy & Regulatory Affairs",
];

const INVOLVEMENT_LEVELS = [
  "Primarily observational / learning",
  "Contributing to defined projects",
  "Taking ownership of specific initiatives",
  "Integrated as part of the core team",
];

const SECTIONS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "Basic information",
    fields: [
      { key: "startupName", label: "Startup name", required: true },
      { key: "contactName", label: "Primary contact name", required: true },
      { key: "email", label: "Email address", required: true, kind: "email" },
      { key: "website", label: "Startup website", kind: "url", placeholder: "https://" },
      { key: "linkedin", label: "LinkedIn profile", kind: "url", placeholder: "https://linkedin.com/in/" },
    ],
  },
  {
    title: "Startup information",
    fields: [
      { key: "startupDescription", label: "Describe your startup in one sentence", required: true, kind: "textarea", rows: 3 },
      { key: "primaryProblem", label: "What is the primary problem your startup aims to solve?", required: true, kind: "textarea", rows: 4 },
      { key: "solution", label: "Describe your solution and how it is unique", required: true, kind: "textarea", rows: 4 },
      { key: "currentStage", label: "Current stage", required: true, kind: "select", placeholder: "Select stage", options: ["Idea", "MVP", "Early Revenue", "Growth"] },
      { key: "targetCustomers", label: "Who are your target customers?", required: true, kind: "textarea", rows: 3 },
      { key: "businessModel", label: "Briefly describe your business model", required: true, kind: "textarea", rows: 3 },
    ],
  },
  {
    title: "Team information",
    fields: [
      { key: "team", label: "List the names, roles, and brief bios of your team members", required: true, kind: "textarea", rows: 6 },
    ],
  },
  {
    title: "Progress and goals",
    fields: [
      { key: "milestoneAchievements", label: "What milestones have you achieved so far?", required: true, kind: "textarea", rows: 4 },
      { key: "twelveMonthGoals", label: "What are your key goals for the next 6-12 months, and how can Helix help?", required: true, kind: "textarea", rows: 4 },
    ],
  },
  {
    title: "Mentorship",
    fields: [
      { key: "mentorWhy", label: "Why are you interested in mentoring Yale students through Helix?", required: true, kind: "textarea", rows: 4 },
      { key: "mentorQualities", label: "What qualities or experiences make members of your team effective mentors?", required: true, kind: "textarea", rows: 4 },
      { key: "studentDevelopment", label: "How do you envision students contributing to your startup, and how will you support their professional development?", required: true, kind: "textarea", rows: 4 },
    ],
  },
  {
    title: "Students",
    note: "The following questions are intended only to help Helix understand your startup's potential needs and identify students who may be a strong fit. Responses are non-binding and may change throughout the program.",
    fields: [
      { key: "fellowCount", label: "Approximately how many student fellows could your startup effectively support during the program?", help: "A range of 2-5 is typical.", required: true, kind: "select", placeholder: "Select a number", options: ["2", "3", "4", "5"] },
      { key: "skillSets", label: "Which student skill sets or backgrounds would be most valuable to your startup?", help: "Select all that apply.", required: true, kind: "checkboxes", options: SKILL_SETS },
      { key: "skillSetsOther", label: "Other skill sets", help: "Optional.", kind: "text", placeholder: "Anything not listed above" },
      { key: "exampleProjects", label: "What are some example projects or tasks students might work on?", help: "Examples: market research, customer discovery, software development, fundraising research, laboratory experiments, data analysis, partnership outreach, product design, regulatory research.", required: true, kind: "textarea", rows: 4 },
      { key: "desiredSkills", label: "Are there any specific skills, coursework, or experiences you would ideally like students to possess?", help: "Optional.", kind: "textarea", rows: 3 },
      { key: "involvementLevel", label: "How involved would you expect students to be in your startup's operations?", required: true, kind: "radio", options: INVOLVEMENT_LEVELS },
    ],
  },
  {
    title: "Additional information",
    fields: [
      { key: "otherAccelerators", label: "Have you participated in any other incubators or accelerators?", kind: "textarea", rows: 3 },
      { key: "additionalInfo", label: "Any additional information you would like to share?", kind: "textarea", rows: 4 },
    ],
  },
];

export default function StartupApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    startupName: "",
    contactName: "",
    email: "",
    website: "",
    linkedin: "",
    startupDescription: "",
    primaryProblem: "",
    solution: "",
    currentStage: "",
    targetCustomers: "",
    businessModel: "",
    competitors: "",
    team: "",
    milestoneAchievements: "",
    twelveMonthGoals: "",
    studentRoles: "",
    otherAccelerators: "",
    additionalInfo: "",
    mentorWhy: "",
    mentorQualities: "",
    studentDevelopment: "",
    fellowCount: "",
    skillSets: [],
    skillSetsOther: "",
    exampleProjects: "",
    desiredSkills: "",
    involvementLevel: "",
    pitchDeck: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileUploaded, setCurrentFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      skillSets: prev.skillSets.includes(option)
        ? prev.skillSets.filter((s) => s !== option)
        : [...prev.skillSets, option],
    }));
  };

  // Function to check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.startupName.trim() !== "" &&
      formData.contactName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.startupDescription.trim() !== "" &&
      formData.primaryProblem.trim() !== "" &&
      formData.solution.trim() !== "" &&
      formData.currentStage.trim() !== "" &&
      formData.targetCustomers.trim() !== "" &&
      formData.businessModel.trim() !== "" &&
      formData.team.trim() !== "" &&
      formData.milestoneAchievements.trim() !== "" &&
      formData.twelveMonthGoals.trim() !== "" &&
      formData.mentorWhy.trim() !== "" &&
      formData.mentorQualities.trim() !== "" &&
      formData.studentDevelopment.trim() !== "" &&
      formData.fellowCount.trim() !== "" &&
      formData.skillSets.length > 0 &&
      formData.exampleProjects.trim() !== "" &&
      formData.involvementLevel.trim() !== "" &&
      (selectedFile || formData.pitchDeck) // Either a file is selected or already uploaded
    );
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Validate file size (4MB for pitch deck)
      const maxSizeMB = 4;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Validate file type (PDF only for pitch deck)
      const acceptedTypes = [".pdf"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        alert(`File type not supported. Accepted types: ${acceptedTypes.join(", ")}`);
        return;
      }

      setSelectedFile(file);
      setCurrentFileUploaded(false);
      setFormData((prev) => ({ ...prev, pitchDeck: "" }));
    } else {
      setSelectedFile(null);
      setCurrentFileUploaded(false);
      setFormData((prev) => ({ ...prev, pitchDeck: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, submit the Google form with the current form data.
      const pitchDeckForForm =
        selectedFile && !currentFileUploaded
          ? `File selected: ${selectedFile.name} (will be uploaded after form submission)`
          : formData.pitchDeck;

      submitFormToGoogle(pitchDeckForForm);

      // Now handle file upload if needed
      if (selectedFile && !currentFileUploaded) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", selectedFile);
          uploadFormData.append("fileName", selectedFile.name);
          uploadFormData.append("fileType", selectedFile.type);
          uploadFormData.append("folderName", `${formData.startupName} - ${formData.contactName}`);

          const uploadResponse = await fetch("/api/apply-startup/upload-startup", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("File upload failed");
          }

          const uploadResult = await uploadResponse.json();
          setFormData((prev) => ({ ...prev, pitchDeck: uploadResult.driveLink }));
          setCurrentFileUploaded(true);
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`File upload failed: ${errorMessage}`);
        }
      }

      setIsSubmitting(false);
      router.push("/apply-startups/success");
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      alert("There was an error submitting your application. Please try again.");
    }
  };

  const submitFormToGoogle = (pitchDeckLink: string) => {
    // Submit Google form in the background using an iframe to prevent page redirect
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = "google-form-submit";

    const form = document.createElement("form");
    form.method = "POST";
    form.action =
      "https://docs.google.com/forms/d/e/1FAIpQLSeTs-mkFf0y6AVKzVyg2Qx8eG4azWX_oC3GGRsNNtMYsagExQ/formResponse";
    form.target = "google-form-submit"; // Target the hidden iframe

    // NOTE: The Mentorship and Students questions are collected here but are not yet
    // mapped to Google Form entry IDs. Add the matching questions to the Google Form
    // and wire their entry.<id>s below (skillSets is multi-value: append one input per item).
    const fields = [
      { name: "entry.171789341", value: formData.startupName },
      { name: "entry.359504525", value: formData.contactName },
      { name: "entry.58582101", value: formData.email },
      { name: "entry.883030032", value: formData.website },
      { name: "entry.23302701", value: formData.linkedin },
      { name: "entry.1655775433", value: formData.startupDescription },
      { name: "entry.1777513500", value: formData.primaryProblem },
      { name: "entry.99637537", value: formData.solution },
      { name: "entry.1158341576", value: formData.currentStage },
      { name: "entry.1667235498", value: formData.targetCustomers },
      { name: "entry.298457997", value: formData.businessModel },
      { name: "entry.1684025098", value: formData.team },
      { name: "entry.1602431770", value: formData.milestoneAchievements },
      { name: "entry.2119814287", value: formData.twelveMonthGoals },
      { name: "entry.1080397699", value: formData.otherAccelerators },
      { name: "entry.1770175107", value: formData.additionalInfo },
      { name: "entry.639898116", value: pitchDeckLink },
    ];

    fields.forEach((field) => {
      if (field.value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
      }
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      if (document.body.contains(form)) document.body.removeChild(form);
    }, 1000);
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
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleSkill(opt)}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    checked
                      ? "border-accent bg-accent-soft text-text"
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

    if (field.kind === "radio") {
      const value = formData[field.key] as string;
      return (
        <div key={field.key} className="sm:col-span-2">
          <label className={ui.label}>
            {field.label} {field.required && <span className={ui.required}>*</span>}
          </label>
          {field.help && <p className="mb-3 text-xs text-text-muted">{field.help}</p>}
          <div className="grid gap-2">
            {field.options?.map((opt) => {
              const checked = value === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setFormData((prev) => ({ ...prev, [field.key]: opt }))}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    checked
                      ? "border-accent bg-accent-soft text-text"
                      : "border-hairline bg-surface text-text-muted hover:border-accent/40"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      checked ? "border-accent" : "border-hairline"
                    }`}
                  >
                    {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
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
          <h1 className={ui.title}>Startup application 2026-2027</h1>
          <p className={ui.subtitle}>
            Are you a founder in healthcare, digital health, or biotech ready to fast-track your
            growth? We invite startups at any stage to apply, particularly those connected to the
            Yale and New Haven community, including Yale alumni, graduate, and undergraduate students.
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

          <section>
            <div className="mb-6">
              <h2 className={ui.sectionTitle}>Pitch deck</h2>
              <div className={ui.sectionRule} />
            </div>
            <FileUpload
              onUploadComplete={(driveLink) => {
                setFormData((prev) => ({ ...prev, pitchDeck: driveLink }));
                setCurrentFileUploaded(true);
              }}
              onFileSelect={handleFileSelect}
              acceptedFileTypes={[".pdf"]}
              maxFileSize={4}
              label="Upload pitch deck"
              required={true}
              placeholder="Drag and drop your pitch deck here, or click to browse"
              uploadEndpoint="/api/apply-startup/upload-startup"
              autoUpload={false}
            />
          </section>

          <div>
            <button type="submit" className={ui.primaryButton} disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className={ui.spinner} />
                  {selectedFile && !currentFileUploaded
                    ? "Submitting form and uploading file"
                    : "Submitting application"}
                </>
              ) : (
                "Submit application"
              )}
            </button>
            <p className={ui.note}>
              {isSubmitting
                ? "Please wait while we submit your form and upload your file."
                : !isFormValid()
                  ? "Please fill in all required fields and upload your pitch deck to submit your application."
                  : "Your form will be submitted first, then your file is uploaded to Google Drive."}
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
