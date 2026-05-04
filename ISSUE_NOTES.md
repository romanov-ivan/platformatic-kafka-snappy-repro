# Better Root Cause

The narrower claim supported by this reproducer is:

- Apache Kafka's Java Snappy path is based on xerial Snappy streams
- those payloads start with the xerial stream signature `82 53 4e 41 50 50 59`
- `@platformatic/wasm-utils@0.2.1` can round-trip its own Snappy output, but fails to decompress xerial Snappy input with `RuntimeError: unreachable`
- `@platformatic/kafka` uses `@platformatic/wasm-utils` on the consumer-side Snappy path
- therefore Java-producer Snappy interoperability is plausibly broken because of Snappy format mismatch

## Issue framing

Prefer this shape:

> `snappyDecompress` fails on xerial-compatible Snappy payloads produced by the Java Kafka ecosystem

## Supporting references

- Apache Kafka uses `SnappyOutputStream` / `SnappyInputStream` in its Java Snappy path
- xerial `snappy-java` documents that `SnappyOutputStream` / `SnappyInputStream` use a 16-byte magic-header stream format
- this reproducer shows `@platformatic/wasm-utils@0.2.1` does not decode that payload
