"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function StudentLandingPage() {
  const router = useRouter();

  const handleReturnToMain = () => {
    window.location.href = "/";
  };

  const handleApplyClick = () => {
    router.push("/apply");
  };

  const handleInterestFormClick = () => {
    router.push("/interest-form");
  };

  return (
    <div className={styles.studentLandingPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.landingContent}>
        {/* Header */}
        <div className={styles.landingHeader}>
          <h1 className={styles.mainHeader}>Join Yale Helix</h1>
          <p className={styles.headerDescription}>
            Apply to our student fellowship program and fill out our interest form to stay informed about future opportunities.
          </p>
        </div>

        {/* Options Cards */}
        <div className={styles.optionsContainer}>
          {/* Apply Option */}
          <div className={styles.optionCard} onClick={handleApplyClick}>
            <div className={styles.optionIcon}>
              <i className="bi bi-person-plus"></i>
            </div>
            <div className={styles.optionContent}>
              <h3 className={styles.optionTitle}>Student Fellowship Application</h3>
              <p className={styles.optionDescription}>
                Ready to join our incubator program? Submit your application for the 2025-2026 academic year. 
                This comprehensive application includes questions about your background, interests, and a long-form 
                submission showcasing your skills and creativity.
              </p>
              <div className={styles.optionAction}>
                <span className={styles.actionText}>Start Application</span>
                <span className={styles.actionArrow}>→</span>
              </div>
            </div>
          </div>

          {/* Interest Form Option */}
          <div className={styles.optionCard} onClick={handleInterestFormClick}>
            <div className={styles.optionIcon}>
              <i className="bi bi-envelope-heart"></i>
            </div>
            <div className={styles.optionContent}>
              <h3 className={styles.optionTitle}>Interest Form</h3>
              <p className={styles.optionDescription}>
                Not ready to apply yet, but want to stay connected? Fill out our interest form to receive updates 
                about future opportunities, events, and announcements. Perfect for students who want to learn more 
                before committing to a full application.
              </p>
              <div className={styles.optionAction}>
                <span className={styles.actionText}>Complete Interest Form</span>
                <span className={styles.actionArrow}>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
