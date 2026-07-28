import { alpha } from "@mui/material/styles";

/**
 * Resolves any MUI color prop (e.g. "warning.main", "warning", "success.dark", "#10b981")
 * to a concrete hex/rgb color string.
 */
export const resolveColor = (theme, colorProp = "primary") => {
    if (!theme || !theme.palette) return "#0284c7";
    if (!colorProp || typeof colorProp !== "string") return theme.palette.primary?.main || "#0284c7";

    // 1. Handle dot notation (e.g. "warning.main", "primary.dark", "success.light")
    if (colorProp.includes(".")) {
        const parts = colorProp.split(".");
        let resolved = theme.palette;
        for (const part of parts) {
            if (resolved && resolved[part]) {
                resolved = resolved[part];
            } else {
                resolved = null;
                break;
            }
        }
        if (typeof resolved === "string") {
            return resolved;
        }
    }

    // 2. Handle standard theme keys (e.g. "warning", "success", "primary", "info", "error")
    if (theme.palette[colorProp]?.main) {
        return theme.palette[colorProp].main;
    }

    // 3. Direct color strings (e.g. "#10b981", "rgb(...)")
    if (colorProp.startsWith("#") || colorProp.startsWith("rgb") || colorProp.startsWith("hsl")) {
        return colorProp;
    }

    return theme.palette.primary?.main || "#0284c7";
};

/**
 * Safely calls MUI alpha() after resolving palette keys.
 */
export const safeAlpha = (theme, colorProp, opacity) => {
    const resolved = resolveColor(theme, colorProp);
    try {
        return alpha(resolved, opacity);
    } catch (e) {
        const fallback = theme?.palette?.primary?.main || "#0369a1";
        return alpha(fallback, opacity);
    }
};
