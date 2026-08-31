"use client";

import { useState } from "react";
import Link from "next/link";
import { ui } from "../components/ui";
import FileUpload from "../components/FileUpload";

const PROJECT_DESCRIPTION_WORD_LIMIT = 100;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  classYear: string;
  major: string;
  areasOfInterest: string[];
  linkedin: string;
  portfolioLink: string;
  projectDescription: string;
  whyHelix: string;
  skillsExperience: string;
  proudProject: string;
  nomaChallenge: string;
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

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
  wordLimit?: number;
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

type Section = { number: number; title: string; note?: string; fields: Field[] };

const SECTION_BASIC_INFO: Section = {
  number: 1,
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
};

const SECTION_GETTING_TO_KNOW_YOU: Section = {
  number: 3,
  title: "Getting to know you",
  fields: [
    {
      key: "whyHelix",
      label:
        "Why are you interested in joining Yale Helix, and what do you hope to get out of working with an early-stage startup?",
      required: true,
      kind: "textarea",
      rows: 4,
      wordLimit: 100,
    },
    {
      key: "skillsExperience",
      label: "What skills, experiences, or perspectives would you bring to a Helix startup team?",
      help: "You may draw from coursework, research, previous jobs or internships, student organizations, independent projects, or experiences outside of Yale.",
      required: true,
      kind: "textarea",
      rows: 4,
      wordLimit: 100,
    },
    {
      key: "proudProject",
      label:
        "Tell us about something you've built, improved, researched, organized, or helped solve that you're proud of. What was your specific contribution?",
      help: "This does not need to be related to startups or entrepreneurship.",
      required: true,
      kind: "textarea",
      rows: 5,
      wordLimit: 150,
    },
  ],
};

const FIELD_SECTIONS: Section[] = [SECTION_BASIC_INFO, SECTION_GETTING_TO_KNOW_YOU];

const PROJECT_FILE_TYPES = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".zip"];
const NOMA_CHALLENGE_WORD_LIMIT = 300;

