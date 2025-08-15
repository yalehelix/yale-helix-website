"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function InterestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleReturnToMain = () => {
    // Use window.location to ensure full page reload for animations
    window.location.href = "/";
  };

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

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownContent = document.querySelector(`.${styles.dropdownContent}`);
      const dropdownOverlay = document.querySelector(`.${styles.dropdownOverlay}`);
      
      if (showInterestDropdown && 
          dropdownContent && 
          !dropdownContent.contains(target) && 
          dropdownOverlay && 
          !dropdownOverlay.contains(target)) {
        setShowInterestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInterestDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    return areaOptions.find(option => option.value === value)?.label || value;
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
        // Success! Reset submission state
        setIsSubmitting(false);

        // Redirect to success page
        router.push("/interest-form/success");
      } else {
        // Handle server-side error
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
    form.action = "https://docs.google.com/forms/d/e/1FAIpQLSeDlUA5uoNE4ecN3wojKeZaQGoBOncZSGmlRteWcKd8nJsD5A/formResponse";
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

    // Reset submission state
    setIsSubmitting(false);

    // Redirect to success page
    router.push("/interest-form/success");
  };

  return (
    <div className={styles.applicationPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.applicationContent}>
        {/* Header */}
        <div className={styles.applicationHeader}>
          <p className={styles.smallText}>Join The Future of Healthcare Innovation</p>
          <h1 className={styles.mainHeader}>Yale Helix Incubator</h1>
          <h2 className={styles.subHeader}>Interest Form</h2>
          <p className={styles.headerDescription}>
            Are you interested in joining Yale Helix? Fill out this form to let us know about your interests and we&apos;ll be in touch!
          </p>
        </div>

        {/* Interest Form */}
        <form onSubmit={handleSubmit} className={styles.applicationForm}>
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Your Information</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="major" className={styles.label}>
                  Major/Field of Study <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Areas of Interest <span className={styles.required}>*</span>
                </label>
                
                {/* Selected Interests Display */}
                {formData.interests.length > 0 && (
                  <div className={styles.selectedInterests}>
                    {formData.interests.map((interest) => (
                      <div key={interest} className={styles.interestCard}>
                        <span>{getInterestLabel(interest)}</span>
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className={styles.removeInterest}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interest Dropdown */}
                <div className={styles.interestDropdown} ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowInterestDropdown(!showInterestDropdown)}
                    className={styles.dropdownButton}
                  >
                    {formData.interests.length === 0 
                      ? "Select areas of interest..." 
                      : `Selected ${formData.interests.length} area${formData.interests.length !== 1 ? 's' : ''}`
                    }
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  {showInterestDropdown && (
                    <>
                      <div className={styles.dropdownOverlay} onClick={() => setShowInterestDropdown(false)} />
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h3 className={styles.dropdownTitle}>Select Areas of Interest</h3>
                          <button
                            type="button"
                            onClick={() => setShowInterestDropdown(false)}
                            className={styles.closeButton}
                          >
                            ×
                          </button>
                        </div>
                        {areaOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`${styles.interestOption} ${
                              formData.interests.includes(option.value) ? styles.selected : ''
                            }`}
                            onClick={() => {
                              handleInterestChange(option.value);
                              // Don't close dropdown immediately to allow multiple selections
                            }}
                          >
                            <span className={styles.optionLabel}>{option.label}</span>
                            {formData.interests.includes(option.value) && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
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
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!formData.name || !formData.major || !formData.email || formData.interests.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Submitting...
                </>
              ) : (
                "Submit Interest Form"
              )}
            </button>
            <p className={styles.submitNote}>
              Questions? Contact us at <a href="mailto:admin@yalehelix.org">admin@yalehelix.org</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
