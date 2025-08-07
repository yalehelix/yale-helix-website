"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function StartupApplicationPage() {
  const router = useRouter();

  const handleReturnToMain = () => {
    router.push("/");
  };

  const handleInterestForm = () => {
    router.push("/interest-form");
  };

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Coming Soon!</h1>
          <p className={styles.subtitle}>Student Fellow Applications Open August 15th</p>
        </div>

        <div className={styles.interestSection}>
          <div className={styles.interestCard}>
            <h2 className={styles.interestTitle}>Interested?</h2>
            <p className={styles.interestText}>
              While you wait for applications to open, sign up for our mailing list and let us know about your interests! 
            </p>
            <button onClick={handleInterestForm} className={styles.interestButton}>
              Interest Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
