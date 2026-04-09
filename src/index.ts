import type { AstroIntegration } from "astro";
import fs from "node:fs";
import path from "node:path";

export type NoEmailOptions = {
  /**
   * Enable or disable the plugin.
   * Default: true
   */
  enabled?: boolean;

  /**
   * Enable or disable SSR response rewriting.
   * Default: true
   */
  ssr?: boolean;
};

export default function astroNoEmail(
  options: NoEmailOptions = {}
): AstroIntegration {
  const { enabled = true, ssr = true } = options;

  return {
    name: "astro-noemail",

    hooks: {
      "astro:config:setup"({ addMiddleware }) {
        if (!enabled || !ssr) return;

        addMiddleware({
          entrypoint: new URL("./middleware.js", import.meta.url),
          order: "post"
        });
      },

      "astro:build:done"({ dir }) {
        if (!enabled) return;

        const outDir = new URL(dir).pathname;
        if (!outDir || !fs.existsSync(outDir)) return;

        walk(outDir, filePath => {
          if (!filePath.endsWith(".html")) return;

          const original = fs.readFileSync(filePath, "utf-8");
          const updated = obfuscateEmailsSafely(original);

          if (updated !== original) {
            fs.writeFileSync(filePath, updated, "utf-8");
          }
        });

        console.log("[astro-noemail] email obfuscation complete");
      }
    }
  };
}

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

function walk(dir: string, cb: (file: string) => void): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    entry.isDirectory() ? walk(fullPath, cb) : cb(fullPath);
  }
}

export async function obfuscateHtmlResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const updated = obfuscateEmailsSafely(html);
  if (updated === html) return response;

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(updated, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Safely obfuscate emails:
 * - skips script/style/noscript
 * - avoids double-encoding
 */
function obfuscateEmailsSafely(html: string): string {
  const BLOCK_TAGS = /<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi;

  const emailRegex =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

  const blocks: string[] = [];

  // Temporarily remove unsafe blocks
  const stripped = html.replace(BLOCK_TAGS, match => {
    blocks.push(match);
    return `__ASTRO_NOEMAIL_BLOCK_${blocks.length - 1}__`;
  });

  const processed = stripped.replace(emailRegex, match => {
    // Prevent double-encoding
    if (match.includes("&#")) return match;

    return match
      .split("")
      .map(char => `&#${char.charCodeAt(0)};`)
      .join("");
  });

  // Restore blocks untouched
  return processed.replace(
    /__ASTRO_NOEMAIL_BLOCK_(\d+)__/g,
    (_, i) => blocks[Number(i)]
  );
}
