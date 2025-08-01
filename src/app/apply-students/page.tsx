"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function StartupApplicationPage() {
  const router = useRouter();

  const handleReturnToMain = () => {
    router.push("/");
  };

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.headerWithNav}>
        <button onClick={handleReturnToMain} className={styles.returnButton}>
          ← Return to Homepage
        </button>
      </div>

      <div className={styles.hero}>
        <h1 className={styles.title}>Coming Soon!</h1>
        <p className={styles.subtitle}>Student Fellow Applications Open August 15th</p>
      </div>
    </div>
  );
}