export default function StudentApplicationPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    classYear: "",
    major: "",
    areasOfInterest: [],
    linkedin: "",
    portfolioLink: "",
    projectDescription: "",
    whyHelix: "",
    skillsExperience: "",
    proudProject: "",
    nomaChallenge: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);

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

  const isProjectDescriptionRequired =
    formData.portfolioLink.trim() !== "" || projectFile !== null;
  const projectDescriptionWordCount = countWords(formData.projectDescription);
  const nomaChallengeWordCount = countWords(formData.nomaChallenge);

  const areSectionFieldsValid = () => {
    for (const section of FIELD_SECTIONS) {
      for (const field of section.fields) {
        const value = formData[field.key];
        if (field.kind === "checkboxes") {
          if (field.required && (value as string[]).length === 0) return false;
        } else {
          if (field.required && (value as string).trim() === "") return false;
          if (field.wordLimit && countWords(value as string) > field.wordLimit) return false;
        }
      }
    }
    return true;
  };

  const isFormValid = () => {
    return (
      areSectionFieldsValid() &&
      resumeFile !== null &&
      (!isProjectDescriptionRequired || formData.projectDescription.trim() !== "") &&
      projectDescriptionWordCount <= PROJECT_DESCRIPTION_WORD_LIMIT &&
      formData.nomaChallenge.trim() !== "" &&
      nomaChallengeWordCount <= NOMA_CHALLENGE_WORD_LIMIT
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const renderSection = (section: Section) => (
    <section key={section.title}>
      <div className="mb-6">
        <h2 className={ui.sectionTitle}>
          Section {section.number} &mdash; {section.title}
        </h2>
        <div className={ui.sectionRule} />
        {section.note && <p className="mt-3 text-sm leading-relaxed text-text-muted">{section.note}</p>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{section.fields.map(renderField)}</div>
    </section>
  );

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
          <>
            <textarea {...common} rows={field.rows ?? 3} className={ui.textarea} />
            {field.wordLimit && (
              <p
                className={`mt-1.5 text-xs ${
                  countWords(value) > field.wordLimit ? "text-error" : "text-text-muted"
                }`}
              >
                {countWords(value)} / {field.wordLimit} words
              </p>
            )}
          </>
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
          {renderSection(SECTION_BASIC_INFO)}

          <section>
            <div className="mb-6">
              <h2 className={ui.sectionTitle}>Section 2 &mdash; Resume &amp; previous work</h2>
              <div className={ui.sectionRule} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FileUpload
                  onUploadComplete={() => {}}
                  onFileSelect={setResumeFile}
                  acceptedFileTypes={[".pdf", ".doc", ".docx"]}
                  maxFileSize={20}
                  label="Resume"
                  required={true}
                  placeholder="Drag and drop your resume here, or click to browse (PDF preferred)"
                  uploadEndpoint="/api/apply-student/upload-resume"
                  autoUpload={false}
                />
              </div>

              <div className="sm:col-span-2 mt-4">
                <h3 className={ui.sectionTitle}>Previous work &amp; projects</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  If applicable, you may share examples of previous work that demonstrate skills you
                  could bring to a Helix startup. This section is completely optional. Helix does not
                  expect applicants to have prior startup, research, technical, or professional
                  experience, and you should not feel pressured to submit anything here. Not submitting
                  previous work will not count against your application.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  We recognize that certain skills, particularly coding, engineering, design, research,
                  AI/ML, data analysis, CAD/3D modeling, and other technical work, can be difficult to
                  demonstrate through a written application alone. This section is simply an opportunity
                  for applicants who already have relevant projects to show us what they have worked on.
                  Examples may include GitHub repositories, coding or AI/ML projects, CAD/3D models,
                  engineering projects, research posters, data analyses or visualizations, UI/UX
                  portfolios, websites or apps, marketing materials, pitch decks, or other work you are
                  proud of.
                </p>
              </div>

              <div>
                <label htmlFor="portfolioLink" className={ui.label}>
                  Portfolio / GitHub / website link
                </label>
                <input
                  id="portfolioLink"
                  name="portfolioLink"
                  type="url"
                  value={formData.portfolioLink}
                  onChange={handleChange}
                  placeholder="https://"
                  className={ui.input}
                />
              </div>

              <div>
                <FileUpload
                  onUploadComplete={() => {}}
                  onFileSelect={setProjectFile}
                  acceptedFileTypes={PROJECT_FILE_TYPES}
                  maxFileSize={50}
                  label="Project file(s)"
                  placeholder="Drag and drop a project file here, or click to browse"
                  uploadEndpoint="/api/apply-student/upload-project"
                  autoUpload={false}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="projectDescription" className={ui.label}>
                  Briefly describe anything you have shared and your individual contribution.{" "}
                  {isProjectDescriptionRequired && <span className={ui.required}>*</span>}
                </label>
                <p className="mb-3 text-xs text-text-muted">
                  {isProjectDescriptionRequired
                    ? "Required since you added a link or file above."
                    : "Optional."}{" "}
                  {PROJECT_DESCRIPTION_WORD_LIMIT} words maximum.
                </p>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  rows={4}
                  value={formData.projectDescription}
                  onChange={handleChange}
                  required={isProjectDescriptionRequired}
                  className={ui.textarea}
                />
                <p
                  className={`mt-1.5 text-xs ${
                    projectDescriptionWordCount > PROJECT_DESCRIPTION_WORD_LIMIT
                      ? "text-error"
                      : "text-text-muted"
                  }`}
                >
                  {projectDescriptionWordCount} / {PROJECT_DESCRIPTION_WORD_LIMIT} words
                </p>
              </div>
            </div>
          </section>

          {renderSection(SECTION_GETTING_TO_KNOW_YOU)}

          <section>
            <div className="mb-6">
              <h2 className={ui.sectionTitle}>Section 4 &mdash; Helix startup challenge</h2>
              <div className={ui.sectionRule} />
            </div>

            <div className="space-y-6 text-sm leading-relaxed text-text-muted">
              <div>
                <h3 className="text-sm font-semibold text-text">Before you begin</h3>
                <p className="mt-2">We want to hear how you think.</p>
                <p className="mt-2">
                  Generative AI tools may be used to help edit, organize, or clarify your writing.
                  However, the ideas, reasoning, and proposed solutions in your application should be
                  your own. Please do not use AI to generate a solution and submit it as your own
                  thinking. Applications may be reviewed for signs of AI-generated content, and
                  applicants may be asked to explain or expand upon their proposed solution during the
                  selection process. We will be running application prompts through AI, we are looking
                  for your original ideas.
                </p>
                <p className="mt-2">
                  There is no correct answer. We are not looking for the most polished or technically
                  sophisticated response. We are looking for agency, originality, curiosity,
                  resourcefulness, and thoughtful problem-solving. Creative and unconventional approaches
                  are encouraged.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text">Meet Noma</h3>
                <p className="mt-2">
                  Noma is an early-stage healthcare startup developing a wearable patch that continuously
                  monitors patients after they leave the hospital. The patch collects heart rate,
                  temperature, respiratory rate, and movement data and alerts patients and their care
                  teams when patterns suggest that a patient may be deteriorating.
                </p>
                <p className="mt-2">
                  Noma recently completed a small pilot with one hospital. Patients generally liked the
                  device, but the company has encountered several challenges:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Clinicians are receiving too many alerts and have started ignoring some of them.</li>
                  <li>Some older patients stop wearing the patch after a few days.</li>
                  <li>The company has limited funding and a team of only six people.</li>
                </ul>
                <p className="mt-2">
                  The founders aren&apos;t sure whether they should prioritize improving the technology,
                  conducting more clinical validation, improving the patient experience, or finding
                  additional hospital partners.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text">Your challenge</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-6">
              <div>
                <label htmlFor="nomaChallenge" className={ui.label}>
                  Imagine Noma has brought you onto its team for the next month. What would you do?{" "}
                  <span className={ui.required}>*</span>
                </label>
                <p className="mb-3 text-sm leading-relaxed text-text-muted">
                  Earlier in this application, you selected the skill sets and areas in which you&apos;re
                  most interested in contributing to a startup. Now we want to see how you would actually
                  apply them. Approach Noma&apos;s challenges from whatever perspective best reflects your
                  interests, skills, and way of thinking. You are not expected to solve every problem the
                  company is facing. Instead, identify ONE problem you would prioritize and propose a
                  solution.
                </p>
                <p className="mb-3 text-sm leading-relaxed text-text-muted">
                  For example, someone interested in software engineering might approach the problem very
                  differently from someone interested in biology, marketing, product design, data
                  science, finance, or public health. That&apos;s intentional. There is no preferred
                  discipline or type of solution.
                </p>
                <p className="mb-3 text-sm leading-relaxed text-text-muted">Briefly address:</p>
                <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-muted">
                  <li>What problem would you prioritize, and why?</li>
                  <li>What would you actually do to address it?</li>
                  <li>How would you determine whether your solution worked?</li>
                </ol>
                <p className="mb-3 text-xs text-text-muted">
                  We encourage you to be specific and creative. We&apos;re interested in how you approach
                  the problem, not in finding a single correct answer. {NOMA_CHALLENGE_WORD_LIMIT} words
                  maximum.
                </p>
                <textarea
                  id="nomaChallenge"
                  name="nomaChallenge"
                  rows={8}
                  value={formData.nomaChallenge}
                  onChange={handleChange}
                  required
                  className={ui.textarea}
                />
                <p
                  className={`mt-1.5 text-xs ${
                    nomaChallengeWordCount > NOMA_CHALLENGE_WORD_LIMIT ? "text-error" : "text-text-muted"
                  }`}
                >
                  {nomaChallengeWordCount} / {NOMA_CHALLENGE_WORD_LIMIT} words
                </p>
              </div>
            </div>
          </section>

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
