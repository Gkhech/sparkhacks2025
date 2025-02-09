import React, { useRef } from 'react';
import styles from "../styles/Home.module.css"
import { motion } from 'framer-motion'
import Dictaphone from './Dictaphone';

const Home = () => {
  const scrollRef = useRef(null); // Reference for the element to scroll to

  const handleScroll = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollSubmit = useRef(null);
  const handleSubmit = () => {
    scrollSubmit.current?.scrollIntoView({ behavior: "smooth" });
  }

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
        </motion.div>

        {/* Content to scroll to */}
        <div ref={scrollRef} className={styles.scrollTarget}>
          <h1 className={styles.metadata}>Interview Options</h1>
          <div className={styles.section2}>
            <br />
            <div className={styles.combo}>
              <h1>Job Title:</h1>
              <input type="text" />
            </div>
            <br />
            <div className={styles.combo}>
              <h1>Experience:</h1>
              <select>
                <option value="Entry-level">Entry-level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <br />
            <div className={styles.combo}>
              <h1># of Questions:</h1>
              <select>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <br />
            <div className={styles.combo}>
              <h1>Complexity:</h1>
              <select>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <button className={styles.submit_meta} onClick={handleSubmit} >Submit</button>
        </div>


        {/* New content to scroll to */}
        <div ref={scrollSubmit} className={styles.questions}>
          <Dictaphone />
        </div>

      </section>
    </div>
  )
}

export default Home

