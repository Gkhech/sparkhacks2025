import React, { useRef } from 'react';
import Dictaphone from "./Dictaphone"
import styles from "../styles/Home.module.css"
import { motion } from 'framer-motion'

const Home = () => {
  const scrollRef = useRef(null); // Reference for the element to scroll to

  const handleScroll = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.scrollContainer}>
      <section className={styles.home}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <section>
            <div className={styles.title_section}>
              <h1 className={styles.title1}>Interview Diver</h1>
              <h2 className={styles.title2}>Deep Dive on Interview Skills</h2>
              <button className={styles.title_button} onClick={handleScroll}>Start</button>
            </div>
          </section>

          {/* Content to scroll to */}
          <div ref={scrollRef} className={styles.scrollTarget}>
            <div className={styles.section2}>
              <div>
                <h1>Number of Questions</h1>
                <input type="text" />
              </div>

              <div>
                <h1>Job Title</h1>
                <input type="text" />
              </div>

              <div>
                <h1>Experience</h1>
                <input type="text" />
              </div>

              <div>
                <h1>Q Complexity</h1>
                <input type="text" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Home

