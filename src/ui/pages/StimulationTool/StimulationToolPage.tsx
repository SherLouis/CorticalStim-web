import { useContext, useEffect, useRef, useState } from "react";

import { ActionIcon, Alert, Box, Group, Tabs, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconDownload, IconFolderOpen, IconX } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { StimulationSessionStore } from "@/core/application/stores/stimulationSessionStore";

import ElectrodeSetupStep from "./tabs/t1_ImplantationSetup";
import StimulationsTab from "./tabs/t2_Stimulations";
import SummaryTab, { SummaryFilters } from "./tabs/t3_Summary";
import { useCustomTabStyle } from "../../components/StyledComponents/StyledTabs";
import { RootStoreContext } from "../../providers/RootStoreProvider";

// TODO: make everything (text, sizes, layout) responsive

const StimulationToolPage = observer(function StimulationToolPage() {
    const { t } = useTranslation();
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    // Direct store access
    const rootStore = useContext(RootStoreContext);
    const store: StimulationSessionStore = rootStore.stimulationSession;

    const [activeTab, setActiveTab] = useState<string | null>('implantation');
    const [summaryFilters, setSummaryFilters] = useState<SummaryFilters>({});
    const [hasUnsavedData, setHasUnsavedData] = useState(false);

    const downloadFormValues = () => {
        // TODO: call service to get values to save. 
        const values = store.toValues();
        var data = new Blob([JSON.stringify(values)], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `${values.patient_id}-${new Date().toISOString().split('T')[0]}.json`);
        tempLink.click();
        store.markSaved();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null) {
            return;
        }

        const uploadedFile = e.target.files[0];

        const fileReader = new FileReader();
        if (uploadedFile !== undefined)
            notifications.show({
                id: 'opened_file',
                title: t('pages.stimulationTool.notifications.loading_data_from_file_title'),
                message: t('pages.stimulationTool.notifications.loading_data_from_file_message'),
                loading: true
            });
        fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = () => {
            try {
                const values = JSON.parse(fileReader.result as string);
                // TODO: extract logic to read values, schema version, adapt to used schema and set values.
                // TODO: show notification if schema was migrated. 
                store.setValues(values);
                notifications.update({
                    id: 'opened_file',
                    title: t('pages.stimulationTool.notifications.success_loaded_from_file_title'),
                    message: t('pages.stimulationTool.notifications.success_loaded_from_file_message'),
                    autoClose: 2000,
                    icon: <IconCheck />,
                    color: 'green',
                    loading: false
                });
            }
            catch (e) {
                notifications.update({
                    id: 'opened_file',
                    title: t('pages.stimulationTool.notifications.failed_loading_from_file_title'),
                    message: t('pages.stimulationTool.notifications.failed_loading_from_file_message'),
                    autoClose: 2000,
                    icon: <IconX />,
                    color: 'red',
                    loading: false
                });
            }
        }
    };

    const handleViewPointSummary = (pointId: string) => {
        setSummaryFilters({ pointIds: [pointId] });
        setActiveTab('summary');
    }

    useEffect(() => {
        window.onbeforeunload = confirmExit;
        function confirmExit() {
            return hasUnsavedData ? "Show confirm" : null;
        }
    }, [hasUnsavedData])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setHasUnsavedData(store.isDirty);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [store.isDirty]);

    const customTabStyle = useCustomTabStyle();
    // TODO : different layout for smaller screens
    return (
        <Box mx={"sm"} h={"100%"} m={0} p={0} >
            <Group h={"4%"}>
                <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} accept=".json" style={{ display: 'none' }} />
                <ActionIcon title={t('pages.stimulationTool.button_open_form')}>
                    <IconFolderOpen onClick={() => openInputFileRef.current?.click()} />
                </ActionIcon>
                <ActionIcon title={t('pages.stimulationTool.button_download_form')}>
                    <IconDownload onClick={downloadFormValues} />
                </ActionIcon>
                {/** Stimulation name / edit box */}
                <Group spacing={0} position="left" align="center">
                    <label
                        htmlFor="patient_id"
                        style={{ marginRight: 10, fontWeight: 'bold' }}
                    >{t('pages.stimulationTool.patient_id_label')}</label>
                    <TextInput
                        value={store.session.patient_id}
                        onChange={(e) => { store.session.patient_id = e.target.value; store.markDirty(); }}
                        id="patient_id"
                        placeholder={"patient id"}
                        required
                        autoFocus={store.session.patient_id === ""}
                        styles={{ input: { fontWeight: 'bold' } }}
                    />
                </Group>

                {/** TODO: additional button to save in cloud. Disable button and display warning if not logged in */}

                {/** Warning if not saved */}
                {hasUnsavedData &&
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} py={0} m={0}>
                        <Group p={0} m={0}>
                            <Text fw={700} >{t('pages.stimulationTool.unsaved_alert_title')}</Text>
                            <Text >{t('pages.stimulationTool.unsaved_alert_text')}</Text>
                        </Group>
                    </Alert>
                }
            </Group>
            <Tabs value={activeTab} onTabChange={setActiveTab} variant="outline" radius={"xl"} classNames={customTabStyle.classes} h={"96%"} keepMounted={false}>
                <Tabs.List grow mah={"5%"}>
                    <Tabs.Tab value="implantation">{t("pages.stimulationTool.implantation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="stimulation">{t("pages.stimulationTool.stimulation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="summary">{t("pages.stimulationTool.summary.tab_title")}</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="implantation" h={"95%"}><ElectrodeSetupStep store={store} /></Tabs.Panel>
                <Tabs.Panel value="stimulation" h={"95%"}><StimulationsTab store={store} viewPointSummary={handleViewPointSummary} /></Tabs.Panel>
                <Tabs.Panel value="summary" h={"95%"} ><SummaryTab store={store} filters={summaryFilters} /></Tabs.Panel>
            </Tabs>
        </Box >
    );
});

export default StimulationToolPage;