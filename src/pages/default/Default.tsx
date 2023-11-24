import { Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function DefaultPage() {
    const {t} = useTranslation();

    return <Title order={1}>{t('pages.default.message')}</Title>
}