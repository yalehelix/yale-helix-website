"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
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
  longFormOption: string; // New field for selected option
  longForm: string;
  longFormDescription?: string; // For Option 1 description
  longFormFile?: string; // For file uploads
  submissionMethod: "link" | "file"; // New field for submission method
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
    longFormOption: "",
    longForm: "",
    longFormDescription: "",
    longFormFile: "",
    submissionMethod: "link", // Initialize with "link"
  });

  const areaOptions = [
    { value: "softwareDev", label: "Software Development" },
    { value: "ml", label: "ML / AI" },
    { value: "dataSci", label: "Data Science" },
    { value: "ui-ux", label: "UI / UX" },
    { value: "finance", label: "Finance" },
    { value: "biologicalSci", label: "Biological Sciences" },
    { value: "therapeutics", label: "Therapeutics" },
    { value: "clinicalResearch", label: "Clinical Research" },
    { value: "digitalHealth", label: "Digital Health" },
    { value: "productDesign", label: "Product Design" },
    { value: "marketing", label: "Marketing" },
    { value: "policy", label: "Policy" },
  ];

  const longFormOptions = [
    { value: "option1", label: "Option 1: Demonstrate Exceptional Technical or Graphic Design Skill" },
    { value: "option2", label: "Option 2: Create a Graphical Abstract from a Scientific Article" },
    { value: "option3", label: "Option 3: Analyze a Market Landscape in Healthcare or Biotechnology" },
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
    // Use window.location to ensure full page reload for animations
    window.location.href = "/";
  };

  // File size formatting function (matching resume upload)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Add state to track if current file has been uploaded
  const [currentFileUploaded, setCurrentFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [longFormFile, setLongFormFile] = useState<File | null>(null);
  
  // Error states for file validation
  const [resumeError, setResumeError] = useState<string>("");
  const [longFormError, setLongFormError] = useState<string>("");

  // Custom dropdown states
  const [showClassYearDropdown, setShowClassYearDropdown] = useState(false);
  const [showAreasDropdown, setShowAreasDropdown] = useState(false);
  const classYearDropdownRef = useRef<HTMLDivElement>(null);
  const areasDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (showClassYearDropdown && classYearDropdownRef.current && !classYearDropdownRef.current.contains(target)) {
        setShowClassYearDropdown(false);
      }
      
      if (showAreasDropdown && areasDropdownRef.current && !areasDropdownRef.current.contains(target)) {
        setShowAreasDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClassYearDropdown, showAreasDropdown]);

  // Function to check if all required fields are filled
  const isFormValid = () => {
    const basicFieldsValid = (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.classYear.trim() !== "" &&
      formData.intendedMajor.trim() !== "" &&
      formData.areasOfInterest.length > 0 &&
      formData.whyHelix.trim() !== "" &&
      formData.building.trim() !== "" &&
      formData.goals.trim() !== "" &&
      formData.longFormOption !== ""
    );

    // Check long form specific requirements
    let longFormValid = true;
    if (formData.longFormOption === "option1") {
      longFormValid = formData.submissionMethod === "link" ? 
        formData.longForm.trim() !== "" && formData.longFormDescription?.trim() !== "" :
        formData.longFormFile?.trim() !== "" && formData.longFormDescription?.trim() !== "";
    } else if (formData.longFormOption === "option2") {
      longFormValid = formData.longFormFile?.trim() !== "" && formData.longFormDescription?.trim() !== "";
    } else if (formData.longFormOption === "option3") {
      longFormValid = formData.longForm.trim() !== "" && formData.longFormFile?.trim() !== "";
    }

    return basicFieldsValid && longFormValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Show loading state
      setIsUploading(true);
      
      // Submit to both Google Forms and Supabase simultaneously
      const [googleFormsResult, supabaseResult] = await Promise.allSettled([
        submitFormToGoogle(formData.resume || ''),
        submitApplicationToSupabase()
      ]);
      
      // Check results
      let googleFormsSuccess = googleFormsResult.status === 'fulfilled';
      let supabaseSuccess = supabaseResult.status === 'fulfilled';
      
      if (supabaseResult.status === 'rejected') {
        console.error('Supabase submission failed:', supabaseResult.reason);
        supabaseSuccess = false;
      }
      
      if (googleFormsResult.status === 'rejected') {
        console.error('Google Forms submission failed:', googleFormsResult.reason);
        googleFormsSuccess = false;
      }
      
      // If both failed, show error
      if (!googleFormsSuccess && !supabaseSuccess) {
        throw new Error('Both submission methods failed. Please try again.');
      }
      
              // If Supabase succeeded, upload files there
        if (supabaseSuccess && supabaseResult.status === 'fulfilled' && supabaseResult.value?.applicationId) {
          await uploadFilesToSupabase(supabaseResult.value.applicationId);
        }
      
      // Mark current file as uploaded if resume was uploaded
      if (selectedFile && !currentFileUploaded) {
        setCurrentFileUploaded(true);
      }
      
      // Reset upload state
      setIsUploading(false);
      setSelectedFile(null);
      setCurrentFileUploaded(false);

      // Redirect to success page
      router.push("/apply-students/success");
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
      setIsUploading(false);
      return;
    }
  };



  // New function to submit application to Supabase
  const submitApplicationToSupabase = async () => {
    try {
      // Prepare the application data for Supabase
      const applicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        linkedin: formData.linkedin,
        classYear: formData.classYear,
        intendedMajor: formData.intendedMajor,
        areasOfInterest: formData.areasOfInterest,
        whyHelix: formData.whyHelix,
        building: formData.building,
        goals: formData.goals,
        longFormOption: formData.longFormOption,
        longForm: formData.longForm,
        longFormDescription: formData.longFormDescription,
        longFormFile: formData.longFormFile,
        submissionMethod: formData.submissionMethod,
      };

      const response = await fetch("/api/apply-student/submit-student-supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Supabase submission failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Supabase submission error:", error);
      throw error;
    }
  };

  // New function to upload files to Supabase
  const uploadFilesToSupabase = async (applicationId: string) => {
    try {
      const filesToUpload = [];
      
      // Add resume if there's a file
      if (selectedFile && !currentFileUploaded) {
        filesToUpload.push({
          file: selectedFile,
          role: 'resume' as const,
          fileName: selectedFile.name,
        });
      }
      
      // Handle long form option submissions
      if (formData.longFormOption === "option1" && formData.submissionMethod === "file" && longFormFile) {
        filesToUpload.push({
          file: longFormFile,
          role: 'portfolio_pdf' as const,
          fileName: longFormFile.name,
        });
      } else if (formData.longFormOption === "option2" && longFormFile) {
        filesToUpload.push({
          file: longFormFile,
          role: 'graphical_abstract' as const,
          fileName: longFormFile.name,
        });
      } else if (formData.longFormOption === "option3" && longFormFile) {
        filesToUpload.push({
          file: longFormFile,
          role: 'slide_deck' as const,
          fileName: longFormFile.name,
        });
      }
      
      // Upload each file to Supabase
      for (const fileData of filesToUpload) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('applicationId', applicationId);
        formData.append('role', fileData.role);
        formData.append('fileName', fileData.fileName);
        
        const response = await fetch("/api/apply-student/upload-student-supabase", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to upload ${fileData.fileName}: ${error.error}`);
        }
        
        const result = await response.json();
        console.log(`Uploaded ${fileData.fileName} to Supabase:`, result);
        
        // If this is the resume, update the form data
        if (fileData.role === 'resume') {
          setFormData(prev => ({ ...prev, resume: result.publicUrl }));
        }
      }
    } catch (error) {
      console.error("Supabase file upload error:", error);
      throw error;
    }
  };



  const submitFormToGoogle = (resumeLink: string) => {
    // Submit Google form in the background using an iframe to prevent page redirect
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'google-form-submit';
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfdTJtXgf4mvOT7HwGJsfEKkoiOFXDrIbHvdJ915VNr5xPElg/formResponse';
    form.target = 'google-form-submit'; // Target the hidden iframe
    
    // Prepare long form data based on selected option
    let longFormData = '';
    if (formData.longFormOption === 'option1') {
      if (formData.submissionMethod === 'link') {
        longFormData = `Portfolio Link: ${formData.longForm}\nDescription: ${formData.longFormDescription || ''}`;
      } else {
        longFormData = `Portfolio File: ${formData.longFormFile || ''}\nDescription: ${formData.longFormDescription || ''}`;
      }
    } else if (formData.longFormOption === 'option2') {
      longFormData = `Graphical Abstract: ${formData.longFormFile || ''}\nCaption: ${formData.longFormDescription || ''}`;
    } else if (formData.longFormOption === 'option3') {
      longFormData = `Slide Deck: ${formData.longForm}\nVideo Link: ${formData.longFormFile || ''}`;
    }
    
    // Add all form fields
    const fields = [
        { name: 'entry.231588117', value: formData.firstName },
        { name: 'entry.254464927', value: formData.lastName },
        { name: 'entry.673409248', value: formData.email },
        { name: 'entry.1720462299', value: formData.classYear },
        { name: 'entry.1837266616', value: formData.intendedMajor },
        { name: 'entry.291308032', value: formData.linkedin },
        { name: 'entry.535815391', value: resumeLink },
        { name: 'entry.2107500991', value: formData.whyHelix },
        { name: 'entry.1678797299', value: formData.building },
        { name: 'entry.766347532', value: formData.goals },
        { name: 'entry.497833455', value: longFormData },
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

    // Add iframe and form to DOM, submit, then clean up
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
    
    // Clean up after submission
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 1000);
    
    // Note: Redirect and state reset are handled in the main function after file upload
  };

  // Handler for when a new file is selected
  const handleFileSelect = (file: File | null) => {
    if (file) {
                                        // Validate file size (4MB for resume)
                                        const maxSizeMB = 4;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setResumeError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }
      
      // Validate file type (PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP)
      const acceptedTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.zip'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        setResumeError(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
        return;
      }
      
      // Clear any previous errors
      setResumeError("");
      setSelectedFile(file);
      setCurrentFileUploaded(false);
    } else {
      setSelectedFile(null);
      setCurrentFileUploaded(false);
      setResumeError("");
    }
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
          <h2 className={styles.subHeader}>Student Fellow Application 2025-2026</h2>
          <p className={styles.headerDescription}>
            Each Fall, we carefully select the most promising startups in various health-focused fields, each at a unique stage of development, to join our incubator. Our passionate and driven
            students play a pivotal role in helping these startups reach critical milestones and accelerate their growth. If that is you, apply today!
          </p>
        </div>

        {/* Pre-submission Work Document Notice */}
        <div className={styles.workDocumentNotice}>
          <div className={styles.workDocumentIcon}></div>
          <div className={styles.workDocumentContent}>
            <h3 className={styles.workDocumentTitle}>Prepare Your Responses</h3>
            <p className={styles.workDocumentText}>
              This Google Doc contains the essay and long-form questions for our application. 
              While official applications will be submitted through the form below, we highly recommend making a copy of this Google Doc to work on your application responses in order to keep track of your responses.
            </p>
            <p className={styles.warningText}>⚠️ This form WILL NOT save your responses if you exit the page.</p>
            <a 
              href="https://docs.google.com/document/d/18Tr6BCcLwCHfrUNKvFeskd4Ut2mJKjgmn54dA6-Swks/edit?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.workDocumentLink}
            >
              Open Application Google Doc →
            </a>
          </div>
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
                <div className={styles.dropdown} ref={classYearDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowClassYearDropdown(!showClassYearDropdown)}
                    className={styles.dropdownButton}
                  >
                    {formData.classYear 
                      ? classYearOptions.find(option => option.value === formData.classYear)?.label
                      : "Select Class Year"
                    }
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  {showClassYearDropdown && (
                    <>
                      <div className={styles.dropdownOverlay} onClick={() => setShowClassYearDropdown(false)} />
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h3 className={styles.dropdownTitle}>Select Class Year</h3>
                          <button
                            type="button"
                            onClick={() => setShowClassYearDropdown(false)}
                            className={styles.closeButton}
                          >
                            ×
                          </button>
                        </div>
                        {classYearOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`${styles.dropdownOption} ${
                              formData.classYear === option.value ? styles.selected : ''
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, classYear: option.value }));
                              setShowClassYearDropdown(false);
                            }}
                          >
                            <span className={styles.optionLabel}>{option.label}</span>
                            {formData.classYear === option.value && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
                
                {/* Display selected areas */}
                {formData.areasOfInterest.length > 0 && (
                  <div className={styles.selectedAreas}>
                    {formData.areasOfInterest.map((area) => {
                      const match = areaOptions.find((o) => o.value === area);
                      return (
                        <div key={area} className={styles.areaCard}>
                          <span className={styles.areaLabel}>{match ? match.label : area}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                areasOfInterest: prev.areasOfInterest.filter((a) => a !== area),
                              }));
                            }}
                            className={styles.removeArea}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Areas Dropdown */}
                <div className={styles.dropdown} ref={areasDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowAreasDropdown(!showAreasDropdown)}
                    className={styles.dropdownButton}
                  >
                    {formData.areasOfInterest.length === 0 
                      ? "Select Areas of Interest..." 
                      : `Selected ${formData.areasOfInterest.length} area${formData.areasOfInterest.length !== 1 ? 's' : ''}`
                    }
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  {showAreasDropdown && (
                    <>
                      <div className={styles.dropdownOverlay} onClick={() => setShowAreasDropdown(false)} />
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h3 className={styles.dropdownTitle}>Select Areas of Interest</h3>
                          <button
                            type="button"
                            onClick={() => setShowAreasDropdown(false)}
                            className={styles.closeButton}
                          >
                            ×
                          </button>
                        </div>
                        {areaOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`${styles.dropdownOption} ${
                              formData.areasOfInterest.includes(option.value) ? styles.selected : ''
                            }`}
                            onClick={() => {
                              if (formData.areasOfInterest.includes(option.value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  areasOfInterest: prev.areasOfInterest.filter((a) => a !== option.value),
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  areasOfInterest: [...prev.areasOfInterest, option.value],
                                }));
                              }
                              // Don't close dropdown immediately to allow multiple selections
                            }}
                          >
                            <span className={styles.optionLabel}>{option.label}</span>
                            {formData.areasOfInterest.includes(option.value) && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Hidden inputs for Google Forms submission */}
                {formData.areasOfInterest.map((area) => {
                  const match = areaOptions.find((o) => o.value === area);
                  return <input key={area} type="hidden" name="entry.1486721923" value={match ? match.label : area} />;
                })}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entry.291308032" className={styles.label}>
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="entry.291308032"
                  name="entry.291308032"
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
                      // For Google Forms, we just need the filename
                      setFormData((prev) => ({ ...prev, resume: selectedFile?.name || "Resume uploaded" }));
                      setCurrentFileUploaded(true); // Mark as uploaded
                  }}
                  onFileSelect={handleFileSelect}
                  acceptedFileTypes={[".pdf", ".doc", ".docx", ".zip"]}
                  maxFileSize={4}
                  label="Upload Resume"
                  placeholder="Click here to upload your resume"
                  uploadEndpoint="/api/apply-student/upload-student-supabase"
                  autoUpload={false}
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
              <div className={styles.wordCount}>
                {formData.whyHelix ? formData.whyHelix.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/100 words
              </div>
            </div>

            <div className={styles.spacerLarge}></div>

            <div className={styles.normalTextHeader}>What Have You Built?</div>

            <div className={styles.normalText}>
              Tell us about something you&apos;ve built or contributed to that had a significant impact on you or others. (50-100 words max.) <span className={styles.required}>*</span>
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
              <div className={styles.wordCount}>
                {formData.building ? formData.building.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/100 words
              </div>
            </div>

            <div className={styles.spacerLarge}></div>

            <div className={styles.normalTextHeader}>Why Are Your Future Goals?</div>

            <div className={styles.normalText}>
              Tell us about your future career goals (100 words max.) <span className={styles.required}>*</span>
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
              <div className={styles.wordCount}>
                {formData.goals ? formData.goals.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/100 words
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Long-Form Application Prompt Options (Choose One):</h3>
              <div className={styles.sectionLine}></div>
            </div>

            {/* Explanation */}
            <div className={styles.normalTextItalic}>
              Applicants are invited to select one of the following prompts to showcase their skills and creativity. Please submit your response in the requested format.
            </div>

            <div className={styles.spacer}></div>

            {/* File Size Limit Notice */}
            <div className={styles.fileLimitNotice}>

                <h4 className={styles.fileLimitTitle}>Warning: File Size Limit of 4MB</h4>
                <p className={styles.fileLimitText}>
                  We know that a lot of you will have a lot to share with us in this long-form application question and may have files larger than the supported 4MB size limit. 
                  If that is the case, please try zipping your file locally and using free online services to compress your files. 
                  If these approaches do not work, please contact us at <a href="mailto:admin@yalehelix.org" className={styles.fileLimitLink}>admin@yalehelix.org</a>.
                </p>
            </div>

            <div className={styles.spacer}></div>

            {/* Long Form Options Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Select Long-Form Option <span className={styles.required}>*</span>
              </label>
              
              {/* Clickable Description Cards */}
              <div className={styles.optionsOverview}>
                {/* Option 1 */}
                <div 
                  className={`${styles.optionDescription} ${styles.clickableOption} ${
                    formData.longFormOption === "option1" ? styles.optionSelected : ''
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, longFormOption: "option1" }));
                  }}
                >
                  <div className={styles.optionHeader}>
                    <div className={styles.normalTextHeader}>
                      <u>Option 1</u>: Demonstrate Exceptional Technical or Graphic Design Skill
                    </div>
                    {formData.longFormOption === "option1" && (
                      <span className={styles.optionCheckmark}>✓</span>
                    )}
                  </div>
                  <div className={styles.normalText}>
                    If you have advanced technical, engineering, or design skills, we invite you to submit a portfolio demonstrating your work.
                  </div>
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
                    Provide a link to your portfolio or upload a PDF or ZIP file. Include a short description (150 words max) explaining the purpose and context of your work.
                  </div>
                </div>

                <div className={styles.spacer}></div>

                {/* Option 2 */}
                <div 
                  className={`${styles.optionDescription} ${styles.clickableOption} ${
                    formData.longFormOption === "option2" ? styles.optionSelected : ''
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, longFormOption: "option2" }));
                  }}
                >
                  <div className={styles.optionHeader}>
                    <div className={styles.normalTextHeader}>
                      <u>Option 2</u>: Create a Graphical Abstract from a Scientific Article
                    </div>
                    {formData.longFormOption === "option2" && (
                      <span className={styles.optionCheckmark}>✓</span>
                    )}
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
                    Upload your graphical abstract (PDF, PNG, or JPG) and a caption explaining your visual.
                  </div>
                </div>

                <div className={styles.spacer}></div>

                {/* Option 3 */}
                <div 
                  className={`${styles.optionDescription} ${styles.clickableOption} ${
                    formData.longFormOption === "option3" ? styles.optionSelected : ''
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, longFormOption: "option3" }));
                  }}
                >
                  <div className={styles.optionHeader}>
                    <div className={styles.normalTextHeader}>
                      <u>Option 3</u>: Analyze a Market Landscape in Healthcare or Biotechnology
                    </div>
                    {formData.longFormOption === "option3" && (
                      <span className={styles.optionCheckmark}>✓</span>
                    )}
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
                      <li>A brief unlisted YouTube video link(2–3 minutes) walking us through your findings and thought process</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Input Fields Based on Selection */}
            {formData.longFormOption && (
              <div className={styles.submissionArea}>
                <div className={styles.submissionHeader}>
                  <h3 className={styles.submissionTitle}>Long-Form Submission</h3>
                  <div className={styles.submissionSubtitle}>
                    Complete the requirements for your selected option
                  </div>
                </div>
                
                
                
                {formData.longFormOption === "option1" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Submission Method <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.radioGroup}>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name="submissionMethod"
                            value="link"
                            checked={formData.submissionMethod === "link"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, submissionMethod: e.target.value as "link" | "file" }))}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioLabel}>Portfolio Link</span>
                        </label>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name="submissionMethod"
                            value="file"
                            checked={formData.submissionMethod === "file"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, submissionMethod: e.target.value as "link" | "file" }))}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioLabel}>PDF File Upload</span>
                        </label>
                      </div>
                    </div>
                    
                    {formData.submissionMethod === "link" && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Portfolio Link <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="url"
                          value={formData.longForm}
                          onChange={(e) => setFormData((prev) => ({ ...prev, longForm: e.target.value }))}
                          className={styles.input}
                          placeholder="https://"
                        />
                      </div>
                    )}
                    
                    {formData.submissionMethod === "file" && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Portfolio File (PDF or ZIP) <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.fileUploadContainer}>
                          {!formData.longFormFile && (
                            <input
                              type="file"
                              accept=".pdf,.zip"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validate file size (4MB for portfolio)
                                  const maxSizeMB = 4;
                                  if (file.size > maxSizeMB * 1024 * 1024) {
                                    setLongFormError(`File size must be less than ${maxSizeMB}MB`);
                                    return;
                                  }
                                  
                                  // Validate file type (PDF or ZIP for portfolio)
                                  const acceptedTypes = ['.pdf', '.zip'];
                                  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                                  if (!acceptedTypes.includes(fileExtension)) {
                                    setLongFormError('Portfolio file must be a PDF or ZIP');
                                    return;
                                  }
                                  
                                  // Clear any previous errors
                                  setLongFormError("");
                                  setFormData((prev) => ({ ...prev, longFormFile: file.name }));
                                  // Store the actual file for upload
                                  setLongFormFile(file);
                                }
                              }}
                              className={styles.fileInput}
                              ref={(input) => {
                                if (input) input.id = "option1-file-input";
                              }}
                            />
                          )}
                          {!formData.longFormFile ? (
                            <div className={styles.fileUploadInfo}>
                              <div className={styles.uploadIcon}>📁</div>
                              <div className={styles.fileUploadText}>
                                Click to upload PDF or ZIP
                              </div>
                              <div className={styles.fileUploadSubtext}>
                                Maximum file size: 4MB
                              </div>
                            </div>
                          ) : (
                            <div className={styles.fileInfo}>
                              <div className={styles.fileIcon}>📄</div>
                              <div className={styles.fileDetails}>
                                <p className={styles.fileName}>{formData.longFormFile}</p>
                                <p className={styles.fileSize}>{longFormFile ? formatFileSize(longFormFile.size) : ""}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, longFormFile: "" }));
                                  setLongFormFile(null);
                                  setLongFormError("");
                                  // Clear the file input
                                  const fileInput = document.getElementById("option1-file-input") as HTMLInputElement;
                                  if (fileInput) fileInput.value = "";
                                }}
                                className={styles.removeFileButton}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Error display for Option 1 */}
                    {longFormError && (
                      <p className={styles.error}>{longFormError}</p>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Description (150 words max) <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        value={formData.longFormDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, longFormDescription: e.target.value }))}
                        className={styles.textarea}
                        rows={4}
                        placeholder="Explain the purpose and context of your work..."
                      />
                      <div className={styles.wordCount}>
                        {formData.longFormDescription ? formData.longFormDescription.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/150 words
                      </div>
                    </div>
                  </>
                )}

                {formData.longFormOption === "option2" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Graphical Abstract File <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.fileUploadContainer}>
                        {!formData.longFormFile && (
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.zip"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                                                  // Validate file size (4MB for graphical abstract)
                                const maxSizeMB = 4;
                                if (file.size > maxSizeMB * 1024 * 1024) {
                                  setLongFormError(`File size must be less than ${maxSizeMB}MB`);
                                  return;
                                }
                                
                                // Validate file type (PDF, PNG, JPG, JPEG, ZIP for graphical abstract)
                                const acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.zip'];
                                const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                                if (!acceptedTypes.includes(fileExtension)) {
                                  setLongFormError(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
                                  return;
                                }
                                
                                // Clear any previous errors
                                setLongFormError("");
                                setFormData((prev) => ({ ...prev, longFormFile: file.name }));
                                // Store the actual file for upload
                                setLongFormFile(file);
                              }
                            }}
                            className={styles.fileInput}
                            ref={(input) => {
                              if (input) input.id = "option2-file-input";
                            }}
                          />
                        )}
                        {!formData.longFormFile ? (
                          <div className={styles.fileUploadInfo}>
                            <div className={styles.uploadIcon}>📁</div>
                                                          <div className={styles.fileUploadText}>
                                Click to upload PDF, PNG, JPG, or ZIP
                              </div>
                            <div className={styles.fileUploadSubtext}>
                              Maximum file size: 4MB
                            </div>
                          </div>
                        ) : (
                          <div className={styles.fileInfo}>
                            <div className={styles.fileIcon}>📄</div>
                            <div className={styles.fileDetails}>
                              <p className={styles.fileName}>{formData.longFormFile}</p>
                              <p className={styles.fileSize}>{longFormFile ? formatFileSize(longFormFile.size) : ""}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, longFormFile: "" }));
                                setLongFormFile(null);
                                setLongFormError("");
                                // Clear the file input
                                const fileInput = document.getElementById("option2-file-input") as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              className={styles.removeFileButton}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Error display for Option 2 */}
                      {longFormError && (
                        <p className={styles.error}>{longFormError}</p>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Caption Explanation <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        value={formData.longFormDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, longFormDescription: e.target.value }))}
                        className={styles.textarea}
                        rows={3}
                        placeholder="Explain your visual and its key findings..."
                      />
                    </div>
                  </>
                )}

                {formData.longFormOption === "option3" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Slide Deck (PDF or ZIP) <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.fileUploadContainer}>
                                                  {!formData.longForm && (
                            <input
                              type="file"
                              accept=".pdf,.zip"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validate file size (4MB for slide deck)
                                  const maxSizeMB = 4;
                                  if (file.size > maxSizeMB * 1024 * 1024) {
                                    setLongFormError(`File size must be less than ${maxSizeMB}MB`);
                                    return;
                                  }
                                  
                                  // Validate file type (PDF or ZIP for slide deck)
                                  const acceptedTypes = ['.pdf', '.zip'];
                                  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                                  if (!acceptedTypes.includes(fileExtension)) {
                                    setLongFormError('Slide deck must be a PDF or ZIP');
                                    return;
                                  }
                                  
                                  setFormData((prev) => ({ ...prev, longForm: file.name }));
                                  // Store the actual file for upload
                                  setLongFormFile(file);
                                }
                              }}
                              className={styles.fileInput}
                              ref={(input) => {
                                if (input) input.id = "option3-file-input";
                              }}
                            />
                          )}
                        {!formData.longForm ? (
                          <div className={styles.fileUploadInfo}>
                            <div className={styles.uploadIcon}>📁</div>
                                                          <div className={styles.fileUploadText}>
                                Click to upload PDF or ZIP slide deck
                              </div>
                            <div className={styles.fileUploadSubtext}>
                              Maximum file size: 4MB
                            </div>
                          </div>
                        ) : (
                          <div className={styles.fileInfo}>
                            <div className={styles.fileIcon}>📄</div>
                            <div className={styles.fileDetails}>
                              <p className={styles.fileName}>{formData.longForm}</p>
                              <p className={styles.fileSize}>{longFormFile ? formatFileSize(longFormFile.size) : ""}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, longForm: "" }));
                                setLongFormFile(null);
                                setLongFormError("");
                                // Clear the file input
                                const fileInput = document.getElementById("option3-file-input") as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              className={styles.removeFileButton}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Error display for Option 3 */}
                      {longFormError && (
                        <p className={styles.error}>{longFormError}</p>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Video Presentation <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.longFormFile}
                        onChange={(e) => setFormData((prev) => ({ ...prev, longFormFile: e.target.value }))}
                        className={styles.input}
                        placeholder="https://www.youtube.com/..."
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>



          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!isFormValid() || isUploading}
            >
              {isUploading ? (
                <>
                  <span className={styles.spinner}></span>
                  Submitting & Uploading Files...
                </>
              ) : (
                <>
                  Submit Application
                </>
              )}
            </button>
            <p className={styles.submitNote}>
              {isUploading 
                ? "Please wait while we submit your application and upload your files..."
                : !isFormValid() 
                  ? (
                    <>
                      Please fill in all required fields and complete your long-form submission to submit your application.<br />
                      If you encounter any issues, please feel free to contact us at.
                    </>
                  )
                  : "Your application will be submitted to Google Forms and Supabase, with files stored securely in our database."
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
