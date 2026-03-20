# CorticalStim-web AI Agent Instructions

Welcome! This document provides context, guidelines, and architectural rules for AI agents working on the CorticalStim-web project.

## 1. Project Purpose
CorticalStim-web is a clinical web application designed to help clinicians plan, map, and collect data during cortical stimulations (e.g., mapping brain functions prior to epilepsy surgery). 
It focuses heavily on data entry efficiency and clear visualization of electrode contacts and stimulation effects (e.g., cognitive tasks, EEG responses, and epileptic manifestations).

## 2. Main Features
The web application primarily consists of 3 main screens:

1. **Implantation planification**
   This screen is used by clinicians prior to the stimulation session. The goal here is to define the electrodes used and the positioning of the contacts. The positioning should ideally be made using MNI coordinates. One of the must-have features is to import the electrodes and contact positioning from a TSV (tab separated values) file. There are 2 main types of electrodes: SEEG and Grid.
   
2. **Stimulation**
   This screen is used while doing live stimulation of the implanted electrodes. The stimulation parameters must be supplied. The patient could perform a task while the stimulation is made. The clinician should be able to input the observed clinical and neurologic effects. A stimulation is made between two contacts (cathode and anode). The coordinates of the stimulation point should be computed with an average of the two contacts involved.
   
3. **Summary**
   This screen is used as an overview screen with a summary of stimulations and results. The results should be exportable.

## 3. Technical Stack
- **Framework**: React (Create React App), TypeScript
- **Routing**: `react-router-dom` v6
- **Styling & UI**: Mantine (`@mantine/core`). Note: The project may be undergoing a transition from Mantine v6 to v7. Pay close attention to imports and styling paradigms (CSS-in-JS vs native CSS variables).
- **State Management (Core)**: `Zustand` and `immer`. The overarching global state is abstracted via a hexagonal architecture pattern mapped through `StimulationRepository`. Pure TypeScript Domain Objects (`Session`, `Electrode`, `StimulationPoint`, `Stimulation`) govern business rules outside the presentation layer.
- **Form Management (Local)**: `@mantine/form` is used exclusively for volatile widget states (e.g., localized data-entry fields before submission), *not* for central session storage tracking.
- **I18n**: `react-i18next` for internationalization.

## 4. Core Domain Concepts
- **Electrodes**: Arrays of contacts placed on or in the brain.
  - **SEEG**: Depth electrodes with linear contacts.
  - **Grids**: (Upcoming feature) 2D arrays of contacts. Stimulation can happen between adjacent contacts (row, column, or diagonals). 
- **Stimulation points**: Sometimes stimulations occur on a single contact, or between two continuous contacts.
- **Tasks & Effects**: Clinicians specify stimulation parameters (amplitude, frequency, duration) and observe effects (e.g., speech arrest, visual aura, after-discharges on EEG).

## 5. Architectural Rules & Guidelines for Agents
1. **Never Remove Features**: This is a direct request from the project owner. If you are refactoring, ensure all previous functionalities (like TSV uploading, data exporting, ROI selection for white matter/VEP/Destrieux/MNI) are perfectly preserved.
2. **State Management & Domain Driven Design**: The application strongly enforces Hexagonal Architecture. The React presentation layer **must safely interact with the global state exclusively through the `useStimulationRepository()` hook** (located in `src/infra/ZustandStimulationRepository.ts`). Ensure any data edits are formally structured via pure Domain interfaces in `src/core/domain/` rather than mutating objects loosely in the UI. No business logic or complex validation should exist in the JSX.
3. **Responsive Design**: The app historically suffered from fixed percentage heights (`h={"100%"}`) that broke on smaller screens. When writing new UI, ALWAYS use Flexbox (`Stack`, `Flex`, `Group`) or CSS Grid (`SimpleGrid`) and make sure it wraps/scales gracefully for tablets. Do not hardcode `vh` or `%` heights unless absolutely necessary.
4. **Grid Electrode Preparation**: When modifying the `Electrode` Domain class or rendering logic, keep in mind that electrodes will eventually have `rows` and `columns`. Build loops and visualizers that can adapt to 2D matrices rather than strictly assuming 1D arrays.

## 6. Development Workflow
- **Run dev server**: `npm run dev:start` (Note: `npm run dev` also runs firebase emulators, which might be overkill if you're purely working on UI and not auth).
- **Format / Lint**: Keep your code clean, adhere to existing React hooks best practices, and respect the strict TypeScript compiler checks.
