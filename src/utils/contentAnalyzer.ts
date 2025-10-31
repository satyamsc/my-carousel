export interface StructuredContent {
  title?: string;
  body?: string;
  visual?: string;
  visualSnippet?: string;
  tags?: string[];
}

function normalize(text: string): string {
  return text.replace(/\r\n|\r/g, "\n").trim();
}

function extractLabeled(text: string) {
  const titleMatch = text.match(/Title:\s*[“"']?([\s\S]+?)[”"'](?=\s|$)/i) || text.match(/Title:\s*([\s\S]+?)(?=$|\s*Body|\s*Visual)/i);
  const bodyMatch = text.match(/Body:\s*[“"']?([\s\S]+?)[”"'](?=\s|$)/i) || text.match(/Body:\s*([\s\S]+?)(?=$|\s*Visual)/i);
  const visualMatch = text.match(/Visual:\s*[“"']?([\s\S]+?)[”"'](?=\s|$)/i) || text.match(/Visual:\s*([\s\S]+)$/i);
  const visualRaw = visualMatch?.[1]?.trim();
  let visualSnippet: string | undefined;
  if (visualRaw) {
    const fenced = visualRaw.match(/```([\s\S]*?)```/);
    if (fenced) {
      visualSnippet = fenced[1].trim();
    } else {
      const braced = visualRaw.match(/\{[\s\S]*\}/m);
      if (braced) visualSnippet = braced[0].trim();
    }
  }
  return {
    title: titleMatch?.[1]?.trim(),
    body: bodyMatch?.[1]?.trim(),
    visual: visualRaw,
    visualSnippet,
  } as StructuredContent;
}


function detectKeywordsForVisual(text: string): string | undefined {
  const lower = text.toLowerCase();
  const keywords = ["api", "endpoint", "response", "json", "payload", "leak", "secret", "pii", "ssn", "token", "password"];
  const matched = keywords.some(k => lower.includes(k));
  if (!matched) return undefined;
  // Create a concise visual description if none provided
  return "API response JSON with red highlights on sensitive fields";
}

function heuristics(text: string): StructuredContent {
  const normalized = normalize(text);
  const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);

  // Title heuristic: first short line with emphasis, or first sentence
  let title: string | undefined;
  for (const line of lines) {
    const isShort = line.length <= 80;
    const hasEmojiOrQuotes = /["'“”‘’]|[\u{1F300}-\u{1FAFF}]/u.test(line);
    const endsWithColon = /:\s*$/.test(line);
    if (isShort && (hasEmojiOrQuotes || endsWithColon)) {
      title = line.replace(/:\s*$/, "");
      break;
    }
  }
  if (!title) {
    // Fallback: first sentence
    const sentence = normalized.split(/(?<=[.!?])\s+/)[0]?.trim();
    if (sentence && sentence.length <= 120) title = sentence;
  }

  // Visual: explicit JSON/code block or keyword-based
  let visual: string | undefined;
  let visualSnippet: string | undefined;
  const fenced = normalized.match(/```([\s\S]*?)```/);
  const braced = normalized.match(/\{[\s\S]*\}/);
  if (fenced) {
    visual = "Code/JSON snippet detected";
    visualSnippet = fenced[1].trim();
  } else if (braced) {
    visual = "Code/JSON snippet detected";
    visualSnippet = braced[0].trim();
  } else {
    visual = detectKeywordsForVisual(normalized);
  }

  // Body: remove title line and any code/JSON blocks
  let body = normalized;
  if (title) body = body.replace(title, "").trim();
  if (fenced?.[0]) body = body.replace(fenced[0], "").trim();
  else if (braced?.[0]) body = body.replace(braced[0], "").trim();

  // Compact whitespace for body
  body = body.replace(/\n{2,}/g, "\n").trim();

  // Tags: extract simple hashtags
  const tags = Array.from(new Set((normalized.match(/#[a-z0-9_]+/gi) || []).map(t => t.toLowerCase())));

  return { title, body, visual, visualSnippet, tags };
}

export function analyzeContent(text: string): StructuredContent {
  const labeled = extractLabeled(text);
  const hasAnyLabel = labeled.title || labeled.body || labeled.visual;
  if (hasAnyLabel) return labeled;
  return heuristics(text);
}