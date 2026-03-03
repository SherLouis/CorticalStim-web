# CorticalStim-web AI Agent Instructions

Welcome! This document provides context, guidelines, and architectural rules for AI agents working on the CorticalStim-web project.

## 1. Project Purpose
CorticalStim-web is a clinical web application designed to help clinicians plan, map, and collect data during cortical stimulations (e.g., mapping brain functions prior to epilepsy surgery). 
It focuses heavily on data entry efficiency and clear visualization of electrode contacts and stimulation effects (e.g., cognitive tasks, EEG responses, and epileptic manifestations).

## 2. Technical Stack
- **Framework**: React (Create React App), TypeScript
- **Routing**: `react-router-dom` v6
- **Styling & UI**: Mantine (`@mantine/core`). Note: The project may be undergoing a transition from Mantine v6 to v7. Pay close attention to imports and styling paradigms (CSS-in-JS vs native CSS variables).
- **Form Management**: `@mantine/form`. The state of a patient's mapping session is heavily centralized in a huge form object: `StimulationFormValues`.
- **I18n**: `react-i18next` for internationalization.

## 3. Core Domain Concepts
- **Electrodes**: Arrays of contacts placed on or in the brain.
  - **SEEG**: Depth electrodes with linear contacts.
  - **Grids**: (Upcoming feature) 2D arrays of contacts. Stimulation can happen between adjacent contacts (row, column, or diagonals). 
- **Stimulation points**: Sometimes stimulations occur on a single contact, or between two continuous contacts.
- **Tasks & Effects**: Clinicians specify stimulation parameters (amplitude, frequency, duration) and observe effects (e.g., speech arrest, visual aura, after-discharges on EEG).

## 4. Architectural Rules & Guidelines for Agents
1. **Never Remove Features**: This is a direct request from the project owner. If you are refactoring, ensure all previous functionalities (like TSV uploading, data exporting, ROI selection for white matter/VEP/Destrieux/MNI) are perfectly preserved.
2. **State Management**: The app relies strongly on `form.values` provided by `useForm`. If you need to manipulate electrode data deeply in child components, either pass the `form` object or use context, but avoid desynchronizing local component state from the master form state.
3. **Responsive Design**: The app historically suffered from fixed percentage heights (`h={"100%"}`) that broke on smaller screens. When writing new UI, ALWAYS use Flexbox (`Stack`, `Flex`, `Group`) or CSS Grid (`SimpleGrid`) and make sure it wraps/scales gracefully for tablets. Do not hardcode `vh` or `%` heights unless absolutely necessary.
4. **Grid Electrode Preparation**: When modifying `ElectrodeFormValues` or rendering logic, keep in mind that electrodes will eventually have `rows` and `columns`. Build loops and visualizers that can adapt to 2D matrices rather than strictly assuming 1D arrays.

## 5. Development Workflow
- **Run dev server**: `npm run dev:start` (Note: `npm run dev` also runs firebase emulators, which might be overkill if you're purely working on UI and not auth).
- **Format / Lint**: Keep your code clean, adhere to existing React hooks best practices, and respect the strict TypeScript compiler checks.
