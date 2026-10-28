https://punchlines.ai/

**punchlines.ai** is an AI joke generation tool using a language model guided by selected examples of late-night comedy monologue jokes. And boy are its arms tired!

For more information on the joke dataset and model training, see [here](https://github.com/brendansudol/joke-gpt)

🤖😂

## Temporary model bridge (October 2026)

**This is a temporary fix until the new fine-tuned joke model is ready and reviewed.**
It keeps punchline generation available while the replacement fine-tuning job is pending;
the example-guided frontier model is not the intended final model.

The generator uses Chat Completions with `gpt-6.1-terra`, 80 source-traceable
setup/punchline examples, and a strict JSON response containing three alternatives.
The example bank is server-side in `lib/jokes/examples.json`.

`OPENAI_MODEL_ID` optionally selects `gpt-6.1-terra` or the evaluated
`gpt-6.1-sol`. An unset value uses Terra; an unsupported value fails explicitly.
No provider error triggers a fallback to another model.
Terra uses no reasoning and temperature 0.9; Sol uses
low reasoning without temperature. The static example prefix has a 30-minute
explicit prompt-cache breakpoint.

The existing editing, setup punctuation, 500ms loading delay, and SDK retry/timeout
defaults are preserved. Rate-limit store outages allow generation to continue as
before; an actual exhausted quota still blocks the request.

Run `pnpm test` and `pnpm build`. The evaluation and review files live in
`evaluation/interim-2026-10-28/`; start with `REPORT.md` and `review.html`.
To reproduce an evaluation with Node 22+, run:

```sh
node --env-file=.env.local scripts/evaluate-punchlines.cjs gpt-6.1-terra 80 28
```

Existing result files are resumed, not overwritten. Archive them before intentionally
rerunning a comparison. The 20/200-example comparisons use the first 10 held-out setups;
the larger bank is an evaluation fixture, not a runtime dependency.

The live verification script requires Playwright and Chrome plus the existing OpenAI,
Supabase, and Upstash environment variables. It creates and deletes a temporary user,
its profile, generated/saved jokes, and rate counters. It does not send email or create
a paid subscription. Only run it against an explicitly selected local or preview URL.
Do not point it at production.

For this interim release, production must set `OPENAI_MODEL_ID=gpt-6.1-terra`.
Preview deployments can use `vercel deploy --env OPENAI_MODEL_ID=gpt-6.1-terra`
to scope the model override to that deployment.

### Replacing the temporary fix

The replacement [fine-tuning job](https://platform.openai.com/finetune/ftjob-IykBiMohmnxvsr7wnfxZ9746)
is monitored hourly. Once it succeeds, evaluate its exact model ID on the same 28
held-out setups in `evaluation/interim-2026-10-28/setups.json`, using the original
training system prompt and three punchlines per setup. Compare humor, relevance,
variety, output failures, latency and usage against the saved interim results.

After Bren reviews that comparison, prepare and test the fine-tuned integration in a
preview before switching production. The current model allowlist and request settings
must be updated for the exact fine-tuned ID; changing the environment variable alone
is not sufficient. Do not automatically switch when training completes or silently
fall back to a base model. Remove the temporary runtime example bank when it is no
longer needed, while preserving the evaluation evidence.
