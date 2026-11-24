import { describe, expect, it } from "vitest";
import { escolherMimeAudio } from "@/lib/audio";

describe("escolherMimeAudio", () => {
  it("prefere webm com opus (Chrome/Android)", () => {
    expect(escolherMimeAudio((m) => m.startsWith("audio/webm"))).toEqual({
      mime: "audio/webm;codecs=opus",
      extensao: "webm",
    });
  });
  it("usa mp4 quando é o único suportado (Safari/iPhone)", () => {
    expect(escolherMimeAudio((m) => m === "audio/mp4")).toEqual({ mime: "audio/mp4", extensao: "m4a" });
  });
  it("devolve null quando nada é suportado", () => {
    expect(escolherMimeAudio(() => false)).toBeNull();
  });
});
