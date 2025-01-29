import { ActionIcon, Text, Box, Group, Tabs, Alert, MediaQuery, TextInput, Input } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import StimulationFormValues from "../../core/models/stimulationForm";
import { useEffect, useRef, useState } from "react";
import ElectrodeSetupStep from "./tabs/t1_ImplantationSetup";
import StimulationsTab from "./tabs/t2_Stimulations";
import SummaryTab, { SummaryFilters } from "./tabs/t3_Summary";
import { IconFolderOpen, IconDownload, IconAlertCircle, IconCheck, IconX, IconPencil } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCustomTabStyle } from "../../components/StyledComponents/StyledTabs";
import { useViewportSize } from "@mantine/hooks";

// TODO: make everything (text, sizes, layout) responsive

// TODO: empêcher de quitter la page si pas enregistré depuis dernières modifs
export default function StimulationToolPage() {
    const { t } = useTranslation();
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    const [form_previous_values, set_form_previous_values] = useState<StimulationFormValues>({
        name: "untitled-" + new Date().toISOString().split('T')[0],
        electrode_params: {
            type: "",
            separation: 0,
            diameter: 0,
            length: 0
        },
        electrodes: []
    });
    const form = useForm<StimulationFormValues>({
        initialValues: form_previous_values,
        validate: {
            electrode_params: {
                separation: (value) => value === 0 ? t("pages.stimulationTool.validation.electrode_params.separation") : null,
                diameter: (value) => value === 0 ? t("pages.stimulationTool.validation.electrode_params.diameter") : null,
                length: (value) => value === 0 ? t("pages.stimulationTool.validation.electrode_params.length") : null
            },
            electrodes: {
                label: (value, values) => values.electrodes.map((e) => e.label).filter((v) => v === value).length > 1 ? t("pages.stimulationTool.validation.electrodes.label") : null,
                side: (value) => value === "" ? t("pages.stimulationTool.validation.electrodes.side") : null
            }
        },
        validateInputOnBlur: true
    })

    const [activeTab, setActiveTab] = useState<string | null>('implantation');
    const [summaryFilters, setSummaryFilters] = useState<SummaryFilters>({});
    const [hasUnsavedData, setHasUnsavedData] = useState(false);

    const downloadFormValues = () => {
        var data = new Blob([JSON.stringify(form.values)], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `${form.values.name}.json`);
        tempLink.click();
        set_form_previous_values(form.values);
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
                form.setValues(values);
                set_form_previous_values(values);
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

    const computeShouldDisplayUnsavedMessage = () => {
        return JSON.stringify(form.values) !== JSON.stringify(form_previous_values);
    }

    useEffect(() => setHasUnsavedData(computeShouldDisplayUnsavedMessage()), [form.values, form_previous_values, computeShouldDisplayUnsavedMessage]);

    const customTabStyle = useCustomTabStyle();
    // TODO : different layout for smaller screens
    return (
        <Box mx={"sm"} h={"100%"} m={0} p={0}>
            <Group h={"4%"}>
                <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} style={{ display: 'none' }} />
                <ActionIcon title={t('pages.stimulationTool.button_open_form')}>
                    <IconFolderOpen onClick={() => openInputFileRef.current?.click()} />
                </ActionIcon>
                <ActionIcon title={t('pages.stimulationTool.button_download_form')}>
                    <IconDownload onClick={downloadFormValues} />
                </ActionIcon>
                {/** Stimulation name / edit box */}
                <Group spacing={0} position="left">
                    <TextInput
                        {...form.getInputProps('name')}
                        variant="unstyled"
                        style={{ fontWeight: 'bold', padding: 0, margin: 0, border: 'none', backgroundColor: 'transparent', height: 'auto', width: 'fit-content', boxSizing: 'border-box', display: 'inline-block' }}
                    />
                </Group>

                {/** TODO: additional button to save in cloud. Disable button and display warning if not logged in */}

                {/** Warning if not saved */}
                {hasUnsavedData &&
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} p={'xs'}>
                        <Group>
                            <Text fw={700} >{t('pages.stimulationTool.unsaved_alert_title')}</Text>
                            <Text >{t('pages.stimulationTool.unsaved_alert_text')}</Text>
                        </Group>
                    </Alert>
                }
            </Group>
            <Tabs value={activeTab} onTabChange={setActiveTab} variant="outline" radius={"xl"} classNames={customTabStyle.classes} h={"96%"}>
                <Tabs.List grow mah={"5%"}>
                    <Tabs.Tab value="implantation">{t("pages.stimulationTool.implantation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="stimulation">{t("pages.stimulationTool.stimulation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="summary">{t("pages.stimulationTool.summary.tab_title")}</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="implantation" h={"95%"}><ElectrodeSetupStep form={form} /></Tabs.Panel>
                <Tabs.Panel value="stimulation" h={"95%"}><StimulationsTab form={form} viewPointSummary={handleViewPointSummary} /></Tabs.Panel>
                <Tabs.Panel value="summary" h={"95%"} ><SummaryTab form={form} filters={summaryFilters} /></Tabs.Panel>
            </Tabs>
        </Box >
    );
}