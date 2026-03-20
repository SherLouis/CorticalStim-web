import parseMniImplantationFromTsv from '@/ui/tsvMniImplantationParser/tsvMniImplantationParser';
import { ElectrodeFormValues, SideOptions } from '@/core/models/stimulationForm';

describe('parseMniImplantationFromTsv', () => {
    it('should return correct electrodes from valid TSV data', () => {
        // given (C' electrode with 10 contacts and K' electrode with 5 contacts)
        const tsvData = `C'1\t-41.3522\t0.5871\t-39.8565\nC'2\t-41.6605\t-8.6854\t-36.2286\nC'3\t-42.8303\t-15.0522\t-32.0242\nC'4\t-42.4834\t-20.9316\t-27.0660\nC'5\t-38.6144\t-26.8276\t-20.6728\nC'6\t-37.0851\t-33.5468\t-12.0979\nC'7\t-34.9843\t-40.3955\t-7.7197\nC'8\t-32.1341\t-49.5543\t-5.6693\nC'9\t-31.4599\t-58.4804\t-5.8093\nC'10\t-39.5183\t-68.8643\t1.0658\nK'1\t-15.5029\t-2.4881\t-17.8811\nK'2\t-22.9089\t-0.1141\t-16.9893\nK'3\t-31.8187\t-2.0229\t-20.6444\nK'4\t-41.6604\t0.3552\t-22.1476\nK'5\t-51.3773\t1.6873\t-25.8176`;

        // when
        const result = parseMniImplantationFromTsv(tsvData);

        // then
        expect(result).toHaveLength(2); // Two electrodes: C' and K'
        expect(result[0].label).toBe(`C'`);
        expect(result[0].n_contacts).toBe(10);
        expect(result[0].stim_points.length).toBe(9);
        expect(result[1].label).toBe(`K'`);
        expect(result[1].n_contacts).toBe(5);
        expect(result[1].stim_points.length).toBe(4);
    });

    it('should remove trailing _ from electrode label', () => {
        // given
        const tsvData = `L_1\t-4\t1\t2\nL_2\t-5\t3\t6`;

        // when
        const result = parseMniImplantationFromTsv(tsvData);

        // then
        expect(result[0].label).toBe('L'); 
    });

    it('should compute side based on MNI coordinates', () => {
        // given
        const tsvData = `L1\t-4\t1\t2\nL2\t-5\t3\t6\nR1\t4\t1\t2\nR2\t5\t3\t6`;

        // when
        const result = parseMniImplantationFromTsv(tsvData);

        // then
        expect(result[0].side).toBe('left'); // First electrode (L1) is on the left side
        expect(result[1].side).toBe('right'); // Second electrode (R1) is on the right side
    });

    it('should warn and skip rows with invalid column length', () => {
        // given
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const tsvData = `C1\t10\t20\t30\nC2\t11\t21\nC3\t-10\t-20\t-30\nC4\t-11\t-21\t-31`;

        // when
        const result = parseMniImplantationFromTsv(tsvData);

        // then
        expect(result).toHaveLength(1);
        expect(result[0].n_contacts).toBe(3); // C1, C3 and C4 are valid
        expect(result[0].stim_points.length).toBe(2);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        consoleWarnSpy.mockRestore();
    });

    it('should return an empty array if no valid rows are present', () => {
        // given
        const tsvData = 'C1\t11\t21\n'; // Invalid row

        // when
        const result = parseMniImplantationFromTsv(tsvData);

        // then
        expect(result).toHaveLength(0); // No valid electrodes
    });
});
