// src/app/page.js
import Image from "next/image";
import Header from "./components/Header"; // импортируем Header
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header /> 

    </main>
  );
}
