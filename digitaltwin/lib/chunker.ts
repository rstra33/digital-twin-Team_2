/**
 * Profile chunking logic — TypeScript port of digitaltwin_rag.py build_chunks_from_profile()
 * Converts structured profile JSON into content chunks for vector embedding.
 */

export interface ProfileChunk {
  id: string;
  title: string;
  type: string;
  content: string;
  category: string;
  tags: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function buildChunksFromProfile(profileData: Record<string, any>): ProfileChunk[] {
  const chunks: ProfileChunk[] = [];
  let chunkId = 1;

  // Personal summary
  const personal = profileData.personal;
  if (personal) {
    const summaryParts: string[] = [];
    if (personal.name) summaryParts.push(`Name: ${personal.name}`);
    if (personal.title) summaryParts.push(`Title: ${personal.title}`);
    if (personal.location) summaryParts.push(`Location: ${personal.location}`);
    if (personal.summary) summaryParts.push(personal.summary);
    if (personal.elevator_pitch) summaryParts.push(`Elevator pitch: ${personal.elevator_pitch}`);
    chunks.push({
      id: `chunk-${chunkId}`,
      title: "Personal Summary",
      type: "personal",
      content: summaryParts.join(" | "),
      category: "overview",
      tags: ["personal", "summary", "overview"],
    });
    chunkId++;
  }

  // Contact info
  const contact = personal?.contact;
  if (contact && typeof contact === "object") {
    const contactParts = Object.entries(contact)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`);
    if (contactParts.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        title: "Contact Information",
        type: "personal",
        content: contactParts.join(" | "),
        category: "contact",
        tags: ["contact"],
      });
      chunkId++;
    }
  }

  // Salary and location preferences
  const salary = profileData.salary_location;
  if (salary && typeof salary === "object") {
    const salParts = Object.entries(salary)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`);
    if (salParts.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        title: "Salary and Location Preferences",
        type: "preferences",
        content: salParts.map(String).join(" | "),
        category: "preferences",
        tags: ["salary", "location", "preferences"],
      });
      chunkId++;
    }
  }

  // Experience — one chunk per role
  const experience = profileData.experience;
  if (Array.isArray(experience)) {
    for (const exp of experience) {
      const expParts: string[] = [];
      expParts.push(`${exp.title ?? ""} at ${exp.company ?? ""}`);
      if (exp.duration) expParts.push(`Duration: ${exp.duration}`);
      if (exp.company_context) expParts.push(`Context: ${exp.company_context}`);
      if (exp.team_structure) expParts.push(`Team: ${exp.team_structure}`);
      if (Array.isArray(exp.achievements_star)) {
        for (const star of exp.achievements_star) {
          expParts.push(
            `Achievement — Situation: ${star.situation ?? ""}. ` +
            `Task: ${star.task ?? ""}. ` +
            `Action: ${star.action ?? ""}. ` +
            `Result: ${star.result ?? ""}`
          );
        }
      }
      if (Array.isArray(exp.technical_skills_used)) {
        expParts.push(`Skills used: ${exp.technical_skills_used.join(", ")}`);
      }
      if (Array.isArray(exp.leadership_examples)) {
        expParts.push(`Leadership: ${exp.leadership_examples.join(", ")}`);
      }
      chunks.push({
        id: `chunk-${chunkId}`,
        title: `Experience — ${exp.title ?? ""} at ${exp.company ?? ""}`,
        type: "experience",
        content: expParts.join(" | "),
        category: "experience",
        tags: ["experience", (exp.company ?? "").toLowerCase()],
      });
      chunkId++;
    }
  }

  // Technical skills
  const skills = profileData.skills;
  const tech = skills?.technical;
  if (tech && typeof tech === "object") {
    const techParts: string[] = [];
    if (Array.isArray(tech.programming_languages)) {
      for (const lang of tech.programming_languages) {
        if (!lang.language) continue;
        techParts.push(
          `${lang.language} (${lang.proficiency ?? ""}, ${lang.years ?? ""} years)`
        );
      }
    }
    if (Array.isArray(tech.databases)) {
      techParts.push(`Databases: ${tech.databases.join(", ")}`);
    }
    if (Array.isArray(tech.cloud_platforms)) {
      techParts.push(`Platforms: ${tech.cloud_platforms.join(", ")}`);
    }
    if (Array.isArray(tech.ai_ml)) {
      techParts.push(`AI/ML: ${tech.ai_ml.join(", ")}`);
    }
    if (techParts.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        title: "Technical Skills",
        type: "skills",
        content: techParts.join(" | "),
        category: "skills",
        tags: ["skills", "technical"],
      });
      chunkId++;
    }
  }

  // Mathematical foundations
  const mathSkills = skills?.mathematical_foundations;
  if (Array.isArray(mathSkills) && mathSkills.length > 0) {
    chunks.push({
      id: `chunk-${chunkId}`,
      title: "Mathematical Foundations",
      type: "skills",
      content: mathSkills.join(", "),
      category: "skills",
      tags: ["skills", "mathematics"],
    });
    chunkId++;
  }

  // Soft skills
  const soft = skills?.soft_skills;
  if (Array.isArray(soft) && soft.length > 0) {
    chunks.push({
      id: `chunk-${chunkId}`,
      title: "Soft Skills",
      type: "skills",
      content: soft.join(", "),
      category: "skills",
      tags: ["skills", "soft"],
    });
    chunkId++;
  }

  // Education
  const edu = profileData.education;
  if (edu && typeof edu === "object") {
    const eduParts: string[] = [];
    eduParts.push(`${edu.degree ?? ""} at ${edu.university ?? ""}`);
    if (edu.major) eduParts.push(`Major: ${edu.major}`);
    if (edu.minor) eduParts.push(`Minor: ${edu.minor}`);
    if (edu.gpa) eduParts.push(`GPA: ${edu.gpa}`);
    if (edu.status) eduParts.push(`Status: ${edu.status}`);
    if (Array.isArray(edu.relevant_coursework)) {
      eduParts.push(`Coursework: ${edu.relevant_coursework.join(", ")}`);
    }
    if (Array.isArray(edu.awards)) {
      eduParts.push(`Awards: ${edu.awards.join(", ")}`);
    }
    const secondary = edu.secondary;
    if (secondary && typeof secondary === "object") {
      eduParts.push(
        `Secondary: ${secondary.school ?? ""} — ATAR ${secondary.atar ?? ""}`
      );
    }
    chunks.push({
      id: `chunk-${chunkId}`,
      title: "Education",
      type: "education",
      content: eduParts.join(" | "),
      category: "education",
      tags: ["education", "university", "gpa"],
    });
    chunkId++;
  }

  // Projects
  const projects = profileData.projects_portfolio;
  if (Array.isArray(projects)) {
    for (const proj of projects) {
      const projParts: string[] = [proj.name ?? "", proj.description ?? ""];
      if (Array.isArray(proj.technologies)) {
        projParts.push(`Technologies: ${proj.technologies.join(", ")}`);
      }
      if (proj.impact) projParts.push(`Impact: ${proj.impact}`);
      chunks.push({
        id: `chunk-${chunkId}`,
        title: `Project — ${proj.name ?? ""}`,
        type: "project",
        content: projParts.join(" | "),
        category: "projects",
        tags: ["project"],
      });
      chunkId++;
    }
  }

  // Career goals
  const goals = profileData.career_goals;
  if (goals && typeof goals === "object") {
    const goalParts: string[] = [];
    if (goals.short_term) goalParts.push(`Short-term: ${goals.short_term}`);
    if (goals.long_term) goalParts.push(`Long-term: ${goals.long_term}`);
    if (Array.isArray(goals.learning_focus)) {
      goalParts.push(`Learning focus: ${goals.learning_focus.join(", ")}`);
    }
    if (Array.isArray(goals.industries_interested)) {
      goalParts.push(`Industries: ${goals.industries_interested.join(", ")}`);
    }
    if (goalParts.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        title: "Career Goals",
        type: "career",
        content: goalParts.join(" | "),
        category: "career",
        tags: ["career", "goals"],
      });
      chunkId++;
    }
  }

  // Professional development / Trading experience
  const dev = profileData.professional_development;
  if (dev && typeof dev === "object") {
    const devParts: string[] = [];
    if (Array.isArray(dev.recent_learning)) {
      devParts.push(`Recent learning: ${dev.recent_learning.join(", ")}`);
    }
    const trading = dev.trading_experience;
    if (trading && typeof trading === "object") {
      devParts.push(
        `Trading: ${trading.focus ?? ""} for ${trading.duration ?? ""}. ` +
        `Experience: ${Array.isArray(trading.experience_type) ? trading.experience_type.join(", ") : ""}. ` +
        `Skills: ${Array.isArray(trading.skills_developed) ? trading.skills_developed.join(", ") : ""}`
      );
    }
    if (devParts.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        title: "Professional Development and Trading",
        type: "development",
        content: devParts.join(" | "),
        category: "development",
        tags: ["development", "trading", "learning"],
      });
      chunkId++;
    }
  }

  // Interview prep — weakness mitigation
  const interview = profileData.interview_prep;
  const weaknesses = interview?.weakness_mitigation;
  if (Array.isArray(weaknesses) && weaknesses.length > 0) {
    const wParts = weaknesses.map(
      (w: any) => `Weakness: ${w.weakness ?? ""} — Mitigation: ${w.mitigation ?? ""}`
    );
    chunks.push({
      id: `chunk-${chunkId}`,
      title: "Weakness Mitigation",
      type: "interview",
      content: wParts.join(" | "),
      category: "interview",
      tags: ["interview", "weaknesses"],
    });
    chunkId++;
  }

  return chunks;
}
