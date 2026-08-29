# Text Classification, the Old-School Way

*2026-08-29*

AI is everywhere in 2026, and almost any current LLM can do a decent job of text classification. Give it a list of labels, an abstract, and a clear prompt, and it will usually return something plausible.

But “usually plausible” is not always the right objective. Some classification problems are narrow, stable, and repeated millions of times. In that setting it is worth measuring the errors, controlling the data, and trading a little training work for cheaper and faster inference.

I tried that with research papers: use an arXiv abstract as input and predict one or more broad subject areas.

The code, experiment manifests, and API are in the [project repository](https://github.com/ilia-iliev/abstract_classification). The final models are available on [Hugging Face](#running-the-model).

## The task

The source was the Cornell arXiv metadata snapshot. It contained 3,141,764 records. I mapped arXiv's detailed categories into five broad labels:

- biology
- chemistry
- computer science
- physics
- social sciences

Mathematics and unrelated categories were excluded. That left 2,644,107 usable records.

This is a multi-label problem. A paper can be primarily about physics and cross-listed in chemistry, for example. Most mapped papers had one label, but 142,928 had two or more.

The data was also heavily imbalanced:

| Label | Records | Share of mapped records |
|---|---:|---:|
| Biology | 56,300 | 2.13% |
| Chemistry | 27,879 | 1.05% |
| Computer science | 1,004,051 | 37.97% |
| Physics | 1,591,437 | 60.19% |
| Social sciences | 114,107 | 4.32% |

The percentages exceed 100% because labels can overlap. This imbalance is why I used macro F1 as the primary metric: it gives each subject equal weight instead of allowing physics and computer science to dominate the score.

Chemistry presented another problem. Almost half of its examples were secondary cross-lists, often on physics papers. The label can reflect how an author chose to submit a paper, not just what can be inferred from its abstract. There is a ceiling here that a better model cannot remove.

Abstracts were relatively short. The median was 144 words and the 95th percentile was 255 words. That made an encoder with a 512-token context window a reasonable starting point.

## What BERT actually sees

Before training a classifier, I wanted to inspect the input after tokenization. BERT does not see words. Its uncased WordPiece tokenizer sees token IDs, and scientific notation can break into many fragments.

On a seeded sample of 10,000 abstracts, raw BERT token counts looked like this:

| Statistic | Tokens |
|---|---:|
| Median | 217 |
| 95th percentile | 385 |
| 99th percentile | 479 |
| Maximum | 733 |

Only 0.49% exceeded BERT's 512-token limit. The context window was not a serious constraint, but TeX was wasting some of it. A formula such as a long set definition turns into a trail of punctuation, backslashes, and rare fragments. Those tokens carry little information for a five-way subject classifier.

A quarter of sampled abstracts contained at least one matched formula: 2,513 abstracts and 13,429 formula spans in total. Almost all used `$...$`; display math and the other delimiters were rare.

I considered removing every formula. That was too aggressive. Short expressions such as `$H_2$O`, `$z<3$`, or `$CO_2$` can be useful. The final rule was:

- flatten short inline math into readable text;
- replace inline math of 24 or more characters with `<FORMULA>`;
- replace display math with `<FORMULA>`;
- remove simple TeX formatting wrappers;
- normalize whitespace;
- preserve ordinary text, including percentages.

`$H_2$O`, for example, becomes `H2O`. A long equation becomes one learned special token. `<FORMULA>` is registered with each tokenizer and its embedding is trained with the rest of the model.

After normalization, median length fell from 217 to 207 tokens, the 95th percentile from 385 to 357, and the share beyond 512 tokens from 0.49% to 0.03%. The normalized sample produced no BERT `[UNK]` tokens.

One mundane preprocessing bug was worth catching: a naive TeX comment rule treated `%` as the start of a comment and deleted the rest of a line. That is valid TeX behavior but wrong for an abstract containing “accuracy improved by 12%.” Parsing the TeX structure instead of applying broad regular expressions kept those errors visible and fixable.

I did not lowercase manually, stem, or lemmatize. BERT's tokenizer already lowercases, and the encoder was pretrained on natural inflected text. Lemmatization would change that input distribution and discard syntactic information without solving an observed problem.

## Building a benchmark

A good score is not useful if examples leak between splits. Abstracts were normalized and hashed before splitting. Duplicate groups could not cross splits, and groups with conflicting labels were dropped.

The frozen benchmark used:

| Split | Records | Purpose |
|---|---:|---|
| Training | 100,000 | Final fitting |
| Validation | 20,000 | Optuna and threshold selection |
| Benchmark | 20,000 | Model comparison |
| Final holdout | 20,000 | One-time final evaluation |

Validation, benchmark, and holdout retained the natural distribution. Training was sampled to include at least 8,000 positives for each rare label where possible. The split manifests store record IDs, content hashes, the snapshot hash, and the split seed.

Primary arXiv categories received a target of `1.0`; secondary-only cross-lists received `0.5`. The model still produced five independent sigmoid probabilities. This soft target acknowledges that a secondary category is useful evidence but often weaker or less recoverable from the abstract alone.

## Fine-tuning BERT

The first model was `bert-base-uncased`, released in 2018. The classifier was deliberately simple:

1. tokenize up to 512 tokens;
2. run the pretrained encoder;
3. take the pooled representation;
4. apply dropout and one linear layer;
5. produce five logits and independent sigmoid probabilities.

I fine-tuned the full backbone rather than using frozen embeddings. A frozen-head probe reached 0.6860 macro F1; full fine-tuning later reached 0.7878 on the final holdout. For this task, adapting the representation mattered.

Hyperparameter search used Optuna. Each of 16 trials trained for one epoch on the same fixed, rare-label-aware subset of 5,000 training records and was scored on the full validation set. The search varied only:

- learning rate: `8e-6` to `1e-4` on a log scale;
- weight decay: `0`, `0.001`, or `0.01`;
- warmup ratio: `0` to `0.1`.

Everything else—data, effective batch size, sequence length, loss, threshold grid, and epoch count—stayed fixed. The selected BERT settings were a learning rate of `1.964e-5`, weight decay `0.001`, and warmup ratio `0.0474`.

Thresholds deserve attention in a multi-label classifier. `0.5` is not automatically optimal, especially with severe imbalance. I selected a threshold for each label on validation predictions, then froze those thresholds before benchmark and holdout evaluation.

On the final 20,000-record holdout, BERT achieved:

| Exact match | Micro F1 | Macro F1 | Top-1 accuracy |
|---:|---:|---:|---:|
| 0.9078 | 0.9457 | 0.7878 | 0.9624 |

Per-label F1 exposed what the aggregate score hid:

| Biology | Chemistry | Computer science | Physics | Social sciences |
|---:|---:|---:|---:|---:|
| 0.7110 | 0.5296 | 0.9480 | 0.9743 | 0.7763 |

Chemistry remained the difficult category, as the data analysis suggested it would.

## What about a 27-billion-parameter LLM?

Before training more encoders, I tested a model that was already running locally: Qwen3.8-27B. The prompt supplied the abstract, listed the five labels, and required one label in a small JSON response.

This comparison used 20,000 single-label records from the earlier deterministic development test split. The LLM got 18,513 right, for 92.565% accuracy. Fine-tuned BERT got 19,202 right, or 96.01%.

| Model | Top-1 accuracy |
|---|---:|
| Qwen3.8-27B, prompted | 92.565% |
| Fine-tuned BERT | **96.01%** |

BERT classified 689 additional papers correctly, a 3.445 percentage-point advantage. The models disagreed in useful ways: the LLM alone was correct 452 times, while BERT alone was correct 1,141 times.

This was an opportunistic baseline, not a universal claim about LLMs. It compared one prompt, one local serving setup, and a single-label metric. It also used the older development test rather than the later frozen holdout. Still, it answered the practical question: for this stable taxonomy, a task-specific encoder could beat a much larger prompted model.

It also avoids generating reasoning that the application does not need. Classification only requires probabilities and labels.

## Trying newer encoders

BERT's result did not mean that 2018 was the end of the story. I ran the same pipeline with three newer backbones:

- `ModernBERT-base`
- `embeddinggemma-300m`
- `Qwen3-Embedding-0.6B`

Each model received the same abstract, preprocessing, labels, splits, 512-token limit, training budget, and Optuna search space. Pooling followed the model's architecture. Before full fine-tuning, I also ran frozen-representation probes to catch tokenization, masking, and pooling mistakes.

| Model | Frozen-probe macro F1 |
|---|---:|
| BERT base | 0.6860 |
| ModernBERT base | 0.6598 |
| EmbeddingGemma 300M | 0.6865 |
| Qwen3-Embedding 0.6B | **0.7879** |

Qwen's pretrained representation was already unusually good for the task. Full fine-tuning improved it further.

Here are the final holdout results:

| Model | Macro F1 | Micro F1 | Exact match | Top-1 accuracy | Artifact |
|---|---:|---:|---:|---:|---:|
| Qwen3-Embedding-0.6B | **0.8087** | **0.9526** | **0.9174** | **0.9723** | 2.40 GB |
| EmbeddingGemma 300M | 0.7998 | 0.9506 | 0.9152 | 0.9684 | 1.25 GB |
| ModernBERT base | 0.7895 | 0.9467 | 0.9091 | 0.9648 | 0.60 GB |
| BERT base uncased | 0.7878 | 0.9457 | 0.9078 | 0.9624 | **0.44 GB** |

The 95% paired-bootstrap interval for Qwen's macro-F1 improvement over BERT was 0.0119 to 0.0300. That uncertainty is over holdout examples only: each model was trained once, so it does not measure variation between training runs.

The newer models improved the rare labels most. Qwen reached 0.7333 F1 on biology and 0.5750 on chemistry. Its overall gain over BERT was real, but modest relative to the increase in size.

## Quality is only half of the result

All throughput measurements ran on one RTX 3090 with the same holdout texts. For the common 129–256-token bucket:

| Model | GPU batch-1 p50 | GPU batch-32 throughput | CPU batch-1 p50 | Peak training VRAM | Training time |
|---|---:|---:|---:|---:|---:|
| BERT base | **5.7 ms** | **202.9 abstracts/s** | **44.9 ms** | **4.1 GB** | **27 min** |
| ModernBERT base | 10.5 ms | 152.4 abstracts/s | 69.4 ms | 6.5 GB | 39 min |
| EmbeddingGemma 300M | 16.2 ms | 137.5 abstracts/s | 69.7 ms | 10.4 GB | 52 min |
| Qwen3-Embedding 0.6B | 26.7 ms | 49.6 abstracts/s | 251.7 ms | 17.7 GB | 138 min |

Qwen won on quality. BERT won on latency, throughput, memory, artifact size, and training time. EmbeddingGemma occupied a useful middle ground: most of Qwen's quality at about half the artifact size and much better throughput.

There is no single “best” model without an operating constraint. I chose Qwen as the default downloadable model because macro F1 was the primary objective. For a CPU service, a small container, or a high-volume endpoint, I would seriously consider BERT or EmbeddingGemma instead.

## Running the model

The four frozen artifacts are available here:

- [Qwen3-Embedding-0.6B](https://huggingface.co/Ilia-Iliev/arxiv-abstract-classifier-qwen3-embedding-0.6b)
- [EmbeddingGemma 300M](https://huggingface.co/Ilia-Iliev/arxiv-abstract-classifier-embeddinggemma-300m)
- [ModernBERT base](https://huggingface.co/Ilia-Iliev/arxiv-abstract-classifier-modernbert-base)
- [BERT base uncased](https://huggingface.co/Ilia-Iliev/arxiv-abstract-classifier-bert-base-uncased)

The repository includes a Django REST API. With Python 3.11 and [`uv`](https://docs.astral.sh/uv/):

```bash
git clone https://github.com/ilia-iliev/abstract_classification.git
cd abstract_classification
./scripts/setup.sh
uv run manage.py runserver
```

The setup script downloads the pinned Qwen artifact into `artifacts/model`. CPU is the default; use a CUDA GPU with:

```bash
MODEL_DEVICE=cuda uv run manage.py runserver
```

Check the service:

```bash
curl http://127.0.0.1:8000/api/health/
```

Then classify an abstract:

```bash
curl -X POST http://127.0.0.1:8000/api/classify/ \
  -H 'Content-Type: application/json' \
  -d '{"abstract":"We introduce a transformer algorithm for image classification."}'
```

For batch inference, send `{"abstracts": ["...", "..."]}` with up to 32 abstracts. Set `MODEL_DIR` before setup and startup to serve one of the other model artifacts.

For deployment, run the same Django application behind a production WSGI server and reverse proxy, mount the downloaded artifact as read-only data, and set `MODEL_DEVICE` and `MODEL_DIR` explicitly. The model is loaded on the first request, so a health-check warm-up avoids cold latency on live traffic.

## Conclusion

Large language models make zero-shot classification remarkably easy. They are an excellent default when labels change often, examples are scarce, or the task needs open-ended reasoning.

This experiment covered the opposite case: millions of examples, five stable labels, and the same prediction repeated at scale. There, old-school supervised learning still pays off. A fine-tuned BERT beat a prompted 27B model on the comparable single-label test. Newer embedding encoders improved quality further, while BERT remained the cheapest and fastest option by a wide margin.

The main lesson was not that one architecture wins. It was that the unglamorous parts—data inspection, deduplication, preprocessing, split discipline, per-label metrics, threshold selection, and throughput measurement—turned “the output looks plausible” into an engineering decision.