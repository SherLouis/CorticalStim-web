import { useContext, useEffect, useMemo, useRef, useState } from "react";

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
    const [editContext, setEditContext] = useState<{
        electrodeIndex: number;
        stimPointIndex: number;
        stimulationIndex: number;
    } | null>(null);

    const editStimulation = useMemo(() => editContext ? {
        ...editContext,
        onSave: () => { setEditContext(null); setActiveTab('summary'); },
        onCancel: () => { setEditContext(null); setActiveTab('summary'); },
    } : undefined, [editContext, setEditContext, setActiveTab]);

    const downloadFormValues = () => {
        const json = store.toJson();
        var data = new Blob([json], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `${store.session.patientId}-${new Date().toISOString().split('T')[0]}.json`);
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
                // TODO: show notification if schema was migrated.
                store.loadFromJson(fileReader.result as string);
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

    const handleEditFromSummary = (electrodeIndex: number, stimPointIndex: number, stimulationIndex: number) => {
        setEditContext({ electrodeIndex, stimPointIndex, stimulationIndex });
        setActiveTab('stimulation');
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
            <Group h={"4%"} noWrap py={"xs"}>
                <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} accept=".json" style={{ display: 'none' }} />
                <ActionIcon title={t('pages.stimulationTool.button_open_form')}>
                    <IconFolderOpen onClick={() => openInputFileRef.current?.click()} />
                </ActionIcon>
                <ActionIcon title={t('pages.stimulationTool.button_download_form')}>
                    <IconDownload onClick={downloadFormValues} />
                </ActionIcon>
                {/** Stimulation name / edit box */}
                <Group spacing={0} position="left" align="center" noWrap>
                    <label
                        htmlFor="patient_id"
                        style={{ marginRight: 10, fontWeight: 'bold', whiteSpace:"nowrap" }}
                    >{t('pages.stimulationTool.patient_id_label')}</label>
                    <TextInput
                        value={store.session.patientId}
                        onChange={(e) => { store.session.patientId = e.target.value; store.markDirty(); }}
                        id="patient_id"
                        placeholder={"patient id"}
                        required
                        autoFocus={store.session.patientId === ""}
                        styles={{ input: { fontWeight: 'bold' } }}
                        miw={150}
                    />
                </Group>

                {/** TODO: additional button to save in cloud. Disable button and display warning if not logged in */}

                {/** Warning if not saved */}
                {hasUnsavedData &&
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} py={0} m={0}>
                        <Group p={0} m={0} noWrap>
                            <Text fw={700} style={{whiteSpace:"nowrap"}}>{t('pages.stimulationTool.unsaved_alert_title')}</Text>
                            <Text style={{whiteSpace: "nowrap", overflow:"ellipsis"}}>{t('pages.stimulationTool.unsaved_alert_text')}</Text>
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
                <Tabs.Panel value="stimulation" h={"95%"}>
                    <StimulationsTab 
                        store={store} 
                        viewPointSummary={handleViewPointSummary}
                        editStimulation={editStimulation}
                    />
                </Tabs.Panel>
                <Tabs.Panel value="summary" h={"95%"} >
                    <SummaryTab store={store} filters={summaryFilters} onEdit={handleEditFromSummary} />
                </Tabs.Panel>
            </Tabs>
        </Box >
    );
});

export default StimulationToolPage;