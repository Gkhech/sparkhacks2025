import Dictaphone from "./Dictaphone"
import styles from "../styles/Home.module.css"
import { motion } from 'framer-motion'

const Home = () => {
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
              <button className={styles.title_button}>Test</button>
            </div>
          </section>

          <Dictaphone />
        </motion.div>
      </section>


    </div>
  )
}

export default Home
