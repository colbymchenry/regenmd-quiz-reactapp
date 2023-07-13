import { useEffect, useState } from "react";
import states from "./states.json";

export default function Question(props) {

    const [answer, setAnswer] = useState(props.answer || null);

    useEffect(() => {
        if (props.setAnswer) {
            props.setAnswer(answer);
        }
    }, [answer])

    function renderPill() {
        // Make sure the options array is in the pill configuration
        if (!Array.isArray(props.options)) {
            return <span>Invalid configuration. Options must be an array.</span>
        }

        return props.options.map((string) => {
            return <button data-selected={Array.isArray(answer) && answer.includes(string)}
                className="answer pill" type="button" key={Math.random().toString()} onClick={(e) => {
                    // prevent event bubbling
                    e.stopPropagation();

                    // if this is not multiselect, just set it to an array with one value
                    if (props.multiselect === false) {
                        setAnswer([string]);
                        return;
                    }

                    // if the answer is not an array, make it so
                    if (!Array.isArray(answer)) {
                        setAnswer([]);
                    }

                    // check if array has the selected answer
                    if (Array.isArray(answer) && answer.includes(string)) {
                        // if it does filter it out
                        setAnswer((state) => state.filter((o) => o !== string));
                    } else {
                        // if it doesn't add it in
                        setAnswer((state) => [...state, string]);
                    }

                }}>{string}</button>
        });
    }

    function renderStateDropdown() {
        return (
            <select className="select" defaultValue={answer || "na"} required={props.required}
                onChange={(e) => {
                    e.stopPropagation();

                    setAnswer(e.target.value);
                }}>
                <option disabled value="na">Select state</option>
                {Object.values(states).map((stateString, index) => {
                    return <option key={stateString} value={stateString}>{stateString}</option>
                })}
            </select>
        )
    }

    function renderInputs() {
        // Make sure inputs is an array
        if (!Array.isArray(props.inputs)) {
            return <span>Invalid configuration. Inputs must be an array.</span>
        }

        // if answer isn't an array, we need it to be one down below
        if (!Array.isArray(answer)) {
            setAnswer([]);
        }

        return (
            <div className="flex flex-wrap gap-4 w-full">
                {props.inputs.map((inputConfig, index) => {
                    return (
                        <div key={`input-${index}`} className="flex flex-col flex-grow">
                            <input type={inputConfig.type || "text"}
                                pattern={inputConfig.pattern} placeholder={inputConfig.placeholder}
                                defaultValue={Array.isArray(answer) ? answer[index] : ""} className="flex-grow input"
                                onInput={(e) => {
                                    setAnswer((state) => {
                                        state[index] = e.target.value;
                                        return state;
                                    });

                                    setAnswer((state) => [...state]);
                                }}
                            />
                            {inputConfig.required ? <small className="italic text-slate-400 mt-1 ml-3">Required.</small> : null}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="question">
            {props?.title ? <h1>{props.title}</h1> : null}
            {props?.info ? <p>{props.info}</p> : null}

            <div className="answers">
                {props?.type === 'pill' ? renderPill() :
                    props?.type === 'dropdown-state' ? renderStateDropdown() :
                        props?.type === 'input' ? renderInputs() :
                            <span>Invalid configuration. Invalid type.</span>}
            </div>
        </div>
    );

}