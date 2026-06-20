/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "on-primary-fixed-variant": "#005312",
              "on-primary-fixed": "#002204",
              "on-tertiary-fixed": "#2a1800",
              "tertiary-container": "#986200",
              "on-secondary-fixed": "#001b3d",
              "surface": "#f9f9f9",
              "inverse-surface": "#2f3131",
              "surface-bright": "#f9f9f9",
              "on-tertiary-fixed-variant": "#643f00",
              "on-tertiary": "#ffffff",
              "surface-container-low": "#f3f3f3",
              "inverse-on-surface": "#f1f1f1",
              "on-secondary-container": "#003670",
              "surface-dim": "#dadada",
              "tertiary": "#774c00",
              "primary-container": "#2e7d32",
              "tertiary-fixed": "#ffddb5",
              "surface-tint": "#1b6d24",
              "surface-container": "#eeeeee",
              "on-tertiary-container": "#ffeede",
              "surface-container-lowest": "#ffffff",
              "primary-fixed-dim": "#88d982",
              "on-secondary": "#ffffff",
              "outline": "#707a6c",
              "on-secondary-fixed-variant": "#00468c",
              "secondary-fixed-dim": "#a9c7ff",
              "on-primary-container": "#cbffc2",
              "on-error-container": "#93000a",
              "on-surface": "#1a1c1c",
              "secondary-container": "#64a1ff",
              "primary": "#0d631b",
              "error": "#ba1a1a",
              "on-primary": "#ffffff",
              "error-container": "#ffdad6",
              "surface-container-highest": "#e2e2e2",
              "outline-variant": "#bfcaba",
              "surface-variant": "#e2e2e2",
              "on-error": "#ffffff",
              "primary-fixed": "#a3f69c",
              "on-surface-variant": "#40493d",
              "secondary": "#005db7",
              "tertiary-fixed-dim": "#ffb957",
              "surface-container-high": "#e8e8e8",
              "on-background": "#1a1c1c",
              "background": "#f9f9f9",
              "secondary-fixed": "#d6e3ff",
              "inverse-primary": "#88d982"
          },
          "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
          },
          "spacing": {
              "xs": "4px",
              "container-margin": "24px",
              "xl": "32px",
              "gutter": "16px",
              "sm": "12px",
              "md": "16px",
              "lg": "24px",
              "base": "8px"
          },
          "fontFamily": {
              "title-lg": ["Inter"],
              "headline-lg": ["Inter"],
              "label-md": ["JetBrains Mono"],
              "headline-lg-mobile": ["Inter"],
              "body-md": ["Inter"],
              "headline-md": ["Inter"],
              "display-lg": ["Inter"],
              "body-lg": ["Inter"]
          },
          "fontSize": {
              "title-lg": ["20px", {"lineHeight": "28px", "fontWeight": "500"}],
              "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
              "label-md": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
              "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
              "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
              "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
              "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
              "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
          }
      }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
