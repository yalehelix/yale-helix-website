"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import FileUpload from "../components/startup-upload/FileUpload";

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
      setFormData(prev => ({ ...prev, pitchDeck: "" }));
    } else {
      // File was removed
      setSelectedFile(null);
      setCurrentFileUploaded(false);
      setFormData(prev => ({ ...prev, pitchDeck: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if file needs to be uploaded
      if (selectedFile && !currentFileUploaded) {
        // Convert file to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(selectedFile);
        });

        // Upload to Google Drive
        const uploadResponse = await fetch("/api/startup-upload-drive", {
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

        if (!uploadResponse.ok) {
          throw new Error("File upload failed");
        }

        const uploadResult = await uploadResponse.json();
        setFormData(prev => ({ ...prev, pitchDeck: uploadResult.driveLink }));
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
      const response = await fetch("/api/submit-application", {
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
        router.push('/apply/success');
      } else {
        // Handle server-side error
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      // Fallback: Try client-side submission if server fails
      submitFormToGoogle(pitchDeckLink);
    }
  };

  const submitFormToGoogle = (pitchDeckLink: string) => {
    // Fallback method: Create a temporary form to submit to Google Forms
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfDEZcLD3Q_ZdOfOyIGtPXtyMNTNUxqBAf6qeG0lRjnt3HZdQ/formResponse';
    form.target = '_blank';

    // Add all form fields
    const fields = [
      { name: 'entry.161973672', value: formData.startupName },
      { name: 'entry.1292942263', value: formData.contactName },
      { name: 'entry.2092094953', value: formData.email },
      { name: 'entry.263108220', value: formData.website },
      { name: 'entry.1907843651', value: formData.linkedin },
      { name: 'entry.184834358', value: formData.startupDescription },
      { name: 'entry.2089020112', value: formData.primaryProblem },
      { name: 'entry.1063815956', value: formData.solution },
      { name: 'entry.1750629714', value: formData.currentStage },
      { name: 'entry.1032800288', value: formData.targetCustomers },
      { name: 'entry.277254229', value: formData.businessModel },
      { name: 'entry.2001232321', value: formData.competitors },
      { name: 'entry.1189492363', value: formData.team },
      { name: 'entry.45775880', value: formData.milestoneAchievements },
      { name: 'entry.1881769432', value: formData.twelveMonthGoals },
      { name: 'entry.2011166899', value: formData.studentRoles },
      { name: 'entry.1001509675', value: formData.otherAccelerators },
      { name: 'entry.367328821', value: formData.additionalInfo },
      { name: 'entry.1006943153', value: pitchDeckLink }, 
    ];

    fields.forEach(field => {
      if (field.value) {
        const input = document.createElement('input');
        input.type = 'hidden';
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
      router.push('/apply/success');
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
                <label htmlFor="entry.161973672" className={styles.label}>
                  Startup Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.161973672"
                  name="entry.161973672"
                  value={formData.startupName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startupName: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1292942263" className={styles.label}>
                  Primary Contact Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="entry.1292942263"
                  name="entry.1292942263"
                  value={formData.contactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.2092094953" className={styles.label}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="entry.2092094953"
                  name="entry.2092094953"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.263108220" className={styles.label}>
                  Startup Website
                </label>
                <input
                  type="url"
                  id="entry.263108220"
                  name="entry.263108220"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  className={styles.input}
                  placeholder="https://"
                />
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
                <label htmlFor="entry.184834358" className={styles.label}>
                  Describe your startup in one sentence <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.184834358"
                  name="entry.184834358"
                  value={formData.startupDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startupDescription: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.2089020112" className={styles.label}>
                  What is the primary problem your startup aims to solve? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.2089020112"
                  name="entry.2089020112"
                  value={formData.primaryProblem}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryProblem: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1063815956" className={styles.label}>
                  Describe your solution and how it is unique <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1063815956"
                  name="entry.1063815956"
                  value={formData.solution}
                  onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.1750629714" className={styles.label}>
                  Current Stage <span className={styles.required}>*</span>
                </label>
                <select
                  id="entry.1750629714"
                  name="entry.1750629714"
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
                <label htmlFor="entry.1032800288" className={styles.label}>
                  Who are your target customers? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.1032800288"
                  name="entry.1032800288"
                  value={formData.targetCustomers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetCustomers: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.277254229" className={styles.label}>
                  Briefly describe your business model <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.277254229"
                  name="entry.277254229"
                  value={formData.businessModel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessModel: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.2001232321" className={styles.label}>
                  Who are your main competitors, and what differentiates you? <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.2001232321"
                  name="entry.2001232321"
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
              <label htmlFor="entry.1189492363" className={styles.label}>
                List the names, roles, and brief bios of your team members <span className={styles.required}>*</span>
              </label>
              <textarea
                id="entry.1189492363"
                name="entry.1189492363"
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
                <label htmlFor="entry.45775880" className={styles.label}>
                  What milestones have you achieved so far? <span className={styles.required}>*</span> <br></br> <br></br>
                </label>
                <textarea
                  id="entry.45775880"
                  name="entry.45775880"
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
                <label htmlFor="entry.2011166899" className={styles.label}>
                  What role(s) would you see students from Helix taking in your startup?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="entry.2011166899"
                  name="entry.2011166899"
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
                <label htmlFor="entry.1001509675" className={styles.label}>
                  Have you participated in any other incubators or accelerators?
                </label>
                <textarea
                  id="entry.1001509675"
                  name="entry.1001509675"
                  value={formData.otherAccelerators}
                  onChange={(e) => setFormData((prev) => ({ ...prev, otherAccelerators: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.367328821" className={styles.label}>
                  Any additional information you would like to share? <br></br> <br></br>
                </label>
                <textarea
                  id="entry.367328821"
                  name="entry.367328821"
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
              maxFileSize={20}
              label="Upload Pitch Deck"
              required={true}
              placeholder="Drag and drop your pitch deck here, or click to browse"
            />
            {/* Hidden input for Google Forms submission */}
            {formData.pitchDeck && (
              <input
                type="hidden"
                name="entry.1006943153"
                value={formData.pitchDeck}
              />
            )}
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
                  {selectedFile && !currentFileUploaded ? 'Uploading File...' : 'Submitting Application...'}
                </>
              ) : (
                'Submit Application'
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
