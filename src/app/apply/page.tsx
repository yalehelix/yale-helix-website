"use client";

import styles from "./page.module.css";

export default function StudentApplicationClosedPage() {
  const handleReturnToMain = () => {
    window.location.href = "/";
  };

  return (
    <div className={styles.successPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.successContent}>
        
        <h1 className={styles.title}>Applications Closed</h1>
        
        <p className={styles.subtitle}>
          {"Thank you for your interest in the Yale Helix Incubator. The student fellow application is currently closed. Please check back for future application cycles."}
        </p>

        <div className={styles.contactInfo}>
          <h2 className={styles.contactTitle}>Questions?</h2>
          <p className={styles.contactText}>
            {"If you have any additional questions about the student fellow program, please reach out to us at "}
            <a href="mailto:admin@yalehelix.org" className={styles.emailLink}>
              admin@yalehelix.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


