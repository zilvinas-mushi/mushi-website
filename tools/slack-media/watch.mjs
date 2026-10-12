// Turns a video (or a voice note) into something a routine can read: the
// words, with timestamps, and a handful of frames. Everything runs here, on
// the CPU: ffmpeg from ffmpeg-static, Whisper through transformers.js. No
// key, no fee, no service; the model (~250 MB) is fetched from huggingface.co
// the first time and cached under ~/.cache/huggingface after that.
//
//   import { watch } from "./tools/slack-media/watch.mjs";
//   const { transcript, frames } = await watch("clip.mp4", "out/");
//
// Why Whisper and not the browser: Chrome's Web Speech API needs a live
// microphone and sends the audio to Google; it cannot take a file.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { createRequire } from "node:module";

const execFile = promisify(execFileCb);
const require = createRequire(import.meta.url);

export const ffmpeg = process.env.FFMPEG ?? require("ffmpeg-static");
export const MODEL = process.env.WHISPER_MODEL ?? "onnx-community/whisper-small";
const FRAME_EVERY_S = 5; // a screen recording changes slower than that
const MAX_FRAMES = 12;

const ff = (args) => execFile(ffmpeg, ["-y", "-loglevel", "error", ...args], { maxBuffer: 1 << 24 });

export const duration = async (file) => {
  // ffprobe is not in ffmpeg-static; ffmpeg prints the duration on stderr.
  const { stderr } = await execFile(ffmpeg, ["-i", file], { maxBuffer: 1 << 20 }).catch((e) => e);
  const m = /Duration: (\d+):(\d+):(\d+\.?\d*)/.exec(stderr ?? "");
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
};

// 16 kHz mono float32 PCM, which is what Whisper eats.
const pcm = async (file, out) => {
  await ff(["-i", file, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", out]);
  const buf = await readFile(out);
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
};

let asr;
export const transcribe = async (file, outDir) => {
  const raw = join(outDir, "audio.f32");
  const audio = await pcm(file, raw);
  await rm(raw, { force: true }); // 64 KB a second; the transcript is what stays
  if (!asr) {
    const { pipeline } = await import("@huggingface/transformers");
    asr = await pipeline("automatic-speech-recognition", MODEL, { dtype: "q8" });
  }
  const result = await asr(audio, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
    language: "en",
    task: "transcribe",
  });
  const stamp = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const lines = (result.chunks ?? [{ timestamp: [0], text: result.text }]).map(
    (c) => `[${stamp(c.timestamp[0] ?? 0)}] ${c.text.trim()}`,
  );
  const text = lines.join("\n") + "\n";
  await writeFile(join(outDir, "transcript.txt"), text);
  return { text: result.text.trim(), lines, path: join(outDir, "transcript.txt") };
};

// Evenly spaced JPEGs, at most MAX_FRAMES, 1280 wide: enough to read a site's
// text, small enough to look at a dozen.
export const frames = async (file, outDir) => {
  const total = await duration(file);
  const every = Math.max(FRAME_EVERY_S, total / MAX_FRAMES);
  const pattern = join(outDir, "frame-%02d.jpg");
  await ff(["-i", file, "-vf", `fps=1/${every},scale=1280:-2`, "-frames:v", String(MAX_FRAMES), "-q:v", "3", pattern]);
  const files = (await readdir(outDir)).filter((f) => /^frame-\d+\.jpg$/.test(f)).sort();
  return files.map((f, i) => ({ path: join(outDir, f), at: Math.round(i * every) }));
};

export const isVideo = (mime = "", name = "") =>
  mime.startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv)$/i.test(name);
export const isAudio = (mime = "", name = "") =>
  mime.startsWith("audio/") || /\.(m4a|mp3|wav|ogg|aac|webm)$/i.test(name);

export const watch = async (file, outDir) => {
  await mkdir(outDir, { recursive: true });
  const video = isVideo("", file);
  const [transcript, shots] = await Promise.all([
    transcribe(file, outDir),
    video ? frames(file, outDir) : Promise.resolve([]),
  ]);
  return { file, transcript, frames: shots };
};

if (process.argv[1] && basename(process.argv[1]) === basename(import.meta.url)) {
  const [file, outDir] = process.argv.slice(2);
  if (!file) {
    console.error("usage: node tools/slack-media/watch.mjs <video> [outDir]");
    process.exit(1);
  }
  const out = outDir ?? join(process.cwd(), basename(file, extname(file)) + "-watched");
  const r = await watch(file, out);
  console.log(JSON.stringify(r, null, 2));
}
