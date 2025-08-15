"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function StartupApplicationSuccessPage() {
  const router = useRouter();

  const handleReturnToMain = () => {
    // Use window.location to ensure full page reload for animations
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
        
        <h1 className={styles.title}>Thank You For Your Interest in Yale Helix!</h1>
        
        <p className={styles.subtitle}>
        {'Thank you for your interest in the Yale Helix Incubator. We\'ve received your contact information and will be in touch soon. Student fellow applications open August 15th!'}
        </p>

        <div className={styles.contactInfo}>
          <h2 className={styles.contactTitle}>Questions?</h2>
          <p className={styles.contactText}>
            {'If you have any additional questions about your application or the incubator program, please don\'t hesitate to reach out to us at '}
            <a href="mailto:admin@yalehelix.org" className={styles.emailLink}>
              admin@yalehelix.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 