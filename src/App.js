import { useEffect, useState } from 'react';
import './App.css';
import { QuizContainer } from './QuizContainer';

function App() {

  const [open, setOpen] = useState(false);

  function openQuiz() {
    setOpen(true);
  }

  function handleResize() {
    // make sure to unhide the navbar
    const navbar = document.querySelector(".section-header");
    if (navbar) {
      navbar.classList.remove("shopify-section-header-hidden");
      const quizContainer = document.querySelector(".quiz-container");
      if (quizContainer) {
        quizContainer.style.marginTop = navbar.getBoundingClientRect().height + "px";
        quizContainer.style.height = `calc(100vh - ${navbar.getBoundingClientRect().height + "px"})`;
      }
    }
  }

  useEffect(() => {
    if (open) {
      // if quiz is open disable scrolling on document
      document.body.style.overflow = "hidden";
      handleResize();
    } else {
      // if quiz is closed re-enable scrolling
      document.body.style.overflow = "auto";
    }
  }, [open]);

  useEffect(() => {
    const triggers = Array.from(document.querySelectorAll('[href="#regenquiz"]'));

    triggers.forEach((htmlElement) => {
      htmlElement.addEventListener("click", openQuiz);
    });

    return () => {
      triggers.forEach((htmlElement) => {
        htmlElement.removeEventListener("click", openQuiz);
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <QuizContainer open={open} setOpen={setOpen} />;
}

export default App;
