import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataTableColumn } from 'mantine-datatable';

import { Result } from '@/ui/core/types';

export interface PdfExportConfig<T extends Result> {
    records: T[];
    columns: DataTableColumn<T>[];
    patientId: string;
    t: (key: string) => string;
}

export const getFormattedCellValue = <T extends Result>(
    record: T,
    column: DataTableColumn<T>,
    t: (key: string) => string,
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

export const exportResultsToPdf = <T extends Result>(config: PdfExportConfig<T>): void => {
    const { records, columns, patientId, t } = config;

    
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const effectiveColumns = columns.filter(c => !c.hidden);

    const headers = effectiveColumns.map((col) => String(col.title));
    const data = records.map((record, index) =>
        effectiveColumns.map((col) => getFormattedCellValue(record, col, t, index))
    );

    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 20,
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 20 },
        },
        didDrawPage: (hookData: { pageNumber: number }) => {
            doc.setFontSize(12);
            doc.text(`${patientId} - Stimulation Summary`, 14, 14);
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
            }
        },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${patientId}_${dateStr}_summary.pdf`);
};