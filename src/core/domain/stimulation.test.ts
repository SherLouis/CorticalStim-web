import { StimulationParameters } from "./stimulation";

test('computeChargeDensity', () => {
    const parameters = new StimulationParameters({ amplitude: 5, lengthPath: 5 })

    expect(parameters.chargeDensity()).toBe(0.5);
});
