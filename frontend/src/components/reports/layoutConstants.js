/**
 * layoutConstants.js
 * Single source of truth for all global layout dimensions, spacing scale,
 * card heights, typography, and responsive grid configurations.
 */

export const LAYOUT_CONSTANTS = {
  // Container & Structural Limits
  PAGE_MAX_WIDTH: 1600,
  
  // Spacing Scale
  SECTION_GAP: "32px",       // Spacing between major Paper section cards
  CONTAINER_PADDING: "24px",  // Internal padding inside Paper section cards
  ELEMENT_GAP: "20px",        // Gap between items/cards in grids
  SUBELEMENT_GAP: "16px",     // Gap inside cards/components
  
  // Card & Container Heights
  KPI_CARD_HEIGHT: 165,
  CHART_CONTAINER_HEIGHT: 380,
  SCATTER_PLOT_HEIGHT: 340,
  PIE_CHART_HEIGHT: 340,
  
  // Border Radius & Elevational Styling
  SECTION_RADIUS: "14px",
  CARD_RADIUS: "12px",
  
  // Global Grid Breakpoints & Minimum Widths
  KPI_MIN_WIDTH: 260,         // Min width for CSS Grid auto-fill KPI cards
  CHART_MIN_WIDTH: 320,       // Min width for responsive chart cards
  
  // Standardized Chart Margins
  CHART_MARGINS: {
    LINE: { top: 20, right: 30, left: 20, bottom: 35 },
    BAR: { top: 20, right: 30, left: 20, bottom: 40 },
    PIE: { top: 15, right: 15, left: 15, bottom: 15 },
    SCATTER: { top: 20, right: 30, left: 20, bottom: 35 }
  }
};
