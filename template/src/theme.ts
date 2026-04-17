/**
 * Template theme. Replace or re-export from your project's design tokens.
 *
 * Convention: the init.sh script rewrites this file to re-export from the
 * user-provided theme path. If you run init.sh without --tokens, these
 * defaults are used.
 */

export const colors = {
  bg: "#0A0F1A",
  surface: "#0F172A",
  surfaceElevated: "#1E293B",
  surfaceHover: "#334155",
  border: "#1E293B",
  text: "#FAFAFA",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  primary: "#22D3EE",
  primaryHover: "#06B6D4",
  accent: "#8B5CF6",
  gradient: "linear-gradient(135deg, #22D3EE, #8B5CF6)",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  white: "#ffffff",
};

export const font = {
  heading: "'Space Grotesk', sans-serif",
  body: "'Inter', system-ui, sans-serif",
};
