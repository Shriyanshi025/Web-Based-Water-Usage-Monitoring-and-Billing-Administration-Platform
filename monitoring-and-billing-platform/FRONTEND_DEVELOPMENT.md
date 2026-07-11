# Web-Based Water Usage Monitoring and Billing Administration Platform

## Project Name
Water Usage Administration Platform

## Backend Version
v1.0.1-backend-security

## Frontend Branch
frontend-development

## Development Rules
1. **Frontend Isolation**: All frontend code must be developed strictly within the `frontend-development` branch. Do NOT commit frontend work to `main` until the branch is fully stable and reviewed.
2. **Backend Freeze**: The backend is completely frozen at `v1.0.1-backend-security`. No backend changes are allowed during frontend development.
3. **No Direct Backend Modifications**: Frontend development must adapt to the existing backend API. If an incompatibility is found, it must be resolved on the frontend side unless it is a critical integration bug.

## Backend Freeze Policy
The backend has been officially completed, security hardened, regression tested, version tagged, and frozen. Absolutely no modifications to backend source code, configuration files, or database schemas are permitted unless authorized for fixing a critical frontend integration bug.

## Frontend Coding Standards
- **Framework & Tooling**: Use modern frontend frameworks as requested (e.g., Next.js, Vite).
- **Styling**: Ensure rich aesthetics, responsive layouts, modern typography, and interactive dynamic design (e.g., micro-animations).
- **Component Design**: Code must be modular, reusable, and cleanly separated. Adhere to a defined design system.
- **State Management & Routing**: Ensure proper routing for protected/authenticated views and robust state management for user sessions (e.g., JWT handling).
- **SEO & Accessibility**: Use semantic HTML, proper ARIA tags where appropriate, unique IDs, and well-structured headings.

## Implementation Phases
1. **Phase 1: Environment Setup & Project Initialization**
   - Initialize frontend repository/framework setup.
   - Configure basic tooling (linters, formatters).
2. **Phase 2: UI Foundation & Design System**
   - Establish global styles, CSS variables, typography, and color palette.
   - Build reusable base components (buttons, inputs, cards).
3. **Phase 3: Authentication & Onboarding Flow**
   - Implement login, multi-step registration wizard, and JWT handling.
4. **Phase 4: Dashboard & Role-Based Routing**
   - Implement role-specific dashboards.
5. **Phase 5: Feature Integration**
   - Connect frontend components to frozen backend APIs for core features.
6. **Phase 6: Polish & Optimization**
   - Finalize animations, transitions, responsive fixes, and UX improvements.
