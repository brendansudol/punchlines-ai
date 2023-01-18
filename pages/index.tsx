import type { InferGetServerSidePropsType } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { ArrowPathIcon } from "@heroicons/react/20/solid"
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"
import React, { useRef, useState } from "react"
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
import { getRandomExamples } from "../utils/data"

export default function Home({
  initialExamples,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [prompt, setPrompt] = useState("")
  const [showCursor, setShowCursor] = useState(false)
  const [examples, setExamples] = useState(initialExamples)
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

  const handleRefreshExamples = () => {
    setExamples(getRandomExamples())
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
        <title>punchlines.ai</title>
        <meta
          name="description"
          content="Generate jokes with an AI model trained on 10,000 late night comedy monologue jokes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto p-4 lg:p-6 max-w-screen-sm min-h-screen">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Image src="/logo.svg" alt="Vercel Logo" width={40} height={37} priority={true} />
            <Link
              href="/"
              className="text-2xl leading-none font-bold tracking-tight hover:underline"
            >
              punchlines<span className="text-cyan-500">.</span>ai
            </Link>
          </div>
          <p>
            Meet your new comedy writing partner. You provide a joke set-up, and the AI generates
            the zingers.
          </p>
        </div>

        <div className="mb-12 stretch flex flex-row gap-3 lg:max-w-3xl">
          <div className="relative flex h-full flex-1 md:flex-col">
            <div className="flex flex-col w-full pl-2 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white rounded-lg shadow-md">
              <TextareaAutosize
                rows={1}
                maxRows={5}
                placeholder="Add opening line..."
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
          <div className="flex flex-col gap-12 lg:gap-14">
            <section>
              <div className="flex items-baseline justify-between">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
                  Example opening lines:
                </h2>
                <button
                  className="flex items-center p-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
                  onClick={handleRefreshExamples}
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                {examples.map((ex, i) => (
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
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">How does it work?</h2>
              <p>
                <strong>punchlines.ai</strong> is an AI joke generation tool built on top of
                OpenAI’s GPT-3 language model. It was fine-tuned on ten thousand late night comedy
                monologue jokes. And boy are its arms tired!
              </p>
            </section>
          </div>
        )}

        {isLoading(results) && (
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded-full w-48 lg:w-64 mb-5"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-5 p-4 border border-2 border-gray-200 rounded-lg">
                <div className="h-3 bg-gray-200 rounded-full w-5/6 mb-2.5"></div>
                <div className="h-3 bg-gray-200 rounded-full w-6/6 mb-2.5"></div>
                <div className="h-3 bg-gray-200 rounded-full w-4/6"></div>
              </div>
            ))}
          </div>
        )}

        {isLoaded(results) && results.value.status === "error" && (
          <div className="p-5 lg:p-7 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-bold">Sorry!</span> There was a problem generating your joke
            punchlines. Please try again shortly.
            <br />
            <span className="bg-red-200">(reason={results.value.reason || "unknown"})</span>
          </div>
        )}

        {isLoaded(results) && results.value.status === "success" && (
          <div className="mt-12 lg:mt-16">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Punchline options:</h2>
            <Typist
              cursor={showCursor ? <span className="animate-blink">▋</span> : undefined}
              typingDelay={40}
              onTypingDone={handleTypingDone}
            >
              <div className="flex flex-col gap-4">
                {results.value.results.map((text, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-lg whitespace-pre-line"
                  >
                    {text}
                    <Typist.Delay ms={1_000} />
                  </div>
                ))}
              </div>
            </Typist>
          </div>
        )}

        <footer className="sticky top-[100vh] pt-6 md:pt-10 flex md:justify-center gap-8 text-xs">
          <a href="https://github.com/brendansudol/ai-lol" className="hover:underline">
            Code on GitHub
          </a>
          <a href="https://twitter.com/brensudol" className="hover:underline">
            Made by <strong>@brensudol</strong>
          </a>
        </footer>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      initialExamples: getRandomExamples(),
    },
  }
}

function getRequestInit(prompt: string) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  }
}
