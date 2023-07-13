import quizJson from "./default_quiz.json";
import Question from "./Question";
import { useState, useMemo, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function QuizContainer(props) {
    const recaptchaRef = useRef(null);
    const progressBar = useRef(null);

    const [step, setStep] = useState(0);
    // each object in the answer array is a json of the question and its answers
    const [answers, setAnswers] = useState([]);

    // holds state of current answer
    const [answer, setAnswer] = useState(null);

    // holds the state of animation
    const [transitioning, setTransitioning] = useState(false);

    // holds the state of the email submission
    const [submitting, setSubmitting] = useState(false);

    const primaryBtnLabel = step === quizJson.length - 1 ? "Complete" : "Continue";

    const disablePrimaryBtn = useMemo(() => {
        if (submitting) return true;

        if (quizJson[step].type === 'input') {
            return validateInputs();
        }

        return quizJson[step].required && !answer?.length;
    }, [answer, submitting]);

    function resetQuiz() {
        props.setOpen(false);
        setSubmitting(false);
        setAnswers([]);
        setAnswer(null);
        setStep(0);
    }

    function validateInputs() {
        let disabled = false;

        quizJson[step].inputs.forEach((inputConfig, index) => {
            if (inputConfig.required === true) {
                if (Array.isArray(answer) && !answer[index]?.length) {
                    disabled = true;
                }

                if (inputConfig.type === 'email') {
                    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
                    if (Array.isArray(answer) && !emailRegex.test((answer[index] + ""))) {
                        disabled = true;
                    }
                }
            }
        });

        return disabled;
    }

    async function onPrimaryBtnClick(e) {
        e.stopPropagation();
        if (submitting) return;

        if (step === quizJson.length - 1) {

            setSubmitting(true);

            const captchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();

            let payload = quizJson.map((question, index) => {
                return {
                    label: question.title,
                    answer: Array.isArray(answers[index]) ? answers[index].join(", ") : answers[index]
                };
            });

            payload[payload.length - 1]["answer"] = Array.isArray(answer) ? answer.join(", ") : answer;

            fetch('https://regenmd-quiz-server.vercel.app/api/v1/submitquiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', captchaToken },
                body: JSON.stringify(payload)
            }).then(async (resp) => {
                let jsonResp = await resp.json();
                if (jsonResp.success === false) {
                    alert("Submission failed.");
                } else {
                    resetQuiz();
                }
            }).catch((error) => {
                alert('Submission failed.');
                console.error(error);
                setSubmitting(false);
            });
        } else {
            if (transitioning) return;
            setTransitioning(true);

            setAnswers((state) => {
                state[step] = answer;
                return state;
            });

            // wait for fade animation to complete to move to next step
            setTimeout(() => {
                setAnswer(() => answers[step + 1]);
                setStep((state) => state += 1);
                setTransitioning(false);
            }, 400);
        }
    }

    function onBackBtnClick(e) {
        e.stopPropagation();

        if (step === 0) {
            // Close the quiz
            props.setOpen(false);
        } else {
            if (transitioning) return;
            setTransitioning(true);

            setAnswers((state) => {
                state[step] = answer;
                return state;
            });

            // wait for fade animation to complete to move to next step
            setTimeout(() => {
                setAnswer(() => answers[step - 1]);
                setStep((state) => state -= 1);
                setTransitioning(false);
            }, 400);
        }
    }

    useEffect(() => {
        progressBar.current.style.width = ((step / quizJson.length) * 100) + "%";
    }, [step]);

    return (
        <div className="quiz-container" data-open={props.open}>
            <div ref={progressBar} className="progress-bar"></div>
            <div className="max-w-[1000px] w-[95vw] min-h-[80vh] max-h-[80vh] overflow-hidden p-2 flex flex-col">
                <button type="button" onClick={onBackBtnClick} className="back-btn mb-6">
                    {step === 0 ?
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    }

                    {step === 0 ? "Close" : "Back"}
                </button>
                <div className="flex-grow flex items-start md:items-center overflow-auto w-full question-container" data-transitioning={transitioning}>
                    <Question key={step} {...quizJson[step]} answer={answer} setAnswer={setAnswer} />
                </div>
                <button type="button" onClick={onPrimaryBtnClick} className="primary-btn mt-12 flex items-center justify-center gap-3 !p-0 min-h-[4.25rem] font-bold !px-6 cursor-pointer w-full sm:w-auto sm:min-w-[300px]" disabled={disablePrimaryBtn}>
                    {submitting ?
                        <span className="animate-spin w-[1.5rem] h-[1.5rem]">
                            <svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%"><path d="M480-80q-84 0-157-31t-127-85q-54-54-85-127T80-480q0-84 31-157t85-127q54-54 127-85t157-31q12 0 21 9t9 21q0 12-9 21t-21 9q-141 0-240.5 99.5T140-480q0 141 99.5 240.5T480-140q141 0 240.5-99.5T820-480q0-12 9-21t21-9q12 0 21 9t9 21q0 84-31 157t-85 127q-54 54-127 85T480-80Z" /></svg>
                        </span>
                        : null}
                    {primaryBtnLabel}
                </button>
            </div>

            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LdOgxwnAAAAAOT8F_56k_YrNerShL758f-eOrgq"
                size="invisible"
            />
        </div>
    )

}