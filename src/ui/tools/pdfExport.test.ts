import { DataTableColumn } from 'mantine-datatable';

import { Result } from "@/ui/core/types";

import { exportResultsToPdf, getFormattedCellValue } from './pdfExport';

jest.mock('jspdf', () => {
    const mockAutoTable = jest.fn();
    const mockDoc = {
        autoTable: mockAutoTable,
        save: jest.fn(),
        setFontSize: jest.fn(),
        text: jest.fn(),
        getNumberOfPages: jest.fn().mockReturnValue(1),
        setPage: jest.fn(),
        internal: {
            pageSize: {
                getWidth: jest.fn().mockReturnValue(297),
                getHeight: jest.fn().mockReturnValue(210),
            },
        },
    };
    function MockJsPDF() {
        return mockDoc;
    }
    return {
        jsPDF: MockJsPDF,
        __esModule: true,
        mockDoc,
        mockAutoTable,
    };
});

jest.mock('jspdf-autotable', () => {
    const { mockAutoTable } = require('jspdf');
    return {
        __esModule: true,
        default: mockAutoTable,
    };
});

const { mockDoc, mockAutoTable } = require('jspdf');

const mockT = (key: string) => {
    const translations: Record<string, string> = {
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.unknown': 'Unknown',
    };
    return translations[key] || key;
};

const createMockColumns = (): DataTableColumn<Result>[] => [
    { accessor: 'electrode', title: 'Electrode', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false },
    { accessor: 'pointId', title: 'Point', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false, render: (r: Result) => `Display: ${r.pointId}` },
    { accessor: 'amplitude', title: 'Amplitude', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false, render: (r: Result) => `${r.amplitude} mA` },
    { accessor: 'post_discharge', title: 'Post Discharge', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false, render: (r: Result) => mockT(r.post_discharge ? 'common.yes' : 'common.no') },
];

const createMockRecords = (): Result[] => [
    {
        id: '1',
        electrode: 'E1',
        pointId: 'E1/1-2',
        roi: 'Frontal',
        stimulation_time: '2024-01-15 10:30:00',
        amplitude: 2.0,
        duration: 1.0,
        frequency: 50,
        length_path: 1000,
        charge_density: 25.5,
        task: 'Language',
        cognitive_effect: 'Speech arrest',
        epi_manifestation: 'None',
        contact_in_epi_zone: 'no',
        contact_in_epi_zone_comments: '',
        post_discharge: false,
        post_discharge_details: '-',
        crisis: false,
        crisis_comments: '',
    },
    {
        id: '2',
        electrode: 'E2',
        pointId: 'E2/3-4',
        roi: 'Temporal',
        stimulation_time: '2024-01-15 10:35:00',
        amplitude: 3.0,
        duration: 1.5,
        frequency: 60,
        length_path: 1200,
        charge_density: 30.2,
        task: 'Memory',
        cognitive_effect: 'No effect',
        epi_manifestation: 'After-discharge',
        contact_in_epi_zone: 'yes',
        contact_in_epi_zone_comments: 'Near seizure focus',
        post_discharge: true,
        post_discharge_details: '5s, local, type1',
        crisis: false,
        crisis_comments: '',
    },
];

describe('pdfExport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFormattedCellValue', () => {
        test('uses render function when provided', () => {
            const record = createMockRecords()[0];
            const column = createMockColumns()[1];
            const result = getFormattedCellValue(record, column, mockT, 0);
            expect(result).toBe('Display: E1/1-2');
        });

        test('uses accessor value when no render function', () => {
            const record = createMockRecords()[0];
            const column = createMockColumns()[0];
            const result = getFormattedCellValue(record, column, mockT, 0);
            expect(result).toBe('E1');
        });

        test('returns empty string for undefined/null values', () => {
            const record = createMockRecords()[0];
            // Create a column with an accessor that doesn't exist on the record
            const column: DataTableColumn<Result> = { accessor: 'nonexistent' as keyof Result, title: 'Test', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false };
            const result = getFormattedCellValue(record, column, mockT, 0);
            expect(result).toBe('');
        });
    });

    describe('exportResultsToPdf', () => {
        test('calls jsPDF and autoTable with correct data', () => {
            const records = createMockRecords();
            const columns = createMockColumns();

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            // autoTable is called as autoTable(doc, options)
            expect(mockAutoTable).toHaveBeenCalledTimes(1);
            const callArgs = mockAutoTable.mock.calls[0][1]; // Second argument is options

            expect(callArgs.head).toEqual([['Electrode', 'Point', 'Amplitude', 'Post Discharge']]);
            expect(callArgs.body).toEqual([
                ['E1', 'Display: E1/1-2', '2 mA', 'No'],
                ['E2', 'Display: E2/3-4', '3 mA', 'Yes'],
            ]);
        });

        test('uses render function from column definition', () => {
            const records = createMockRecords();
            const columns = createMockColumns();

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            const callArgs = mockAutoTable.mock.calls[0][1];
            expect(callArgs.body[0][1]).toBe('Display: E1/1-2');
            expect(callArgs.body[0][2]).toBe('2 mA');
        });

        test('saves file with correct filename format', () => {
            const records = createMockRecords();
            const columns = createMockColumns();

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            expect(mockDoc.save).toHaveBeenCalledTimes(1);
            const savedFilename = mockDoc.save.mock.calls[0][0];
            expect(savedFilename).toMatch(/^PAT001_\d{4}-\d{2}-\d{2}_summary\.pdf$/);
        });

        test('adds header and page numbers', () => {
            const records = createMockRecords();
            const columns = createMockColumns();

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            // Get the didDrawPage callback from autoTable options
            const callArgs = mockAutoTable.mock.calls[0][1];
            const didDrawPage = callArgs.didDrawPage;

            // Manually invoke the callback to test the header/page number logic
            didDrawPage({ pageNumber: 1 });

            // Check that header is added and font sizes are set
            expect(mockDoc.setFontSize).toHaveBeenCalledWith(12);
            expect(mockDoc.setFontSize).toHaveBeenCalledWith(8);
            expect(mockDoc.text).toHaveBeenCalledWith('PAT001 - Stimulation Summary', 14, 14);
        });

        test('handles empty records array', () => {
            const records: Result[] = [];
            const columns = createMockColumns();

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            expect(mockAutoTable).toHaveBeenCalledTimes(1);
            const callArgs = mockAutoTable.mock.calls[0][1];
            expect(callArgs.body).toEqual([]);
        });

        test('only uses provided columns (respects effectiveColumns)', () => {
            const records = createMockRecords();
            const allColumns = createMockColumns();
            const effectiveColumns = allColumns.slice(0, 2);

            exportResultsToPdf({
                records,
                columns: effectiveColumns,
                patientId: 'PAT001',
                t: mockT,
            });

            const callArgs = mockAutoTable.mock.calls[0][1];
            expect(callArgs.head).toEqual([['Electrode', 'Point']]);
            expect(callArgs.body[0]).toHaveLength(2);
        });

        test('filters out hidden columns', () => {
            const records = createMockRecords();
            const columns = createMockColumns();
            columns[1].hidden = true;

            exportResultsToPdf({
                records,
                columns,
                patientId: 'PAT001',
                t: mockT,
            });

            const callArgs = mockAutoTable.mock.calls[0][1];
            expect(callArgs.head).toEqual([['Electrode', 'Amplitude', 'Post Discharge']]);
            expect(callArgs.body[0]).toHaveLength(3);
        });
    });
});