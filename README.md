# Platformatic Kafka Snappy Reproducer

This reproducer focuses on the codec mismatch itself.

It generates a Snappy payload with the same Java library family used by Apache Kafka (`org.xerial.snappy.SnappyOutputStream`) and then tries to decompress it with `@platformatic/wasm-utils@0.2.1`.

- Java/Kafka-side Snappy commonly uses the xerial/snappy-java stream format.
- `@platformatic/wasm-utils@0.2.1` does not successfully decode that format.
- `@platformatic/kafka` routes Snappy decompression through `@platformatic/wasm-utils`, so Java-producer interoperability can fail there.

## What this proves

This reproducer proves a concrete interoperability failure between:

- Java Snappy output produced via `SnappyOutputStream`
- `@platformatic/wasm-utils@0.2.1` `snappyDecompress(...)`

It does **not** by itself prove every detail of Kafka record-batch framing. It is intentionally narrower and harder to dispute.

## Prerequisites

- Node.js 22+
- Java 17+ and Maven 3+

## Install

```bash
npm install
```

## Run

```bash
npm run repro
```

## Expected result

The script:

1. Builds the Java helper JAR
2. Builds a Java-generated Snappy payload into `artifacts/hello-xerial-snappy.bin`
3. Prints the first bytes so the xerial stream signature is visible
4. Verifies that `@platformatic/wasm-utils` can round-trip its own Snappy output
5. Tries `snappyDecompress(...)`
6. Fails with `RuntimeError: unreachable`

Example output:

```text
payload size: 33 bytes
prefix hex: 82534e41505059000000000100000001
xerial signature: true
wasm-utils self-roundtrip: hello world
RuntimeError: unreachable
```

## Included files

- `repro.mjs`: runs the repro from Node
- `java/src/main/java/org/example/SnappyProduce.java`: emits a deterministic xerial/snappy-java payload
- `platformatic-kafka-issue-draft.md`: short issue draft for `platformatic/kafka`
- `ISSUE_NOTES.md`: rationale for the narrower xerial-based framing

## Notes

- Generated files under `artifacts/`, `java/target/`, and `node_modules/` are ignored by Git.
- `npm run clean` removes generated build outputs if you want a clean working tree before publishing the repo.
