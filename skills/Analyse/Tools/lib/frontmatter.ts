/**
 * frontmatter.ts — YAML frontmatter parsing and updates for source files.
 *
 * Uses the `yaml` package (already in package.json).
 */

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Extract YAML frontmatter from file content.
 * Returns the parsed object and the raw YAML string, or null if no frontmatter.
 */
export function extractFrontmatter(content: string): { data: Record<string, any>; raw: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const raw = match[1];
  const data = parseYaml(raw);
  if (typeof data !== "object" || data === null) return null;
  return { data, raw };
}

/**
 * Check if a source file has a review for the given profile.
 */
export function hasProfileReview(content: string, profile: string): boolean {
  const fm = extractFrontmatter(content);
  if (!fm) return false;
  return !!(fm.data.reviews && fm.data.reviews[profile]);
}

/**
 * Update frontmatter for a specific profile's review section.
 * Merges updates into reviews.{profile}, preserving everything else.
 * Returns the full file content with updated frontmatter.
 */
export function updateFrontmatter(
  content: string,
  profile: string,
  updates: Record<string, any>
): string {
  const fm = extractFrontmatter(content);

  if (fm) {
    // Existing frontmatter — merge into it
    if (!fm.data.reviews) fm.data.reviews = {};
    fm.data.reviews[profile] = {
      ...(fm.data.reviews[profile] || {}),
      ...updates,
    };

    const newYaml = stringifyYaml(fm.data, { lineWidth: 0 }).trimEnd();
    // Replace old frontmatter block
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${newYaml}\n---`);
  } else {
    // No existing frontmatter — prepend
    const data = { reviews: { [profile]: updates } };
    const newYaml = stringifyYaml(data, { lineWidth: 0 }).trimEnd();
    return `---\n${newYaml}\n---\n\n${content}`;
  }
}
