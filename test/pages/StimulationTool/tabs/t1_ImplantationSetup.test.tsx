import { render, screen, fireEvent } from '@testing-library/react';
import ElectrodeSetupStep from '@/pages/StimulationTool/tabs/t1_ImplantationSetup';
import React from 'react';

// Mock the translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

// Mock the Mantine provider since some legacy components (Modal) might be deep inside
jest.mock('@mantine/core', () => {
    const originalModule = jest.requireActual('@mantine/core');
    return {
        __esModule: true,
        ...originalModule,
        Modal: ({ opened, title, children }: any) => opened ? <div data-testid="mantine-modal"><h2>{title}</h2>{children}</div> : null,
    };
});

describe('ElectrodeSetupStep (Implantation)', () => {
    it('renders the 3D view placeholder and the Add Electrode panel', () => {
        render(<ElectrodeSetupStep />);
        expect(screen.getByText('Cortical Model')).toBeInTheDocument();
        expect(screen.getByText('Add Electrode')).toBeInTheDocument();
    });
    
    it('can generate a new electrode', () => {
        render(<ElectrodeSetupStep />);
        const generateBtn = screen.getByText('Generate Electrode');
        expect(generateBtn).toBeInTheDocument();
        
        fireEvent.click(generateBtn);
        // Should appear in the list (Assuming default label 'A' is used)
        const inputs = screen.getAllByDisplayValue('A');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('can transition to the contact configuration view when editing MNI', () => {
        render(<ElectrodeSetupStep />);
        
        // Ensure there is at least one electrode to edit.
        const generateBtn = screen.getByText('Generate Electrode');
        fireEvent.click(generateBtn);
        
        // Find the "Lock Contact Count" button
        const lockBtns = screen.getAllByTitle('Lock Contact Count');
        fireEvent.click(lockBtns[0]);
        
        // Now "Edit MNI" should be available
        const editBtns = screen.getAllByText(/Edit MNI/i);
        fireEvent.click(editBtns[0]);
        
        // View should swap to "Configure Contacts"
        expect(screen.getByText('Smart Calculation Available')).toBeInTheDocument();
    });
});
