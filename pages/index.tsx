import type { InferGetServerSidePropsType } from "next"
import Head from "next/head"
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"
import shuffle from "lodash.shuffle"
import React, { useRef, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import TextareaAutosize from "react-textarea-autosize"
import Typist from "react-typist-component"
import {
  asyncLoaded,
  asyncLoading,
  asyncNotStarted,
  AsyncValue,
  isLoaded,
  isLoading,
  isNotStarted,
} from "../utils/async"
import { SuggestResponse } from "../types"

const EXAMPLES = [
  "A hacker has published Kim Kardashian's financial information online.",
  "A gambler won 14 million dollars on last night’s World Series game.",
  "The founder of IKEA has stepped down.",
  "A new high school in Chicago will be named after President Obama.",
  "The other day in Nevada, a woman ran into a Subway restaurant and gave birth.",
  "According to a new study, talking after having sex just as important as sex.",
  "Facebook announced major changes to its privacy settings.",
  "An exact replica of the Titanic is scheduled to set sail in 2018.",
  "Legendary astronaut Buzz Aldrin is now single.",
  "Safety experts now say more and more car crashes are being caused by GPS devices.",
  "Netflix is testing a new feature that will allow you to hide what you’ve been watching.",
  "A new survey shows two-thirds of American adults pee in the ocean.",
]

export default function Home({
  examplePrompts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [prompt, setPrompt] = useState("")
  const [showCursor, setShowCursor] = useState(false)
  const [results, setResults] = useState<AsyncValue<SuggestResponse>>(asyncNotStarted())
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setPrompt("")
    }
  }

  const handleExampleClick = (text: string) => {
    setPrompt(text)
    buttonRef.current?.focus()
  }

  const handleSubmit = async () => {
    setResults(asyncLoading())
    setShowCursor(true)
    try {
      const res = await fetch("/api/suggest", getRequestInit(prompt))
      const data = await res.json()
      setResults(asyncLoaded(data))
    } catch (_) {
      setResults(asyncLoaded({ status: "error", reason: "unknown" }))
    }
  }

  const handleTypingDone = () => {
    setShowCursor(false)
  }

  return (
    <>
      <Head>
        <title>AI LOL</title>
        <meta
          name="description"
          content="Generate jokes with an AI model trained on 10,000 late night comedy monologue jokes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto p-4 lg:p-6 max-w-screen-sm min-h-screen">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">🤖📝😂</h1>
          <p className="text-gray-500">
            <strong className="text-lg text-black">AI LOL</strong> is ipsum dolor sit amet,
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
          </p>
        </div>

        <div className="mb-12 stretch flex flex-row gap-3 lg:max-w-3xl">
          <div className="relative flex h-full flex-1 md:flex-col">
            <div className="flex flex-col w-full pl-2 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white rounded-lg shadow-md">
              <TextareaAutosize
                rows={1}
                maxRows={5}
                placeholder=""
                className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-9 focus:ring-0 focus-visible:ring-0"
                style={{ overflowY: "hidden" }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 disabled:hover:bg-transparent"
                ref={buttonRef}
                onClick={handleSubmit}
              >
                <ArrowRightCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {isNotStarted(results) && (
          <div className="flex flex-col gap-12 lg:gap-16">
            <section>
              <h2 className="mb-2 font-semibold tracking-tight">Example opening lines:</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                {examplePrompts.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleExampleClick(ex)}
                  >
                    <span className="select-none">“</span>
                    {ex}
                    <span className="select-none">”</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-2 font-bold tracking-tight">How does it work?</h2>
              <p className="text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </section>
          </div>
        )}

        {isLoading(results) && (
          <div className="mt-12 lg:mt-16 animate-pulse">
            <div className="h-5 bg-gray-200 rounded-full w-48 lg:w-64 mb-6"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mb-8">
                <div className="h-3 bg-gray-200 rounded-full w-5/6 mb-2.5"></div>
                <div className="h-3 bg-gray-200 rounded-full w-6/6 mb-2.5"></div>
                <div className="h-3 bg-gray-200 rounded-full w-4/6 mb-2.5"></div>
              </div>
            ))}
          </div>
        )}

        {isLoaded(results) && results.value.status === "error" && (
          <div className="p-5 lg:p-7 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-bold">Sorry!</span> There was a problem generating your zingers.
            Please try again shortly.{" "}
            <span className="bg-red-200">(reason={results.value.reason || "unknown"})</span>
          </div>
        )}

        {isLoaded(results) && results.value.status === "success" && (
          <div className="mt-12 lg:mt-16">
            <h2 className="mb-2 font-bold tracking-tight">Punchline options:</h2>
            <Typist
              cursor={showCursor ? <span className="animate-blink">▋</span> : undefined}
              typingDelay={40}
              onTypingDone={handleTypingDone}
            >
              <div className="flex flex-col gap-4">
                {results.value.results.map((text, i) => (
                  <div key={i} className="whitespace-pre-line">
                    {i + 1}. {text.trim()}
                    <Typist.Delay ms={1_000} />
                  </div>
                ))}
              </div>
            </Typist>
          </div>
        )}

        <footer className="sticky top-[100vh] pt-6 md:pt-10 flex md:justify-center gap-8 text-xs">
          <a href="#" className="hover:underline">
            Code on GitHub
          </a>
          <a href="#" className="hover:underline">
            Made by <strong>@brensudol</strong>
          </a>
        </footer>

        <Toaster position="top-right" />
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const examplePrompts = shuffle(EXAMPLES).slice(0, 4)
  return { props: { examplePrompts } }
}

function getRequestInit(prompt: string) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  }
}
