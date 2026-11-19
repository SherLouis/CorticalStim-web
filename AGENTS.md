# CorticalStim-web AI Agent Instructions

This document provides context, guidelines, and architectural rules for AI agents working on the CorticalStim-web project.

## 1. Project Purpose
CorticalStim-web is a clinical web application designed to help clinicians plan, map, and collect data during cortical stimulations (e.g., mapping brain functions prior to epilepsy surgery). 
It focuses heavily on data entry efficiency and clear visualization of electrode contacts and stimulation effects (e.g., cognitive tasks, EEG responses, and epileptic manifestations).

## 2. Technical Stack
- **Framework**: React (Create React App), TypeScript
- **Routing**: `react-router-dom` v6
- **Styling & UI**: Mantine (`@mantine/core`) version 6
- **Form Management**: `@mantine/form`. The state of a patient's mapping session is heavily centralized in a huge form object: `StimulationFormValues`.
- **I18n**: `react-i18next` for internationalization.

## 3. Core Domain Concepts
- **Electrodes**: Arrays of contacts placed on or in the brain.
- **Stimulation points**: Sometimes stimulations occur on a single contact, or between two continuous contacts.
- **Tasks & Effects**: Clinicians specify stimulation parameters (amplitude, frequency, duration) and observe effects (e.g., speech arrest, visual aura, after-discharges on EEG).

## 4. Development Workflow
- **Run dev server**: `npm run dev:start` (Note: `npm run dev` also runs firebase emulators, which might be overkill if you're purely working on UI and not auth).
- **Format / Lint**: Keep your code clean, adhere to existing React hooks best practices, and respect the strict TypeScript compiler checks.
