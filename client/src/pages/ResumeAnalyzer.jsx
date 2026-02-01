import { useState } from "react";

export default function ResumeAnalyzer() {
  const [role, setRole] = useState("Software Engineer Intern");
  const [resumeText, setResumeText] = useState("");

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Resume Analyzer + Placement Tracker</h1>
      <p>Paste your resume and check its match with a target role.</p>

      <div style={{ marginTop: "20px" }}>
        <label>Target Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: "10px", width: "100%", marginTop: "8px" }}
        >
          <option>Software Engineer Intern</option>
          <option>Data Analyst Intern</option>
          <option>Machine Learning Intern</option>
        </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Resume Text</label>
        <textarea
          rows="10"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume here..."
          style={{ padding: "10px", width: "100%", marginTop: "8px" }}
        />
      </div>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => alert("Resume Analysis Coming Next")}
      >
        Analyze Resume
      </button>
    </div>
  );
}
