import { StimulationObservedEffectFormValues } from "@/ui/core/types";

import { formatSelectedObservedEffect } from "./StimulationEffectSelection";

describe("formatSelectedObservedEffect", () => {
    it("returns '-' when effect class is empty string", () => {
        const effect: StimulationObservedEffectFormValues = { class: "", descriptor: "", details: "" };
        expect(formatSelectedObservedEffect(effect)).toBe("-");
    });

    it("returns '-' when effect class is 'None'", () => {
        const effect: StimulationObservedEffectFormValues = { class: "None", descriptor: "", details: "" };
        expect(formatSelectedObservedEffect(effect)).toBe("-");
    });

    it("returns formatted effect string when effect has class only", () => {
        const effect: StimulationObservedEffectFormValues = { class: "Cognitive", descriptor: "", details: "" };
        expect(formatSelectedObservedEffect(effect)).toBe("Cognitive");
    });

    it("returns formatted effect string when effect has class and descriptor", () => {
        const effect: StimulationObservedEffectFormValues = { class: "Cognitive", descriptor: "Dysphasic", details: "" };
        expect(formatSelectedObservedEffect(effect)).toBe("Cognitive/Dysphasic");
    });

    it("returns formatted effect string when effect has class, descriptor, and details", () => {
        const effect: StimulationObservedEffectFormValues = { class: "Cognitive", descriptor: "Dysphasic", details: "Speech arrest" };
        expect(formatSelectedObservedEffect(effect)).toBe("Cognitive/Dysphasic/Speech arrest");
    });

    it("handles array of effects correctly", () => {
        const effects: StimulationObservedEffectFormValues[] = [
            { class: "Cognitive", descriptor: "Dysphasic", details: "Speech arrest" },
            { class: "Motor Elementary", descriptor: "Tonic", details: "" },
        ];
        expect(formatSelectedObservedEffect(effects)).toBe("Cognitive/Dysphasic/Speech arrest; Motor Elementary/Tonic");
    });

    it("filters out 'None' effects from array", () => {
        const effects: StimulationObservedEffectFormValues[] = [
            { class: "None", descriptor: "", details: "" },
            { class: "Cognitive", descriptor: "Dysphasic", details: "" },
        ];
        expect(formatSelectedObservedEffect(effects)).toBe("Cognitive/Dysphasic");
    });

    it("filters out empty class effects from array", () => {
        const effects: StimulationObservedEffectFormValues[] = [
            { class: "", descriptor: "", details: "" },
            { class: "Cognitive", descriptor: "Dysphasic", details: "" },
        ];
        expect(formatSelectedObservedEffect(effects)).toBe("Cognitive/Dysphasic");
    });

    it("returns '-' when all effects are filtered out", () => {
        const effects: StimulationObservedEffectFormValues[] = [
            { class: "None", descriptor: "", details: "" },
            { class: "", descriptor: "", details: "" },
        ];
        expect(formatSelectedObservedEffect(effects)).toBe("-");
    });
});