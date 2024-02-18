import { ElementRef, useRef, useState } from "react";
import {
    Mention,
    MentionsInput,
    OnChangeHandlerFunc,
    SuggestionDataItem,
} from "react-mentions";
import "./App.css";
import defaultMentionStyles from "./defaultMentionStyles";
import defaultStyles from "./defaultStyles";

function App() {
    const [mentionInputValue, setMentionInputValue] = useState("");
    const inputRef = useRef<ElementRef<"input">>(null);
    // const [cursorPosition, setCursorPosition] = useState(0);

    const tokens: SuggestionDataItem[] = [
        { display: "Subject", id: "subject" },
        { display: "CC", id: "cc" },
        { display: "Body", id: "body" },
        { display: "From", id: "from" },
    ];

    const handleChange: OnChangeHandlerFunc = (_, newValue) => {
        setMentionInputValue(newValue);

        console.log("onChangeHandler, newValue:", newValue);
    };

    const getNearestIndexNotInToken = (
        cursorPosition: number,
        value: string
    ) => {
        // May need to add plus one here?
        const before = value.substring(0, cursorPosition);
        const beforeLastTokenOpening = before.lastIndexOf("{");
        const beforeLastTokenClosing = before.lastIndexOf("}");
        const isInsideTokenBefore =
            (cursorPosition >= beforeLastTokenOpening &&
                cursorPosition <= beforeLastTokenClosing) ||
            (cursorPosition >= beforeLastTokenOpening &&
                (beforeLastTokenClosing === -1 ||
                    beforeLastTokenOpening > beforeLastTokenClosing));

        if (isInsideTokenBefore) {
            if (
                beforeLastTokenClosing === -1 ||
                beforeLastTokenOpening > beforeLastTokenClosing
            ) {
                const currentTokenClosing = value.indexOf("}", cursorPosition);

                // Not inside a complete token
                if (currentTokenClosing === -1) {
                    return cursorPosition;
                }

                return currentTokenClosing + 1;
            }

            return beforeLastTokenClosing + 1;
        }

        return cursorPosition;
    };

    // After a token as been added, place the cursor on the index immediately after the end of the token,

    const getNearestValidIndex = (value: string, startingPosition: number) => {
        let newIndex = startingPosition;
        const regexWhitespace = /\s/;

        /**
         * Suitable characters to land on
         * 1. Whitespace not immediately surround by non-whitespace (i.e., not "a b")
         * 2. The end of a string, i.e., value[value.length]
         * 3. A whitespace character that conforms to rule #1 AND is not within a token
         * A character is within a token if its index is greater than an opening brace, but less than that brace's matching closing pair, i.e., { ^ }, where is ^ is the insertion point
         */
        for (let i = startingPosition; i <= value.length; ++i) {
            const currentChar = value[i];

            // End of string, valid
            if (currentChar === undefined) {
                newIndex = i;
                break;
            }

            // A non-whitespace character that's not the end of the string, skip
            if (!regexWhitespace.test(currentChar)) {
                continue;
            }

            if (value.length >= 3 && i > 0) {
                // Whitespace between two non-whitespace characters, skip
                if (
                    !regexWhitespace.test(value[i - 1]) &&
                    !regexWhitespace.test(value[i + 1])
                ) {
                    continue;
                }
            }

            const nearestTokenOpening = value.indexOf("{", i);
            const nearestTokenClosing = value.indexOf("}", i);
            // The token closing tag is nearer than the opening tag, so we must be inside a token; skip
            if (nearestTokenOpening > nearestTokenClosing) {
                continue;
            }

            newIndex = i;
            break;
        }

        return newIndex;
    };

    const handleAddToken = () => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        const cursorPosition = getNearestValidIndex(
            mentionInputValue,
            inputElement.selectionStart ?? 0
        );

        // let cursorPosition = getNearestIndexNotInToken(
        //     inputElement.selectionStart ?? 0,
        //     mentionInputValue
        // );

        // const regexWhitespace = /\s/;

        // for (let i = cursorPosition; i < mentionInputValue.length; ++i) {
        //     const charUnderCursor = mentionInputValue[i];
        //     if (!!charUnderCursor && !regexWhitespace.test(charUnderCursor)) {
        //         cursorPosition += 1;
        //     }
        //     // if we're in between two tokens
        //     if (
        //         !regexWhitespace.test(mentionInputValue[i - 1]) &&
        //         !regexWhitespace.test(mentionInputValue[i + 1])
        //     ) {
        //     }
        // }

        // Get text before and after cursor
        const before = mentionInputValue.substring(0, cursorPosition);
        const after = mentionInputValue.substring(
            cursorPosition,
            mentionInputValue.length
        );

        // Set the new input value, insert the @ at the location of the cursor
        const newValue = before + "@" + after;

        setMentionInputValue(newValue);

        // // requestAnimationFrame(() => {
        // const newCursorLocation = newValue.indexOf("@", cursorPosition);
        // inputElement.setSelectionRange(newCursorLocation, newCursorLocation);
        // // });

        // Focus the element
        inputElement.focus();
    };

    const handleAdd = () => {
        const currentSelection = inputRef.current?.selectionStart ?? 0;

        // setCursorPosition(currentSelection);

        console.log("handleAdd, currentSelection:", currentSelection);
    };

    console.log("Value length", mentionInputValue.length);

    return (
        <div className="container">
            <button onClick={handleAddToken}>Add Token</button>
            <label>
                Mentions Input
                <MentionsInput
                    onChange={handleChange}
                    value={mentionInputValue}
                    inputRef={inputRef}
                    style={defaultStyles}
                >
                    <Mention
                        trigger="@"
                        data={tokens}
                        markup="{__display__}"
                        style={defaultMentionStyles}
                        onAdd={handleAdd}
                    />
                </MentionsInput>
            </label>
        </div>
    );
}

export default App;
