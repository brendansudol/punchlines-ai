# Interim punchline generator review

Prepared October 28, 2026. This report records the pre-release evaluation.
Bren subsequently approved opening a PR, merging it, and releasing the interim fix.
The model is a temporary bridge until the new fine-tuned model is ready and reviewed.

Current preview: https://punchlines-663rldr20-zigzagzig.vercel.app

Review follow-ups restored daily/today wording, editing during generation,
setup punctuation, the existing OPENAI_MODEL_ID configuration name, the original
loading delay, SDK retry/timeout defaults, and generation during rate-store outages.
The model, example bank, and evaluated generation settings are unchanged.

The Vercel CLI briefly updated the shared model setting across environments despite
being invoked with `preview`. Its original value was restored and independently
verified through the single-variable API. The current preview uses a deployment-only
model override; the live production deployment was not changed.

## Recommendation

Use **GPT-6.1 Terra with 80 curated real examples** as the interim default.
The provisional review preferred Terra on 14 setups and Sol on 14; this is a
subjective, unblinded assessment by Codex, not a measured tie in human preference.
Terra's lower latency and cost make it the more practical starting point. Bren's
judgment should determine whether Sol's occasional stronger twists justify switching.

Open `review.html` for a comparison with model names initially hidden and randomized
A/B order. It contains all 28 setups, allows local preference ratings, and exports
those ratings as JSON. No ratings are sent automatically. Detailed provisional notes
are in `provisional-review.json`; raw requests' outputs and usage are in the JSONL files.

## Method

- 28 newly written setups were checked against all 4,999 source training rows after
  punctuation/case normalization: zero matches. These are mostly everyday life,
  workplace, consumer technology, travel, and relationships; they do not establish
  performance on political/news jokes or all possible user input.
- 80 original pairs were selected for compactness, variety and fewer dated references.
  Their text is unchanged, with one-based source row IDs and a source SHA-256 in
  `lib/jokes/examples.json`. They are historical joke examples, not factual assertions.
- Both models used the same instructions, examples and strict three-string JSON schema.
  Sol used low reasoning; Terra used no reasoning and temperature 0.9. This compares
  candidate app configurations, not a controlled comparison of model weights alone.
- One initial request per condition established the cache; subsequent requests used
  two workers. Timing measures the complete API call from this machine, not the app's
  typewriter animation or a production load test.
- Both models also ran with 20 and 200 examples on the first 10 held-out setups.
  The 20-example set is a subset of the 80; the 200-example set preserves the 80 as
  its prefix. One stochastic sample per condition is too small to establish an optimum.

## Main comparison: 80 examples

| Measure | GPT-6.1 Sol | GPT-6.1 Terra |
| --- | ---: | ---: |
| Setups / punchlines | 28 / 84 | 28 / 84 |
| Median API latency | 3.85 s | 2.27 s |
| p95 API latency (small sample) | 7.13 s | 2.87 s |
| First uncached request | 5.03 s | 2.65 s |
| Input tokens across run | 101,067 | 101,067 |
| Cached input tokens | 96,957 | 96,984 |
| Cache-write tokens | 3,591 | 3,592 |
| Output tokens | 2,120 | 1,685 |
| Estimated run cost | $0.0409 | $0.0183 |
| Estimated average request cost | $0.00146 | $0.00065 |

Across **96 API calls and 288 punchlines** (including all example-count comparisons):
zero request errors, empty outputs, truncations, normalized exact setup repetitions,
or normalized exact copies of a training punchline. These checks do not establish
semantic novelty or eliminate repetition of comic ideas.

