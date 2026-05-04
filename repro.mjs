import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { snappyCompress, snappyDecompress } from '@platformatic/wasm-utils'

const here = dirname(fileURLToPath(import.meta.url))
const artifactsDir = resolve(here, 'artifacts')
const javaDir = resolve(here, 'java')
const jarPath = resolve(javaDir, 'target', 'snappy-java-producer-1.0.0-jar-with-dependencies.jar')
const outputPath = resolve(artifactsDir, 'hello-xerial-snappy.bin')

mkdirSync(artifactsDir, { recursive: true })

execFileSync(
  'java',
  ['-cp', jarPath, 'org.example.SnappyProduce', outputPath],
  { stdio: 'inherit' }
)

const payload = readFileSync(outputPath)
const prefixHex = payload.subarray(0, 16).toString('hex')
const control = Buffer.from('hello world', 'utf8')

console.log(`payload size: ${payload.length} bytes`)
console.log(`prefix hex: ${prefixHex}`)
console.log(`xerial signature: ${prefixHex.startsWith('82534e41505059')}`)

const roundTrip = snappyDecompress(snappyCompress(control))
console.log(`wasm-utils self-roundtrip: ${roundTrip.toString('utf8')}`)

try {
  const decoded = snappyDecompress(payload)
  console.log(`decoded: ${decoded.toString('utf8')}`)
} catch (error) {
  console.error(`${error?.constructor?.name ?? 'Error'}: ${error?.message ?? String(error)}`)
  process.exitCode = 1
}
