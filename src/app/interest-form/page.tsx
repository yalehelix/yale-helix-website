"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ui } from "../components/ui";

export default function InterestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    major: "",
    email: "",
    interests: [] as string[],
  });

  const areaOptions = [
    { value: "softwareDev", label: "Software Development" },
    { value: "ml", label: "Machine Learning / AI" },
    { value: "dataSci", label: "Data Science" },
    { value: "ui-ux", label: "UI / UX" },
    { value: "finance", label: "Finance" },
    { value: "biologicalSci", label: "Biological Sciences / Therapeutics" },
    { value: "clinicalResearch", label: "Clinical Research" },
    { value: "digitalHealth", label: "Digital Health" },
    { value: "engineering", label: "Engineering / Product Design" },
    { value: "marketing", label: "Marketing" },
    { value: "policy", label: "Policy" },
  ];

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInterestDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowInterestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInterestDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const getInterestLabel = (value: string) => {
    return areaOptions.find((option) => option.value === value)?.label || value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to our server-side API
      const response = await fetch("/api/submit-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitting(false);
        router.push("/interest-form/success");
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error) {
      // Fallback: Try client-side submission if server fails
      submitFormToGoogle();
    }
  };

  const submitFormToGoogle = () => {
    // Fallback method: Create a temporary form to submit to Google Forms
    const form = document.createElement("form");
    form.method = "POST";
    form.action =
      "https://docs.google.com/forms/d/e/1FAIpQLSeDlUA5uoNE4ecN3wojKeZaQGoBOncZSGmlRteWcKd8nJsD5A/formResponse";
    form.target = "_blank";

    // Add basic form fields
    const basicFields = [
      { name: "entry.1848089992", value: formData.name },
      { name: "entry.1203704855", value: formData.major },
      { name: "entry.724760969", value: formData.email },
    ];

    basicFields.forEach((field) => {
      if (field.value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
      }
    });

    // Add each interest as a separate input (required for Google Forms multi-select)
    formData.interests.forEach((interest) => {
      const label = getInterestLabel(interest);
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "entry.878899907";
      input.value = label;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setIsSubmitting(false);
    router.push("/interest-form/success");
  };

  const isValid =
    formData.name && formData.major && formData.email && formData.interests.length > 0;

  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <Link href="/" className={ui.returnButton}>
          &larr; Return to homepage
        </Link>

        <div className="mt-12">
          <p className={ui.eyebrow}>Join the future of healthcare innovation</p>
          <h1 className={ui.title}>Interest form</h1>
          <p className={ui.subtitle}>
            Interested in joining Yale Helix? Tell us about your interests and we will be in touch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <section>
            <div className="mb-6">
              <h2 className={ui.sectionTitle}>Your information</h2>
              <div className={ui.sectionRule} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={ui.label}>
                  Full name <span className={ui.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={ui.input}
                  required
                />
              </div>

              <div>
                <label htmlFor="major" className={ui.label}>
                  Major or field of study <span className={ui.required}>*</span>
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className={ui.input}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={ui.label}>
                  Email address <span className={ui.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={ui.input}
                  required
                />
              </div>

              <div>
                <label className={ui.label}>
                  Areas of interest <span className={ui.required}>*</span>
                </label>

                {formData.interests.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2.5 py-1 text-sm text-text"
                      >
                        {getInterestLabel(interest)}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          aria-label={`Remove ${getInterestLabel(interest)}`}
                          className="text-text-muted transition-colors hover:text-text"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowInterestDropdown((v) => !v)}
                    className={`${ui.input} flex items-center justify-between text-left`}
                  >
                    <span className={formData.interests.length === 0 ? "text-text-muted/60" : ""}>
                      {formData.interests.length === 0
                        ? "Select areas of interest..."
                        : `Selected ${formData.interests.length} area${
                            formData.interests.length !== 1 ? "s" : ""
                          }`}
                    </span>
                    <span className="text-xs text-text-muted">▼</span>
                  </button>

                  {showInterestDropdown && (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-md border border-hairline bg-bg-elev p-1.5 shadow-elev">
                      {areaOptions.map((option) => {
                        const checked = formData.interests.includes(option.value);
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => handleInterestChange(option.value)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              checked ? "bg-accent-soft text-text" : "text-text-muted hover:bg-surface"
                            }`}
                          >
                            {option.label}
                            {checked && <span className="text-accent">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hidden inputs for Google Forms submission */}
                {formData.interests.map((interest) => {
                  const match = areaOptions.find((o) => o.value === interest);
                  return (
                    <input
                      key={interest}
                      type="hidden"
                      name="entry.878899907"
                      value={match ? match.label : interest}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <div>
            <button type="submit" className={ui.primaryButton} disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className={ui.spinner} />
                  Submitting
                </>
              ) : (
                "Submit interest form"
              )}
            </button>
            <p className={ui.note}>
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
