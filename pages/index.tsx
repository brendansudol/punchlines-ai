import Head from "next/head"
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"
import React, { useRef, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import TextareaAutosize from "react-textarea-autosize"
import Typist from "react-typist-component"
import {
  asyncFailedLoading,
  asyncLoaded,
  asyncLoading,
  asyncNotStarted,
  AsyncValue,
  isLoaded,
  isNotStarted,
} from "../utils/async"
import { SuggestResponse } from "../types"

const examples = ["foo", "bar", "baz", "waldo", "fred", "thud"]

export default function Home() {
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
    toast("Boom.", { icon: "🤖" })
  }

  const handleSubmit = async () => {
    setResults(asyncLoading())
    setShowCursor(true)
    try {
      const res = await fetch("/api/suggest", {
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
      const data = await res.json()
      setResults(asyncLoaded(data))
    } catch (error: any) {
      setResults(asyncFailedLoading(error))
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

      <main className="mx-auto p-4 lg:p-6 max-w-screen-sm min-h-screen">
        <h1 className="mb-1 text-3xl font-bold">🤖📝😂</h1>
        <p className="text-gray-500">
          <strong className="text-lg text-black">AI LOL</strong> is ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        </p>

        <div className="mt-8 stretch flex flex-row gap-3 lg:max-w-3xl">
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
          <React.Fragment>
            <section className="mt-12 lg:mt-16">
              <h2 className="mb-2 font-semibold tracking-tight">Example opening lines</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                {examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleExampleClick(ex)}
                  >
                    <span className="select-none">“</span>
                    {ex}
                    <span className="select-none">”</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-12 lg:mt-16">
              <h2 className="mb-2 font-bold tracking-tight">How does it work?</h2>
              <p className="text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </section>
          </React.Fragment>
        )}

        {isLoaded(results) && results.value.status === "success" ? (
          <div className="mt-12 lg:mt-16">
            <h2 className="mb-2 font-bold tracking-tight">Punchline options</h2>
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
        ) : null}

        <footer className="sticky top-[100vh] pt-6 lg:pt-10 flex flex-wrap gap-8 lg:gap-10 items-center text-xs">
          <div className="text-sm font-bold">AI LOL</div>
          <a href="#" className="lg:ml-auto hover:underline">
            Code on GitHub
          </a>
          <a href="#" className="hover:underline">
            Made by <strong>@brensudol</strong>
          </a>
        </footer>

        <Toaster position="top-right" />
      </main>
    </>
  )
}
