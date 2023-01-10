import Head from "next/head"
import { Inter } from "@next/font/google"
import { useState } from "react"
import styles from "../styles/Home.module.css"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [results, setResults] = useState<any>(null)

  const handleSubmit = async () => {
    setResults(null)
    const res = await fetch("/api/suggest", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setResults(data)
  }

  return (
    <>
      <Head>
        <title>TODO</title>
        <meta name="description" content="TODO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button onClick={handleSubmit}>submit</button>
        {results && <pre>{JSON.stringify(results, undefined, 2)}</pre>}
      </main>
    </>
  )
}
