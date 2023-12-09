import { PDFViewer } from '@react-pdf/renderer';
import { Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import ReportDocument from '../../components/ReportDocument/ReportDocument';

export default function ReportPage() {
    const { t } = useTranslation();
    return (
        <>
            <Title order={1}>{t('pages.report.message')}</Title>
            <PDFViewer>
                <ReportDocument />
            </PDFViewer>
        </>
    );
}