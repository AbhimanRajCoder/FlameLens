# Investigation Explorer ranking

The Explorer uses a discovery heuristic over the existing investigation catalogue and `DATASET_AUDIT.csv`. It does not estimate scientific validity, model performance, or operational suitability. The evidence behind every result is shown in its detail page.

## Criteria

For the selected intent, each catalogue record receives an ordinal total from 0 to 7:

| Evidence | Points | Rule |
| --- | ---: | --- |
| Candidate target coverage | 0, 2, or 3 | 3 when the catalogue describes the requested measurement family; 2 for a candidate event/related measurement whose semantics or coverage remain unresolved; otherwise 0. This is based on reviewed source notes, not inferred from column names. |
| Phenomenon match | 0 or 2 | 2 when verified catalogue text matches the chosen physical phenomenon using the explicit term groups in `src/data/explorer.ts`. |
| Measurement metadata | 0 or 1 | 1 when the source catalogue describes measured or candidate variables. |
| Local source file | 0 or 1 | 1 when the audit maps the record to an actual bundled CSV. |

The total is a transparent ordering aid; it is intentionally not displayed as a probability or a decimal score. Missing/unverified metadata earns no points and is identified as a gap; it is never interpreted as zero measurement. A high score does not mean that a source is training-ready.

## Tie breaking and sorting

Evidence relevance sorts by total points, then local-file availability, then source identifier. Title and source-ID sorts are lexical/numeric respectively. Metadata completeness sorts by the count of non-null indexed fields (materials, hardware, variables, dates, audit rows), then title; this is not a measure of measurement completeness.

## Provenance boundaries

Audit row/column/duplicate counts are loaded from `data/audit/DATASET_AUDIT.csv`. They describe parsed file rows, not independent experiments. For example, PSI-102 contains repeated-condition notes and PSI-107 includes exact repeated rows; those are not converted into independent run counts. PSI-159 normal and inverse files are listed as separate records. Metadata-only, external-publication, and monitor records have no local data file and are labeled accordingly. No third-party visual asset is required for this 2D index.

The per-intent candidate-target map and phenomenon term groups are documented alongside their implementation in `src/data/explorer.ts`.
