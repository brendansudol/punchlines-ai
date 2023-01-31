import classNames from "classnames"
import type { InferGetServerSidePropsType } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { Popover } from "@headlessui/react"
import { ArrowPathIcon } from "@heroicons/react/20/solid"
import { ArrowRightCircleIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid"
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

  const handleClearResults = () => {
    setPrompt("")
    setResults(asyncNotStarted())
  }

  const handleCopy = (joke: string) => () => {
    navigator.clipboard.writeText(joke)
  }

  return (
    <>
      <Head>
        <title>punchlines.ai :: GPT joke writing</title>
        <meta
          name="description"
          content="Meet your new AI comedy writing partner — you provide a joke set-up, and it generates the zingers. The AI was built using GPT language models and fine-tuned with over ten thousand late night comedy monologue jokes."
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
            Meet your new AI comedy writing partner. You provide a joke set-up, and it generates the
            zingers.
          </p>
        </div>

        <div className="mb-12 lg:mb-14 stretch flex flex-row gap-3 lg:max-w-3xl">
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
                disabled={prompt.length === 0}
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
                <Button isSmall={true} onClick={handleRefreshExamples}>
                  <ArrowPathIcon className="w-4 h-4" />
                </Button>
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
                OpenAI’s GPT-3 language models. It was fine-tuned on ten thousand late night comedy
                monologue jokes. And boy are its arms tired!
              </p>
            </section>
          </div>
        )}

        {isLoading(results) && (
          <div className="animate-pulse">
            <div className="mb-3 h-5 bg-gray-200 rounded-full w-48 lg:w-64"></div>
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
            <span className="font-bold">Whoops!</span> {getErrorMessage(results.value.reason)}
          </div>
        )}

        {isLoaded(results) && results.value.status === "success" && (
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Punchline options:</h2>
            <Typist
              cursor={showCursor ? <span className="cursor animate-blink">▋</span> : undefined}
              typingDelay={40}
              onTypingDone={handleTypingDone}
            >
              <div className="flex flex-col gap-4">
                {results.value.results.map((punchline, i, arr) => {
                  const prompt = (results.value as SuggestResponse.Success)?.prompt ?? ""
                  const fullJoke = `${prompt} ${punchline}`.trim()

                  return (
                    <div key={i} className="relative p-4 border border-gray-200 rounded-lg">
                      <div className="whitespace-pre-line pr-4">
                        {i + 1}. {punchline}
                        {i < arr.length - 1 && <Typist.Delay ms={1_000} />}
                      </div>
                      <Typist.Paste>
                        <div className="more-menu-container absolute top-1 right-1">
                          <Popover className="relative inline-block">
                            <Popover.Button className="flex p-0.5 text-gray-500 rounded-md hover:bg-gray-100">
                              <EllipsisHorizontalIcon className="w-5 h-5" />
                            </Popover.Button>
                            <Popover.Panel className="absolute right-0 z-10 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                              <div className="grid grid-cols-1 divide-y divide-gray-100 text-xs">
                                <Popover.Button
                                  className="px-4 py-2 w-full text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                  onClick={handleCopy(fullJoke)}
                                >
                                  Copy joke text
                                </Popover.Button>
                                <Popover.Button
                                  className="px-4 py-2 w-full text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                  as="a"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={makeTweetUrl(fullJoke)}
                                >
                                  Share on Twitter
                                </Popover.Button>
                              </div>
                            </Popover.Panel>
                          </Popover>
                        </div>
                      </Typist.Paste>
                    </div>
                  )
                })}
              </div>
            </Typist>
            {!showCursor && (
              <div className="mt-4 flex gap-2">
                <Button onClick={handleClearResults}>Clear results</Button>
                <Button onClick={handleSubmit}>Submit again</Button>
              </div>
            )}
          </div>
        )}

        <footer className="sticky top-[100vh] pt-6 md:pt-10 flex md:justify-center gap-8 text-xs">
          <a href="https://twitter.com/brensudol" className="hover:underline">
            Made by <strong>@brensudol</strong>
          </a>
          <a href="https://github.com/brendansudol/punchlines-ai" className="hover:underline">
            Code on GitHub
          </a>
        </footer>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      key: Date.now(), // so that state resets when clicking header link to refresh
      initialExamples: getRandomExamples(),
    },
  }
}

function Button({
  children,
  isSmall = false,
  onClick,
}: {
  children: React.ReactNode
  isSmall?: boolean
  onClick?: () => void
}) {
  return (
    <button
      className={classNames(
        "flex items-center text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300",
        isSmall ? "p-1" : "py-1 px-2"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function getErrorMessage(reason: SuggestResponse.Error["reason"]): string {
  switch (reason) {
    case "prompt-too-short":
      return "Please enter a longer joke set-up and try again. A complete sentence works best."
    case "prompt-too-long":
      return "Please enter a shorter joke set-up and try again. A single sentence works best."
    case "profanity":
      return "Let's keep it clean, folks. Think Jim Gaffigan or Nate Bargatze."
    case "rate-limit-user":
      return "You've reached the joke submission limit for now. Please try again in a couple hours."
    case "rate-limit-global":
      return "punchlines.ai is at capacity right now. Please try again shortly."
    case "unknown":
    default:
      return "There was a problem generating your punchlines. Please try again shortly."
  }
}

function getRequestInit(prompt: string) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  }
}

function makeTweetUrl(joke: string) {
  const url = window.location.origin
  const params = new URLSearchParams({ text: joke, url }).toString()
  return `https://twitter.com/intent/tweet?${params}`
}
