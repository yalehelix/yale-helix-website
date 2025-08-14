"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import FileUpload from "../components/FileUpload";

export default function StartupApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
    pitchDeck: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileUploaded, setCurrentFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReturnToMain = () => {
    router.push("/");
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setCurrentFileUploaded(false);
      setFormData((prev) => ({ ...prev, pitchDeck: "" }));
    } else {
      // File was removed
      setSelectedFile(null);
      setCurrentFileUploaded(false);
      setFormData((prev) => ({ ...prev, pitchDeck: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if file needs to be uploaded
      if (selectedFile && !currentFileUploaded) {
        // Use FormData instead of base64 for better performance
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('fileName', selectedFile.name);
        uploadFormData.append('fileType', selectedFile.type);
        uploadFormData.append('folderName', `${formData.startupName} - ${formData.contactName}`); // Add folder name for organization

        // Upload to Google Drive
        const uploadResponse = await fetch("/api/apply-startup/upload-startup", {
          method: "POST",
          body: uploadFormData, // Use FormData instead of JSON
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed");
        }

        const uploadResult = await uploadResponse.json();
        setFormData((prev) => ({ ...prev, pitchDeck: uploadResult.driveLink }));
        setCurrentFileUploaded(true);

        // Now submit the application with the uploaded file link
        await submitApplicationToServer(uploadResult.driveLink);
      } else {
        // No file to upload, submit directly
        await submitApplicationToServer(formData.pitchDeck);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const submitApplicationToServer = async (pitchDeckLink: string) => {
    try {
      // Prepare the application data
      const applicationData = {
        startupName: formData.startupName,
        contactName: formData.contactName,
        email: formData.email,
        website: formData.website,
        linkedin: formData.linkedin,
        startupDescription: formData.startupDescription,
        primaryProblem: formData.primaryProblem,
        solution: formData.solution,
        currentStage: formData.currentStage,
        targetCustomers: formData.targetCustomers,
        businessModel: formData.businessModel,
        competitors: formData.competitors,
        team: formData.team,
        milestoneAchievements: formData.milestoneAchievements,
        twelveMonthGoals: formData.twelveMonthGoals,
        studentRoles: formData.studentRoles,
        otherAccelerators: formData.otherAccelerators,
        additionalInfo: formData.additionalInfo,
        pitchDeck: pitchDeckLink,
      };

      // Submit to our server-side API
      const response = await fetch("/api/apply-startup/submit-startup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success! Reset submission state
        setIsSubmitting(false);

        // Redirect to success page
        router.push("/apply/success");
      } else {
        // Handle server-side error
        throw new Error(result.error || "Submission failed");
      }
    } catch (error) {
      // Fallback: Try client-side submission if server fails
      submitFormToGoogle(pitchDeckLink);
    }
  };

  const submitFormToGoogle = (pitchDeckLink: string) => {
    // Fallback method: Create a temporary form to submit to Google Forms
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://docs.google.com/forms/d/e/1FAIpQLSeTs-mkFf0y6AVKzVyg2Qx8eG4azWX_oC3GGRsNNtMYsagExQ/formResponse";
    form.target = "_blank";

    // Add all form fields
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
      { name: "entry.1859300090", value: formData.competitors },
      { name: "entry.1684025098", value: formData.team },
      { name: "entry.1602431770", value: formData.milestoneAchievements },
      { name: "entry.2119814287", value: formData.twelveMonthGoals },
      { name: "entry.291054326", value: formData.studentRoles },
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

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset submission state
    setIsSubmitting(false);

    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push("/apply/success");
    }, 1000);
  };

  return (
    <div className={styles.applicationPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.applicationContent}>
        {/* Header with Return Button */}

        {/* Header */}
        <div className={styles.applicationHeader}>
          <p className={styles.smallText}>Join The Future of Healthcare Innovation</p>
          <h1 className={styles.mainHeader}>Yale Helix Incubator</h1>
          <h2 className={styles.subHeader}>Startup Application 2025-2026</h2>
          <p className={styles.headerDescription}>
            Are you a founder in the healthcare, digital health, or biotech space ready to fast-track your growth? We invite
            startups at any stage to apply, particularly those connected to the Yale and New Haven community, including Yale
            alumni, graduate, and undergraduate students. Discover how the Yale Helix Incubator can be a valuable opportunity
            for your team.
          </p>
        </div>

        {/* Application Form - Using controlled submission */}
        <form onSubmit={handleSubmit} className={styles.applicationForm}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="entry.171789341" className={styles.label}>
                  Startup Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.171789341"
                  name="entry.171789341"
                  value={formData.startupName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startupName: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.359504525" className={styles.label}>
                  Primary Contact Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.359504525"
                  name="entry.359504525"
                  value={formData.contactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.58582101" className={styles.label}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="entry.58582101"
                  name="entry.58582101"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.883030032" className={styles.label}>
                  Startup Website
                </label>
                <input
                  type="url"
                  id="entry.883030032"
                  name="entry.883030032"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  className={styles.input}
                  placeholder="https://"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.23302701" className={styles.label}>
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="entry.23302701"
                  name="entry.23302701"
                  value={formData.linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                  className={styles.input}
                  placeholder="https://linkedin.com/in/"
                />
              </div>
            </div>
          </div>

          {/* Startup Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Startup Information</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="entry.1655775433" className={styles.label}>
                  Describe your startup in one sentence <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1655775433"
                  name="entry.1655775433"
                  value={formData.startupDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startupDescription: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1777513500" className={styles.label}>
                  What is the primary problem your startup aims to solve? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1777513500"
                  name="entry.1777513500"
                  value={formData.primaryProblem}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryProblem: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.99637537" className={styles.label}>
                  Describe your solution and how it is unique <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.99637537"
                  name="entry.99637537"
                  value={formData.solution}
                  onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1158341576" className={styles.label}>
                  Current Stage <span className={styles.required}>*</span>
                </label>
                <select
                  id="entry.1158341576"
                  name="entry.1158341576"
                  value={formData.currentStage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentStage: e.target.value }))}
                  className={styles.select}
                  required
                >
                  <option value="">Select stage</option>
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Early Revenue">Early Revenue</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1667235498" className={styles.label}>
                  Who are your target customers? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1667235498"
                  name="entry.1667235498"
                  value={formData.targetCustomers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetCustomers: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.298457997" className={styles.label}>
                  Briefly describe your business model <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.298457997"
                  name="entry.298457997"
                  value={formData.businessModel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessModel: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1859300090" className={styles.label}>
                  Who are your main competitors, and what differentiates you? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1859300090"
                  name="entry.1859300090"
                  value={formData.competitors}
                  onChange={(e) => setFormData((prev) => ({ ...prev, competitors: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Team Information</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="entry.1684025098" className={styles.label}>
                List the names, roles, and brief bios of your team members <span className={styles.required}>*</span>
              </label>
              <textarea
                id="entry.1684025098"
                name="entry.1684025098"
                value={formData.team}
                onChange={(e) => setFormData((prev) => ({ ...prev, team: e.target.value }))}
                className={styles.textarea}
                rows={6}
                required
              />
            </div>
          </div>

          {/* Progress and Goals Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Progress and Goals</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="entry.1602431770" className={styles.label}>
                  What milestones have you achieved so far? <span className={styles.required}>*</span> <br></br> <br></br>
                </label>
                <textarea
                  id="entry.1602431770"
                  name="entry.1602431770"
                  value={formData.milestoneAchievements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, milestoneAchievements: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1881769432" className={styles.label}>
                  What are your key goals for the next 6-12 months and how can Helix help?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1881769432"
                  name="entry.1881769432"
                  value={formData.twelveMonthGoals}
                  onChange={(e) => setFormData((prev) => ({ ...prev, twelveMonthGoals: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.2119814287" className={styles.label}>
                  What role(s) would you see students from Helix taking in your startup?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.2119814287"
                  name="entry.2119814287"
                  value={formData.studentRoles}
                  onChange={(e) => setFormData((prev) => ({ ...prev, studentRoles: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Additional Information</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="entry.291054326" className={styles.label}>
                  Have you participated in any other incubators or accelerators?
                </label>
                <textarea
                  id="entry.291054326"
                  name="entry.291054326"
                  value={formData.otherAccelerators}
                  onChange={(e) => setFormData((prev) => ({ ...prev, otherAccelerators: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1080397699" className={styles.label}>
                  Any additional information you would like to share? <br></br> <br></br>
                </label>
                <textarea
                  id="entry.1080397699"
                  name="entry.1080397699"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Pitch Deck</h3>
              <div className={styles.sectionLine}></div>
            </div>
            <FileUpload
              onUploadComplete={(driveLink) => {
                setFormData((prev) => ({ ...prev, pitchDeck: driveLink }));
                setCurrentFileUploaded(true);
              }}
              onFileSelect={handleFileSelect}
              acceptedFileTypes={[".pdf"]}
              maxFileSize={50}
              label="Upload Pitch Deck"
              required={true}
              placeholder="Drag and drop your pitch deck here, or click to browse"
              uploadEndpoint="/api/apply-startup/upload-startup"
              autoUpload={false}
            />
            {/* Hidden input for Google Forms submission */}
            {formData.pitchDeck && <input type="hidden" name="entry.639898116" value={formData.pitchDeck} />}
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={(!selectedFile && !formData.pitchDeck) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  {selectedFile && !currentFileUploaded ? "Uploading File & Submitting..." : "Submitting Application..."}
                </>
              ) : (
                "Submit Application"
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
