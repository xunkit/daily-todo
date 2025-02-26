"use client";

import getTasksFromPrompt from "@/lib/gemini/getTasksFromPrompt";
import React, { FormEvent } from "react";

const AITEST = () => {
  const [prompt, setPrompt] = React.useState("");
  const [output, setOutput] = React.useState("Results:");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await getTasksFromPrompt(prompt);
    setOutput(`Results: ${result}`);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="flex-col">
        <input
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
        />
        <button type="submit">Ask AI</button>
      </form>
      <p>{output}</p>
    </>
  );
};

export default AITEST;
