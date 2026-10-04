import { Fragment } from "react";

// Wraps each word in a clipping mask so headings can rise into view word by
// word (see the [data-split] reveals). Plain text in, plain text for readers.
export default function SplitWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word-mask">
            <span className="word">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
