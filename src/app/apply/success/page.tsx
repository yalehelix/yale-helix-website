"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function StartupApplicationSuccessPage() {
  const router = useRouter();

  const handleReturnToMain = () => {
    router.push("/");
  };

  const handleViewPortfolio = () => {
    router.push("/#portfolio");
  };

  return (
    <div className={styles.successPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.successContent}>
        
        <h1 className={styles.title}>Application Submitted Successfully!</h1>
        
        <p className={styles.subtitle}>
          Thank you for your interest in the Yale Helix Incubator. We've received your startup application and will review it carefully.
        </p>

        

        <div className={styles.contactInfo}>
          <h2 className={styles.contactTitle}>Questions?</h2>
          <p className={styles.contactText}>
            If you have any questions about your application or the incubator program, 
            please don't hesitate to reach out to us at{" "}
            <a href="mailto:admin@yalehelix.org" className={styles.emailLink}>
              admin@yalehelix.org
            </a>
          </p>
        </div>

      </div>
    </div>
  );
} 