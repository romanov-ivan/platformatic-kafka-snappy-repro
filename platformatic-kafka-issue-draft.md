# Draft: GitHub issue for `platformatic/kafka`

## Title

`snappyDecompress` fails on xerial/snappy-java streams from Java Kafka clients with `RuntimeError: unreachable`

## Summary

`@platformatic/kafka` appears to break on Snappy-compressed data from Java Kafka clients because its Snappy path goes through `@platformatic/wasm-utils`, and `@platformatic/wasm-utils@0.2.1` does not successfully decode the widely used xerial/snappy-java stream format.

I isolated this outside Kafka with a small reproducer:

- Java generates a Snappy payload via `org.xerial.snappy.SnappyOutputStream`
- the payload starts with the xerial signature `82 53 4e 41 50 50 59`
- `@platformatic/wasm-utils@0.2.1` can round-trip its own Snappy output
- the same `snappyDecompress(...)` fails on the Java-generated payload with `RuntimeError: unreachable`

That plausibly explains Java producer -> Platformatic consumer failures for `compression.type=snappy`.

## Environment

Minimal reproducer:

- `@platformatic/wasm-utils` 0.2.1
- Node.js 23.9.0
- Java 22.0.2

Original failure:

- `@platformatic/kafka` 1.33.0

## Reproducer

Repo:

- <https://github.com/romanov-ivan/platformatic-kafka-snappy-repro>

Files:

- `repro.mjs`
- `java/src/main/java/org/example/SnappyProduce.java`

Run:

```bash
npm install
npm run repro
```

Actual output:

```text
payload size: 33 bytes
prefix hex: 82534e41505059000000000100000001
xerial signature: true
wasm-utils self-roundtrip: hello world
RuntimeError: unreachable
```

Expected behavior:

`snappyDecompress(...)` should decode the widely used xerial/snappy-java Snappy stream format used by the Java Kafka ecosystem, or `@platformatic/kafka` should use a decoder that does.

## Why this matters

`@platformatic/kafka` switched its compression/decompression path to `@platformatic/wasm-utils` in PR #213:

<https://github.com/platformatic/kafka/pull/213>

This matches the original consumer-side symptom I saw:

```text
Stream error: fetch failed 4 times. Inner errors:
  RuntimeError: unreachable | RuntimeError: unreachable |
  RuntimeError: unreachable | RuntimeError: unreachable
```

## References

- <https://github.com/platformatic/kafka/pull/213>
- <https://github.com/xerial/snappy-java>
