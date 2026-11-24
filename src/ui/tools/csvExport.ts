import { DataTableColumn } from 'mantine-datatable';

export interface CsvExportConfig<T> {
    records: T[];
    columns: DataTableColumn<T>[];
    patientId: string;
    filename?: string;
}

const escapeCsvValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
};

const getFormattedCellValue = <T>(
    record: T,
    column: DataTableColumn<T>,
    index: number
): string => {
    if (column.render) {
        return String(column.render(record, index));
    }
    const accessor = column.accessor as keyof T;
    const value = record[accessor];
    if (value === undefined || value === null) {
        return '';
    }
    return String(value);
};

export const exportResultsToCsv = <T>(config: CsvExportConfig<T>): void => {
    const { records, columns, patientId, filename } = config;

    const effectiveColumns = columns.filter((c) => !c.hidden);

    const headers = effectiveColumns.map((col) => col.title as string);
    const rows = records.map((record, index) =>
        effectiveColumns.map((col) => escapeCsvValue(getFormattedCellValue(record, col, index)))
    );

    const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `${patientId}_${new Date().toISOString().split('T')[0]}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};