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
    const [markupValue, setMarkupValue] = useState("");
    const inputRef = useRef<ElementRef<"input">>(null);
    const [selectionStart, setSelectionStart] = useState(0);

    const tokens: SuggestionDataItem[] = [
        { display: "Subject", id: "subject" },
        { display: "CC", id: "cc" },
        { display: "Body", id: "body" },
        { display: "From", id: "from" },
    ];

    // After a token as been added, place the cursor on the index immediately after the end of the token,

    // const getNearestValidIndex = (value: string, startingPosition: number) => {
    //     let newIndex = startingPosition;
    //     const regexWhitespace = /\s/;

    //     /**
    //      * Suitable characters to land on
    //      * 1. Whitespace not immediately surround by non-whitespace (i.e., not "a b")
    //      * 2. The end of a string, i.e., value[value.length]
    //      * 3. A whitespace character that conforms to rule #1 AND is not within a token
    //      * A character is within a token if its index is greater than an opening brace, but less than that brace's matching closing pair, i.e., { ^ }, where is ^ is the insertion point
    //      */
    //     for (let i = startingPosition; i <= value.length; ++i) {
    //         const currentChar = value[i];

    //         // End of string, valid
    //         if (currentChar === undefined) {
    //             newIndex = i;
    //             break;
    //         }

    //         // A non-whitespace character that's not the end of the string, skip
    //         if (!regexWhitespace.test(currentChar)) {
    //             continue;
    //         }

    //         if (value.length >= 3 && i > 0) {
    //             // Whitespace between two non-whitespace characters, skip
    //             if (
    //                 !regexWhitespace.test(value[i - 1]) &&
    //                 !regexWhitespace.test(value[i + 1])
    //             ) {
    //                 continue;
    //             }
    //         }

    //         const nearestTokenOpening = value.indexOf("{", i);
    //         const nearestTokenClosing = value.indexOf("}", i);
    //         // The token closing tag is nearer than the opening tag, so we must be inside a token; skip
    //         if (nearestTokenOpening > nearestTokenClosing) {
    //             continue;
    //         }

    //         newIndex = i;
    //         break;
    //     }

    //     return newIndex;
    // };

    const mapPlainTextIndex = (index: number) => {
        const regexToken = /{.*?}/gm;

        let offset = 0;

        // We're at the beginning, which maps exactly
        if (index === 0) {
            return { index, offset };
        }

        // We're at the end, which maps exactly
        if (index >= markupValue.length) {
            return { index: markupValue.length, offset };
        }

        // If we're inside a tag, add one to account for the opening tag
        // Do we need to jump to the end of the token we're inside?
        const nextClosingTag = markupValue.indexOf("}", index);
        const nextOpeningTag = markupValue.indexOf("{", index);
        if (nextClosingTag !== -1 && nextClosingTag < nextOpeningTag) {
            offset += 1;
            index += offset;
        }

        // Offset by the number of complete tags before the index
        const before = markupValue.slice(0, index);
        offset += (before.match(regexToken)?.length ?? 0) * 2;

        index += offset;

        return {
            index: Math.min(index, markupValue.length),
            offset,
        };
    };

    const handleAddToken = () => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        const { index: markupIndex, offset } =
            mapPlainTextIndex(selectionStart);

        // const cursorPosition = getNearestValidIndex(
        //     markupValue,
        //     inputElement.selectionStart ?? 0
        // );

        // Get text before and after cursor
        const before = markupValue.substring(0, markupIndex);
        const after = markupValue.substring(markupIndex, markupValue.length);

        // Set the new input value, insert the @ at the location of the cursor
        const newValue = before + "@" + after;

        setMarkupValue(newValue);

        requestAnimationFrame(() => {
            // Need to map back to plain text index to set cursor location
            const newCursorLocation = markupIndex - offset + 1;
            inputElement.setSelectionRange(
                newCursorLocation,
                newCursorLocation
            );
            // inputElement.dispatchEvent(new Event("select"));
        });

        // Focus the element
        inputElement.focus();
    };

    const handleChange: OnChangeHandlerFunc = (
        _,
        markupValue,
        plainTextValue
    ) => {
        setMarkupValue(markupValue);

        console.log("onChangeHandler, markupValue:", markupValue);
        console.log("onChangeHandler, plainTextValue:", plainTextValue);

        console.log("onChangeHandler, markupValue.length:", markupValue.length);
        console.log(
            "onChangeHandler, plainTextValue.length:",
            plainTextValue.length
        );
    };

    const handleSelect = () => {
        const selectionStart = inputRef.current?.selectionStart ?? 0;

        setSelectionStart(selectionStart);
        console.log("selectionStart:", selectionStart);
    };

    return (
        <div className="container">
            <button onClick={handleAddToken}>Add Token</button>
            <label>
                Mentions Input
                <MentionsInput
                    onChange={handleChange}
                    value={markupValue}
                    inputRef={inputRef}
                    style={defaultStyles}
                    onSelect={handleSelect}
                >
                    <Mention
                        trigger="@"
                        data={tokens}
                        markup="{__display__}"
                        style={defaultMentionStyles}
                    />
                </MentionsInput>
            </label>
        </div>
    );
}

export default App;
