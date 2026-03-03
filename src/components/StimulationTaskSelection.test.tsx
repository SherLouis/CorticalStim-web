import { render, screen } from '@testing-library/react';
import StimulationTaskSelection from './StimulationTaskSelection';
import { useForm } from '@mantine/form';
import { MantineProvider } from '@mantine/core';

// Mock translation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Wrapper to provide Mantine theme
const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider>
            {children}
        </MantineProvider>
    );
};

const TestComponent = () => {
    const form = useForm({
        initialValues: { category: '', subcategory: '', characteristic: '' }
    });
    return <StimulationTaskSelection form={form as any} last_values={[]} />;
};

describe('StimulationTaskSelection', () => {
    it('renders the task selection title', () => {
        render(<TestComponent />, { wrapper: Wrapper });
        expect(screen.getByText('pages.stimulationTool.stimulation.task_title')).toBeInTheDocument();
    });

    it('renders no task option by default', () => {
        render(<TestComponent />, { wrapper: Wrapper });
        // The component uses the key 'pages.stimulationTool.stimulation.task_no_task_used' for the no task button
        const noTaskBtn = screen.getByText('pages.stimulationTool.stimulation.task_no_task_used');
        expect(noTaskBtn).toBeInTheDocument();
    });
});
