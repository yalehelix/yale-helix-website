"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Select from "react-select";
import FileUpload from "../components/FileUpload";

// Add a type for the form data
interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  linkedin: string;
  classYear: string;
  intendedMajor: string;
  areasOfInterest: string[];
  whyHelix: string;
  building: string;
  goals: string;
  resume: string;
  longForm: string;
}

export default function StudentApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    linkedin: "",
    classYear: "",
    intendedMajor: "",
    areasOfInterest: [],
    whyHelix: "",
    building: "",
    goals: "",
    resume: "",
    longForm: "",
  });

  const areaOptions = [
    { value: "softwareDev", label: "Software Development" },
    { value: "ml", label: "Machine Learning / AI" },
    { value: "dataSci", label: "Data Science" },
    { value: "finance", label: "Finance" },
    { value: "biologicalSci", label: "Biological Sciences / Therapeutics" },
    { value: "clinicalResearch", label: "Clinical Research" },
    { value: "digitalHealth", label: "Digital Health" },
    { value: "engineering", label: "Engineering / Product Design" },
    { value: "marketing", label: "Marketing" },
    { value: "policy", label: "Policy" },
  ];

  const classYearOptions = [
    { value: "2029", label: "2029" },
    { value: "2028", label: "2028" },
    { value: "2027", label: "2027" },
    { value: "2026", label: "2026" },
  ];

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

  // Add state to track if current file has been uploaded
  const [currentFileUploaded, setCurrentFileUploaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there's a selected file that hasn't been uploaded yet
    if (selectedFile && !currentFileUploaded) {
        try {
            // Show loading state
            setIsUploading(true);
            
            // Upload the file first
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(",")[1];
                    resolve(base64Data);
                };
                reader.readAsDataURL(selectedFile);
            });

            const response = await fetch("/api/upload-to-drive", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileData: base64,
                }),
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const result = await response.json();
            const driveLink = result.driveLink;
            
            // Update form data with the drive link
            setFormData(prev => ({ ...prev, resume: driveLink }));
            setCurrentFileUploaded(true); // Mark current file as uploaded
            
            // Wait a moment for state to update, then submit
            setTimeout(() => {
                submitFormToGoogle(driveLink);
            }, 100);
            
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file. Please try again.");
            setIsUploading(false);
            return;
        }
    } else {
        // No file to upload, submit directly
        submitFormToGoogle(formData.resume);
    }
  };

  const submitFormToGoogle = (resumeLink: string) => {
    // Create a temporary form to submit to Google Forms
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfJL1qgGgfl31AFpVn_M8NZBuRePz6XrmWoQjlUqHA024It8g/formResponse';
    // Removed target="_blank" to avoid pop-up blockers - form will submit in same window
    
    // Add all form fields
    const fields = [
        { name: 'entry.231588117', value: formData.firstName },
        { name: 'entry.254464927', value: formData.lastName },
        { name: 'entry.673409248', value: formData.email },
        { name: 'entry.1720462299', value: formData.classYear },
        { name: 'entry.1837266616', value: formData.intendedMajor },
        { name: 'entry.1907843651', value: formData.linkedin },
        { name: 'entry.535815391', value: resumeLink },
        { name: 'entry.2107500991', value: formData.whyHelix },
        { name: 'entry.1678797299', value: formData.building },
        { name: 'entry.766347532', value: formData.goals },
        { name: 'entry.497833455', value: formData.longForm },
    ];

    // Add areas of interest (multiple values)
    formData.areasOfInterest.forEach(area => {
        const areaOption = areaOptions.find(option => option.value === area);
        if (areaOption) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'entry.1486721923';
            input.value = areaOption.label;
            form.appendChild(input);
        }
    });

    // Add all other fields
    fields.forEach(field => {
        if (field.value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            form.appendChild(input);
        }
    });

    // Submit the form in the same window (no pop-up blockers)
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Reset upload state
    setIsUploading(false);
    setSelectedFile(null);
    setCurrentFileUploaded(false);
  };

  // Add state for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handler for when a new file is selected
  const handleFileSelect = (file: File | null) => {
      if (file) {
          setSelectedFile(file);
          setCurrentFileUploaded(false); // Reset upload state for new file
          setFormData(prev => ({ ...prev, resume: "" })); // Clear previous drive link
      } else {
          // File was removed
          setSelectedFile(null);
          setCurrentFileUploaded(false);
          setFormData(prev => ({ ...prev, resume: "" }));
      }
  };

  return (
    <div className={styles.applicationPage}>
      <div className={styles.applicationContent}>
        {/* Header with Return Button */}
        <div className={styles.headerWithNav}>
          <button onClick={handleReturnToMain} className={styles.returnButton}>
            ← Return to Homepage
          </button>
        </div>

        {/* Header */}
        <div className={styles.applicationHeader}>
          <p className={styles.smallText}>Join The Future of Healthcare Innovation</p>
          <h1 className={styles.mainHeader}>Yale Helix Incubator</h1>
          <h2 className={styles.subHeader}>Student Fellow Application 2025-2026</h2>
          <p className={styles.headerDescription}>
            Each Fall, we carefully select the most promising startups in various health-focused fields, each at a unique stage of development, to join our incubator. Our passionate and driven
            students play a pivotal role in helping these startups reach critical milestones and accelerate their growth. If that is you, apply today!
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
                <label htmlFor="entry.231588117" className={styles.label}>
                  First Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.231588117"
                  name="entry.231588117"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.254464927" className={styles.label}>
                  Last Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.254464927"
                  name="entry.254464927"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.673409248" className={styles.label}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="entry.673409248"
                  name="entry.673409248"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1720462299" className={styles.label}>
                  Class Year <span className={styles.required}>*</span>
                </label>
                <Select
                  id="entry.1720462299"
                  options={classYearOptions}
                  value={classYearOptions.find((option) => option.value === formData.classYear) || null}
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      classYear: selected ? selected.value : "",
                    }));
                  }}
                  classNamePrefix="customSelect"
                  placeholder="Select Class Year"
                  isClearable
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 1300 }), // make sure it clears the cards
                  }}
                />
                {/* Hidden input for Google Forms submission */}
                {formData.classYear && <input type="hidden" name="entry.1720462299" value={formData.classYear} />}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1837266616" className={styles.label}>
                  Intended Major <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.1837266616"
                  name="entry.1837266616"
                  value={formData.intendedMajor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      intendedMajor: e.target.value,
                    }))
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1486721923" className={styles.label}>
                  Areas of Interest <span className={styles.required}>*</span>
                </label>
                {/* react-select multi-select dropdown */}
                <Select
                  id="entry.1486721923"
                  isMulti
                  options={areaOptions}
                  value={areaOptions.filter((option) => formData.areasOfInterest.includes(option.value))}
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      areasOfInterest: Array.isArray(selected) ? selected.map((opt) => opt.value) : [],
                    }));
                  }}
                  classNamePrefix="customSelect"
                  placeholder="Select Areas of Interest..."
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 1300 }), // make sure it clears the cards
                  }}
                />
                {/* Hidden inputs for Google Forms submission */}
                {formData.areasOfInterest.map((area) => {
                  const match = areaOptions.find((o) => o.value === area);
                  return <input key={area} type="hidden" name="entry.1486721923" value={match ? match.label : area} />;
                })}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1907843651" className={styles.label}>
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="entry.1907843651"
                  name="entry.1907843651"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedin: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="https://linkedin.com/in/"
                />
              </div>

              <div className={styles.formGroup}>
                <FileUpload
                  onUploadComplete={(driveLink) => {
                      setFormData((prev) => ({ ...prev, resume: driveLink }));
                      setCurrentFileUploaded(true); // Mark as uploaded
                  }}
                  onFileSelect={handleFileSelect} // Use the new handler
                  acceptedFileTypes={[".pdf", ".doc", ".docx"]}
                  maxFileSize={10}
                  label="Upload Resume"
                  placeholder="Drag and drop your resume here, or click to browse"
                />
                {/* Hidden input for Google Forms submission */}
                {formData.resume && (
                  <input
                    type="hidden"
                    name="entry.535815391"
                    value={formData.resume}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Application Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Application Questions</h3>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.normalTextHeader}>Why Helix?</div>

            <div className={styles.normalText}>
              Why are you interested in joining Helix, and what do you hope to gain from working with a startup in our incubator? (50-100 words max.)&nbsp;
              <span className={styles.required}>*</span>
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="entry.2107500991"
                name="entry.2107500991"
                value={formData.whyHelix}
                onChange={(e) => setFormData((prev) => ({ ...prev, whyHelix: e.target.value }))}
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.spacerLarge}></div>

            <div className={styles.normalTextHeader}>Wat Have You Built?</div>

            <div className={styles.normalText}>
              Tell us about something you've built or contributed to that had a significant impact on you or others. (50-100 words max.) <span className={styles.required}>*</span>
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="entry.1678797299"
                name="entry.1678797299"
                value={formData.building}
                onChange={(e) => setFormData((prev) => ({ ...prev, building: e.target.value }))}
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.spacerLarge}></div>

            <div className={styles.normalTextHeader}>Why Are Your Future Goals?</div>

            <div className={styles.normalText}>
              Tell us about your future career goals (50 words max.) <span className={styles.required}>*</span>
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="entry.766347532"
                name="entry.766347532"
                value={formData.goals}
                onChange={(e) => setFormData((prev) => ({ ...prev, goals: e.target.value }))}
                className={styles.textarea}
                rows={3}
                required
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Long-Form Application Prompt Options (Choose One):</h3>
              <div className={styles.sectionLine}></div>
            </div>

            {/* Explanation */}
            <div className={styles.normalTextItalic}>
              Applicants are invited to select one of the following prompts to showcase their skills and creativity. Please submit your response in the requested format by the application deadline.
            </div>

            <div className={styles.spacer}></div>

            {/* Option 1 */}
            <div className={styles.normalTextHeader}>
              <u>Option 1</u>: Demonstrate Exceptional Technical or Graphic Design Skill
            </div>

            <div className={styles.normalText}>If you have advanced technical, engineering, or design skills, we invite you to submit a portfolio demonstrating your work.</div>

            <div className={styles.normalText}>
              <p>This could include:</p>
              <ul>
                <li>A GitHub repository showcasing software engineering or a technical build</li>
                <li>A graphic design portfolio (PDF or link)</li>
                <li>CAD models, UI/UX prototypes, data visualizations, or similar media</li>
              </ul>
            </div>

            <div className={styles.normalText}>
              <span className={styles.normalTextBold}>Submission Format: </span>
              Provide a link to your portfolio or upload a PDF. Include a short description (150 words max) explaining the purpose and context of your work.
            </div>

            <div className={styles.spacer}></div>

            {/* Option 2 */}
            <div className={styles.normalTextHeader}>
              <u>Option 2</u>: Create a Graphical Abstract from a Scientific Article
            </div>

            <div className={styles.normalText}>
              Read the following paper published in Science:&nbsp;
              <a className={styles.link} href="https://www.science.org/doi/10.1126/science.abq8148" target="_blank">
                Immotile cilia mechanically sense the direction of fluid flow for left-right determination
              </a>
            </div>

            <div className={styles.normalText}>
              Using this article as a basis, design a <span className={styles.normalTextBold}>graphical abstract</span> that captures its key findings in a clear, accessible visual format. Your
              abstract should aim to communicate the essence of the paper to a general scientific audience.
            </div>

            <div className={styles.normalText}>
              <span className={styles.normalTextBold}>Submission Format: </span>
              Upload your graphical abstract (PDF or PNG) and a caption explaining your visual.
            </div>

            <div className={styles.spacer}></div>

            {/* Option 3 */}
            <div className={styles.normalTextHeader}>
              <u>Option 3</u>: Analyze a Market Landscape in Healthcare or Biotechnology
            </div>

            <div className={styles.normalText}>
              Select a healthcare or biotechnology market of your choice (e.g., wearable diagnostics, fertility tech, mRNA therapeutics) and prepare a short market landscape overview. Your submission
              should identify key players, market trends, unmet needs, and future opportunities.
            </div>

            <div className={styles.normalText}>
              <p className={styles.normalText}>
                <span className={styles.normalTextBold}>Submission Format:</span>
              </p>
              <ul className={styles.list}>
                <li>A short slide deck (5–7 slides in PDF format)</li>
                <li>A brief video (2–3 minutes) walking us through your findings and thought process</li>
              </ul>
            </div>

            <div className={styles.spacerLarge}></div>

            <div className={styles.formGroup}>
              <label htmlFor="entry.497833455" className={styles.label}>
                Google Drive Link to Submission
              </label>
              <input
                type="url"
                id="entry.497833455"
                name="entry.497833455"
                value={formData.longForm}
                onChange={(e) => setFormData((prev) => ({ ...prev, longForm: e.target.value }))}
                className={styles.input}
                placeholder="https://drive.google.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isUploading}
            >
              {isUploading ? "Uploading File..." : "Submit Application"}
            </button>
            <p className={styles.submitNote}>
              {isUploading 
                ? "Please wait while we upload your file..."
                : "After submitting, you will be redirected to a Google confirmation page."
              }
              <br />
              Questions? Contact us at <a href="mailto:admin@yalehelix.org">admin@yalehelix.org</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
