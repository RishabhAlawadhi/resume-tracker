import React, { useMemo, useState } from "react";

/*
  Resume Analyzer (client-side, no external libs)
  Works in: Vite React / CRA / Next (client component)
*/

const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by","can","could","did","do","does","doing",
  "for","from","had","has","have","having","he","her","here","him","his","how","i","if",
  "in","into","is","it","its","just","may","me","might","more","most","my","no","not",
  "of","on","or","our","ours","she","should","so","some","such","than","that","the",
  "their","them","then","there","these","they","this","those","to","too","under","up",
  "us","very","was","we","were","what","when","where","which","who","will","with","you",
  "your","yours"
]);

const DEFAULT_SKILLS = [
  "python","javascript","typescript","node.js","react","next.js","express","sql","postgresql",
  "mongodb","aws","docker","kubernetes","git","rest","graphql","nlp","machine learning",
  "pandas","numpy","scikit-learn","tensorflow","pytorch","power bi","tableau","excel",
  "spark","airflow","linux","bash","fastapi","flask","java","spring","kafka"
];

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^a-z0-9+.#/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s) {
  const t = normalizeText(s);
  if (!t) return [];
  return t
    .split(" ")
    .map(x => x.trim())
    .filter(x => x && !STOPWORDS.has(x) && x.length > 1);
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function getNgrams(tokens, n) {
  const out = [];
  for (let i = 0; i + n - 1 < tokens.length; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

function buildKeywordSet(jobText, extraSkills) {
  const tokens = tokenize(jobText);
  const unigrams = tokens;
  const bigrams = getNgrams(tokens, 2);
  const trigrams = getNgrams(tokens, 3);

  const raw = unique([...unigrams, ...bigrams, ...trigrams]);

  const knownSkills = (extraSkills && extraSkills.length ? extraSkills : DEFAULT_SKILLS)
    .map(normalizeText)
    .filter(Boolean);

  const skillsSet = new Set(knownSkills);

  const keywordSet = new Set();

  for (const k of raw) {
    if (k.length < 3) continue;
    if (skillsSet.has(k)) keywordSet.add(k);
  }

  for (const k of knownSkills) {
    keywordSet.add(k);
  }

  return keywordSet;
}

function countMentions(text, phrase) {
  const t = normalizeText(text);
  const p = normalizeText(phrase);
  if (!t || !p) return 0;

  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "g");
  const m = t.match(re);
  return m ? m.length : 0;
}

function scoreMatch(resumeText, jobText, skillsList) {
  const kw = buildKeywordSet(jobText, skillsList);
  const resume = normalizeText(resumeText);

  const keywords = Array.from(kw);
  const present = [];
  const missing = [];

  let hits = 0;

  for (const k of keywords) {
    const c = countMentions(resume, k);
    if (c > 0) {
      present.push({ keyword: k, count: c });
      hits += 1;
    } else {
      missing.push(k);
    }
  }

  const total = keywords.length || 1;
  const pct = Math.round((hits / total) * 100);

  present.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));
  missing.sort((a, b) => a.localeCompare(b));

  return { pct, total, hits, present, missing };
}

function suggestBullets(missingKeywords) {
  const top = missingKeywords.slice(0, 8);
  if (top.length === 0) return [];

  return top.map(k => {
    const pretty = k.replace(/\b\w/g, c => c.toUpperCase());
    return `Added experience using ${pretty} to deliver measurable outcomes (performance, reliability, or cost).`;
  });
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [skillsText, setSkillsText] = useState(DEFAULT_SKILLS.join(", "));

  const skillsList = useMemo(() => {
    return skillsText
      .split(",")
      .map(s => normalizeText(s))
      .map(s => s.trim())
      .filter(Boolean);
  }, [skillsText]);

  const result = useMemo(() => {
    if (!resumeText.trim() || !jobText.trim()) return null;
    return scoreMatch(resumeText, jobText, skillsList);
  }, [resumeText, jobText, skillsList]);

  const bullets = useMemo(() => {
    if (!result) return [];
    return suggestBullets(result.missing);
  }, [result]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h2 style={{ margin: "0 0 12px" }}>Resume Analyzer</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Resume Text</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={16}
            placeholder="Paste your resume text here"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Job Description</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={16}
            placeholder="Paste the job description here"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Skills Dictionary (comma separated)</label>
        <input
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="python, sql, react, aws, ..."
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid #ddd" }}>
        {!result ? (
          <div style={{ color: "#555" }}>
            Paste both resume text and job description to see the match score.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {result.pct}%
              </div>
              <div style={{ color: "#444" }}>
                Match score based on {result.hits} of {result.total} keywords
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div style={{ padding: 12, borderRadius: 12, border: "1px solid #eee" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Top matched keywords</div>
                {result.present.length === 0 ? (
                  <div style={{ color: "#666" }}>No keywords matched yet.</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {result.present.slice(0, 18).map((x) => (
                      <li key={x.keyword}>
                        {x.keyword} ({x.count})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ padding: 12, borderRadius: 12, border: "1px solid #eee" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Missing keywords</div>
                {result.missing.length === 0 ? (
                  <div style={{ color: "#666" }}>Nothing missing. Strong match.</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missing.slice(0, 40).map((k) => (
                      <span
                        key={k}
                        style={{
                          fontSize: 12,
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid #ddd"
                        }}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #eee" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested bullets to add</div>
              {bullets.length === 0 ? (
                <div style={{ color: "#666" }}>No suggestions needed.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
