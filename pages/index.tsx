import Head from "next/head"
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"

const examples = ["foo", "bar", "baz", "waldo", "fred", "thud"]

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [results, setResults] = useState<any>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setResults(null)
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>AI LOL</title>
        <meta name="description" content="TODO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto p-8 max-w-screen-sm min-h-screen">
        <h1 className="mb-1 text-3xl font-bold">🤖📝😂</h1>
        <p className="text-gray-500">
          <strong className="text-lg text-black">AI LOL</strong> is ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
          ex ea commodo consequat.
        </p>

        <div className="mt-8 stretch flex flex-row gap-3 lg:max-w-3xl">
          <div className="relative flex h-full flex-1 md:flex-col">
            <div className="flex flex-col w-full pl-2 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)]">
              <TextareaAutosize
                maxRows={5}
                placeholder=""
                className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-9 focus:ring-0 focus-visible:ring-0"
                style={{ overflowY: "hidden" }}
                autoFocus={true}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 disabled:hover:bg-transparent"
                onClick={handleSubmit}
              >
                <ArrowRightCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-2 font-bold tracking-tight">Examples</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {examples.map((ex, i) => (
              <div key={i} className="rounded-lg p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer">
                {ex}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-2 font-bold tracking-tight">How does it work?</h2>
          <p className="text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>

        {/* <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
          <div class="animate-pulse flex space-x-4">
            <div class="rounded-full bg-slate-200 h-10 w-10"></div>
            <div class="flex-1 space-y-6 py-1">
              <div class="h-2 bg-slate-200 rounded"></div>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div class="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div class="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div> */}

        {/* <svg
          className="animate-spin inline-block h-5 w-5 text-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg> */}

        {results && <pre>{JSON.stringify(results, undefined, 2)}</pre>}
      </main>
    </>
  )
}
