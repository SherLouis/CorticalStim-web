import { DataTableColumn } from 'mantine-datatable';

import { exportResultsToCsv } from './csvExport';

interface TestRecord {
    id: string;
    name: string;
    value: number;
    description: string;
}

const createMockColumns = (): DataTableColumn<TestRecord>[] => [
    { accessor: 'id', title: 'ID', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false },
    { accessor: 'name', title: 'Name', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false, render: (r: TestRecord) => `Name: ${r.name}` },
    { accessor: 'value', title: 'Value', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false, render: (r: TestRecord) => `${r.value} units` },
    { accessor: 'description', title: 'Description', sortable: true, resizable: false, draggable: false, toggleable: false, hidden: false },
];

const createMockRecords = (): TestRecord[] => [
    {
        id: '1',
        name: 'Item 1',
        value: 100,
        description: 'First item',
    },
    {
        id: '2',
        name: 'Item 2',
        value: 200,
        description: 'Second item, with comma',
    },
    {
        id: '3',
        name: 'Item "3"',
        value: 300,
        description: 'Item with "quotes"',
    },
];

const readBlobAsText = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
    });
};

describe('csvExport', () => {
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    let clickMock: jest.Mock;
    let appendChildMock: jest.Mock;
    let removeChildMock: jest.Mock;
    let createObjectURLMock: jest.Mock;
    let revokeObjectURLMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        clickMock = jest.fn();
        appendChildMock = jest.fn();
        removeChildMock = jest.fn();
        createObjectURLMock = jest.fn(() => 'blob:mock-url');
        revokeObjectURLMock = jest.fn();

        document.createElement = jest.fn((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    setAttribute: jest.fn(),
                    click: clickMock,
                } as unknown as HTMLAnchorElement;
            }
            return originalCreateElement.call(document, tagName);
        });

        document.body.appendChild = appendChildMock;
        document.body.removeChild = removeChildMock;
        URL.createObjectURL = createObjectURLMock;
        URL.revokeObjectURL = revokeObjectURLMock;
    });

    afterEach(() => {
        document.createElement = originalCreateElement;
        document.body.appendChild = originalAppendChild;
        document.body.removeChild = originalRemoveChild;
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test('exports CSV with correct headers and data', () => {
        const records = createMockRecords();
        const columns = createMockColumns();

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
        });

        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        const blobArg = createObjectURLMock.mock.calls[0][0];
        expect(blobArg).toBeInstanceOf(Blob);

        // Verify blob content by checking the download attribute
        expect(appendChildMock).toHaveBeenCalledTimes(1);
        const linkElement = appendChildMock.mock.calls[0][0];
        expect(linkElement.setAttribute).toHaveBeenCalledWith(
            'download',
            expect.stringMatching(/^PAT001_\d{4}-\d{2}-\d{2}_summary\.csv$/)
        );
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
    });

    test('uses column render functions for formatted values', () => {
        const records = createMockRecords();
        const columns = createMockColumns();

        // We need to capture the blob content to verify
        let capturedBlob: Blob;
        createObjectURLMock.mockImplementation((blob: Blob) => {
            capturedBlob = blob;
            return 'blob:mock-url';
        });

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
        });

        // Read blob content as text
        return readBlobAsText(capturedBlob!).then((text: string) => {
            const lines = text.trim().split('\n');
            expect(lines[0]).toBe('ID,Name,Value,Description');
            expect(lines[1]).toBe('1,Name: Item 1,100 units,First item');
            expect(lines[2]).toBe('2,Name: Item 2,200 units,"Second item, with comma"');
            expect(lines[3]).toBe('3,"Name: Item ""3""",300 units,"Item with ""quotes"""');
        });
    });

    test('respects visible columns only (filters hidden)', () => {
        const records = createMockRecords();
        const columns = createMockColumns();
        columns[1].hidden = true; // Hide Name column

        let capturedBlob: Blob;
        createObjectURLMock.mockImplementation((blob: Blob) => {
            capturedBlob = blob;
            return 'blob:mock-url';
        });

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
        });

        return readBlobAsText(capturedBlob!).then((text: string) => {
            const lines = text.trim().split('\n');
            expect(lines[0]).toBe('ID,Value,Description');
            expect(lines[1]).toBe('1,100 units,First item');
        });
    });

    test('uses custom filename when provided', () => {
        const records = createMockRecords();
        const columns = createMockColumns();

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
            filename: 'custom-report.csv',
        });

        expect(appendChildMock).toHaveBeenCalledTimes(1);
        const linkElement = appendChildMock.mock.calls[0][0];
        expect(linkElement.setAttribute).toHaveBeenCalledWith('download', 'custom-report.csv');
    });

    test('handles empty records array', () => {
        const records: TestRecord[] = [];
        const columns = createMockColumns();

        let capturedBlob: Blob;
        createObjectURLMock.mockImplementation((blob: Blob) => {
            capturedBlob = blob;
            return 'blob:mock-url';
        });

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
        });

        return readBlobAsText(capturedBlob!).then((text: string) => {
            const lines = text.trim().split('\n');
            expect(lines[0]).toBe('ID,Name,Value,Description');
            expect(lines.length).toBe(1); // Only header row
        });
    });

    test('properly escapes special characters (commas, quotes, newlines)', () => {
        const records: TestRecord[] = [
            {
                id: '1',
                name: 'Item, with comma',
                value: 100,
                description: 'Line 1\nLine 2',
            },
            {
                id: '2',
                name: 'Item "quoted"',
                value: 200,
                description: 'Normal',
            },
        ];
        const columns = createMockColumns();

        let capturedBlob: Blob;
        createObjectURLMock.mockImplementation((blob: Blob) => {
            capturedBlob = blob;
            return 'blob:mock-url';
        });

        exportResultsToCsv({
            records,
            columns,
            patientId: 'PAT001',
        });

        return readBlobAsText(capturedBlob!).then((text: string) => {
            // CSV with quoted newlines will have actual newlines in the text
            // Just verify the escaped content is present
            expect(text).toContain('ID,Name,Value,Description');
            expect(text).toContain('"Name: Item, with comma"');
            expect(text).toContain('"Line 1\nLine 2"');
            expect(text).toContain('"Name: Item ""quoted"""');
        });
    });
});