Cost estimates use the returned token counts, including cache writes, and the
[official standard API pricing](https://developers.openai.com/api/docs/pricing) read
on October 28, 2026. They exclude taxes and hosting/storage. They are not invoice
figures. The high cache hit rate reflects a short consecutive evaluation; an isolated
Terra request writing the 80-example prefix is about $0.0049, while a warm request is
roughly $0.0005. Real traffic and cache lifetime affect the blend.

## Humor, relevance and variety

Both configurations usually stay on topic and offer recognizable punchlines.
Terra is generally concise and coherent; some options are obvious or variations on
one mechanism. Sol sometimes supplies more surprising turns but also more strained
connections and occasional awkward wording.

Examples for Bren to judge:

- **Setup:** “Our office replaced the suggestion box with an AI chatbot.”
  **Terra:** “I suggested a raise. It generated a picture of me getting one.”
- **Setup:** “My parents joined the family group chat and immediately made rules.”
  **Sol:** “Now I have to knock before opening it.”
- **Setup:** “My calendar app scheduled time for me to be spontaneous.”
  **Terra:** “I had to cancel. Something unexpected came up.”
- **Setup:** “A supermarket started selling pre-peeled bananas in plastic boxes.”
  **Sol:** “Finally, a banana you need scissors to open.”

Representative weaknesses: Terra's meeting setup produces both a follow-up meeting
and a weekly meeting, which are close ideas. Its robot-vacuum “we both spend all day
under the desk” is familiar and slightly forced. Sol's gardening response includes
“My first tomato cost $ eighty—sorry, I’m still too upset to type numbers,” which is
awkward and mentions typing. Sol's founder-water “overcome carbonation” line is strained.
No humor score should be treated as a reliable prediction of Bren's preference.

## Example count

| Model | Examples | Setups | Median latency | Estimated cost/request |
| --- | ---: | ---: | ---: | ---: |
| Terra | 20 | 10 | 2.04 s | $0.00049 |
| Terra | 80 | 28 | 2.27 s | $0.00065 |
| Terra | 200 | 10 | 2.21 s | $0.00180 |
| Sol | 20 | 10 | 3.80 s | $0.00146 |
| Sol | 80 | 28 | 3.85 s | $0.00146 |
| Sol | 200 | 10 | 3.77 s | $0.00407 |

The 200-example variants did not show a clear quality gain in manual inspection.
Twenty examples also worked reasonably well. Eighty is a provisional choice that
provides a broader range of demonstrations for modest additional warm-cache cost;
it is not an experimentally proven optimum. The 80-example aggregate uses more
requests and thus amortizes its initial cache write more heavily than the other runs.

## App changes and verification

The route makes one Chat Completions request, returns the existing `results: string[]`
contract, and validates three nonempty, distinct, complete outputs before persistence.
It rejects invalid configuration rather than selecting another model on failure.
The default is Terra; the existing `OPENAI_MODEL_ID` variable selects the model.
Local configuration and the evaluated preview deployment explicitly select
`gpt-6.1-terra`. The approved production release must use that same model; its
deployment status is recorded separately from this pre-release evaluation.

Loading prevents duplicate submissions while the input remains editable.
Setups without ending punctuation receive a period before being sent to the model.
The original 500ms loading delay and SDK retry/timeout defaults are restored.
Malformed/invalid inputs return 400. Provider rate limits return the capacity error;
provider outages/invalid outputs return 500. If the rate-limit store is unavailable,
generation continues as it did originally. Database-save failure preserves the
generated text while showing a warning.
The UI description now accurately describes prompting with examples.

Validation completed:

- Eleven automated tests cover the request parameters, output contract, no fallback,
  validation, provider rate limiting, continuing through rate-store outages, failed
  persistence, the existing model configuration name, and setup punctuation.
- TypeScript and optimized Next.js build pass. Existing Next.js experimental-feature,
  Browserslist-data, and Node deprecation warnings remain.
- Local and preview browser flows verified real generation, three rendered outputs,
  loading/duplicate-submit protection, database persistence, saved favorites, `/saved`,
  and the saved-joke share page.
- A disposable user's rate counter was set to seven to verify the eighth request
  succeeds and the next returns 429 with the correct UI. Only the disposable user's
  counter was seeded; existing counters were never reset.
- Invalid-input UI recovery was tested against the real route. A controlled 503 browser
  response tested the outage UI on the original previews; the restored behavior uses
  a controlled 500. Provider error mapping was tested with SDK error fixtures.
- Browser page-error collection was empty. Temporary accounts, public profiles, generated
  and saved records, and their rate counters were removed after verification.

The live checks use the project's existing shared preview database. No schema changes,
paid subscriptions, emails, or production deployments were performed. A separate
signed-out browser check verified three rendered results, anonymous persistence, and
the sign-in prompt when saving. Its test row was removed and the IP counter left intact.
Paid subscription bypass was not exercised with a live subscription.

Current restoration evidence: `restored-local-verification.json` and
`restored-preview-verification.json`. Earlier evidence: `local-verification.json`,
`final-preview-verification.json`,
`anonymous-verification.json`, `final-preview-results.png`,
`final-preview-rate-limit.png`, and `metrics.json`. The earlier preview is also recorded
in `preview-verification.json`. Final preview checks and cleanup all passed.

## Fine-tuning follow-up

Hourly monitoring remains active. When the queued fine-tune finishes, evaluate it with
its original system prompt on these same 28 setups, then compare with this baseline.
The monitor was updated to preserve the interim implementation and prepare that
comparison instead of automatically replacing it. Bren has approved production release
of this temporary fix. Switching to the new fine-tuned model still requires review of
the comparison and a tested preview; training completion alone does not trigger a switch.
