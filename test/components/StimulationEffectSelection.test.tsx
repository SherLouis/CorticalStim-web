import { render, screen } from '@testing-library/react';
import StimulationEffectSelection from '@/components/StimulationEffectSelection';
import { useForm } from '@mantine/form';
import { MantineProvider } from '@mantine/core';

// Mock translation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider>
            {children}
        </MantineProvider>
    );
};

const TestComponent = () => {
    const form = useForm({
        initialValues: {
            observed_effect: { class: '', descriptor: '', details: '' },
            observed_effect_comments: '',
            epi_manifestation: '',
            contact_in_epi_zone: 'unknown',
            contact_in_epi_zone_comments: '',
            post_discharge: false,
            pd_duration: undefined,
            pd_local: 'local',
            pd_type: '',
            crisis: false,
            crisis_comments: ''
        }
    });
    return <StimulationEffectSelection form={form as any} observed_effect_last_values={[]} />;
};

describe('StimulationEffectSelection', () => {
    it('renders the core effect sections', () => {
        render(<TestComponent />, { wrapper: Wrapper });

        // Check for observed effect section (header Title)
        expect(screen.getByText('pages.stimulationTool.stimulation.effect.observed_effect_label')).toBeInTheDocument();

        // Check for epileptic manifestation section
        expect(screen.getByText('pages.stimulationTool.stimulation.effect.epi_manifestation')).toBeInTheDocument();

        // Check for EEG section
        expect(screen.getByText('pages.stimulationTool.stimulation.effect.eeg')).toBeInTheDocument();
    });
});
