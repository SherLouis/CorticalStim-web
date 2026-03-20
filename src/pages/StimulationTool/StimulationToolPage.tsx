import { ActionIcon, Text, Box, Group, Tabs, Alert, TextInput, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ElectrodeSetupStep from "./tabs/t1_ImplantationSetup";
import StimulationsTab from "./tabs/t2_Stimulations";
import SummaryTab, { SummaryFilters } from "./tabs/t3_Summary";
import { IconFolderOpen, IconDownload, IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCustomTabStyle } from "../../components/StyledComponents/StyledTabs";
import { useStimulationRepository } from "../../infra/ZustandStimulationRepository";
import { Session } from "../../core/domain/Session";

// TODO: make everything (text, sizes, layout) responsive

export default function StimulationToolPage() {
    const { t } = useTranslation();
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    const repository = useStimulationRepository();
    const session = repository.getSession();

    const [form_previous_values, set_form_previous_values] = useState<string>(JSON.stringify(new Session()));
    
    const [activeTab, setActiveTab] = useState<string | null>('implantation');
    const [summaryFilters, setSummaryFilters] = useState<SummaryFilters>({});
    const [hasUnsavedData, setHasUnsavedData] = useState(false);

    const downloadFormValues = () => {
        var data = new Blob([JSON.stringify(session)], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `${session.patient_id}-${new Date().toISOString().split('T')[0]}.json`);
        tempLink.click();
        set_form_previous_values(JSON.stringify(session));
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
                const loadedSession = Session.fromJSON(values);
                repository.loadSession(loadedSession);
                set_form_previous_values(JSON.stringify(loadedSession));
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
        const shouldDisplayUnsavedMessage = JSON.stringify(session) !== form_previous_values;
        setHasUnsavedData(shouldDisplayUnsavedMessage)
    }, [session, form_previous_values]);

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
                <Group gap={0} justify="left" align="center">
                    <label
                        htmlFor="patient_id"
                        style={{ marginRight: 10, fontWeight: 'bold' }}
                    >{t('pages.stimulationTool.patient_id_label')}</label>
                    <TextInput
                        value={session.patient_id}
                        onChange={(event) => repository.setPatientId(event.currentTarget.value)}
                        id="patient_id"
                        placeholder={"patient id"}
                        required
                        autoFocus={session.patient_id === ""}
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
            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius={"xl"} classNames={{ tab: customTabStyle.tab }} h={"96%"}>
                <Tabs.List grow mah={"5%"}>
                    <Tabs.Tab value="implantation">{t("pages.stimulationTool.implantation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="stimulation">{t("pages.stimulationTool.stimulation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="summary">{t("pages.stimulationTool.summary.tab_title")}</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="implantation" h={"95%"}><ElectrodeSetupStep /></Tabs.Panel>
                <Tabs.Panel value="stimulation" h={"95%"}><StimulationsTab viewPointSummary={handleViewPointSummary} /></Tabs.Panel>
                <Tabs.Panel value="summary" h={"95%"} ><SummaryTab filters={summaryFilters} /></Tabs.Panel>
            </Tabs>
        </Box >
    );
}