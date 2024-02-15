import { ActionIcon, Box, Group, Tabs } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import StimulationFormValues from "../../models/stimulationForm";
import { useRef, useState } from "react";
import ElectrodeSetupStep from "./tabs/t1_ImplantationSetup";
import StimulationsTab from "./tabs/t2_Stimulations";
import SummaryTab from "./tabs/t3_Summary";
import { IconFolderOpen, IconDownload } from "@tabler/icons-react";

export default function StimulationToolPage() {
    const { t } = useTranslation();
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<StimulationFormValues>({
        initialValues: {
            electrode_params: {
                type: "",
                separation: 0,
                diameter: 0,
                length: 0
            },
            electrodes: []
        },
        validate: {
            electrode_params: {
                separation: (value) => value===0 ? t("pages.stimulationTool.validation.electrode_params.separation") : null,
                diameter: (value) => value===0 ? t("pages.stimulationTool.validation.electrode_params.diameter") : null,
                length: (value) => value===0 ? t("pages.stimulationTool.validation.electrode_params.length") : null
            },
            electrodes: {
                label: (value, values) => values.electrodes.map((e) => e.label).filter((v) => v === value).length > 1 ? t("pages.stimulationTool.validation.electrodes.label") : null,
                side: (value) => value === "" ? t("pages.stimulationTool.validation.electrodes.side") : null
            }
        },
        validateInputOnBlur: true
    })

    const [activeTab, setActiveTab] = useState<string | null>('implantation');

    const downloadFormValues = () => {
        var data = new Blob([JSON.stringify(form.values)], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `stimulation_${new Date().toISOString().substring(0, 10)}.json`);
        tempLink.click();
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null) {
            return;
        }
        const uploadedFile = e.target.files[0];

        const fileReader = new FileReader();
        if (uploadedFile !== undefined)
            fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = () => {
            try {
                const values = JSON.parse(fileReader.result as string);
                form.setValues(values);
            }
            catch (e) {
                // TODO: display notification instead
                console.error("**Not valid JSON file!**");
            }
        }
    };

    return (
        <Box mx={"2vh"} h={"90vh"}>
            <Group>
                <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} style={{ display: 'none' }} />
                <ActionIcon>
                    <IconFolderOpen onClick={() => openInputFileRef.current?.click()} />
                </ActionIcon>
                <ActionIcon title="Download values">
                    <IconDownload onClick={downloadFormValues} />
                </ActionIcon>
            </Group>
            <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List grow>
                    <Tabs.Tab value="implantation">{t("pages.stimulationTool.implantation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="stimulation">{t("pages.stimulationTool.stimulation.tab_title")}</Tabs.Tab>
                    <Tabs.Tab value="summary">{t("pages.stimulationTool.summary.tab_title")}</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="implantation"><ElectrodeSetupStep form={form} /></Tabs.Panel>
                <Tabs.Panel value="stimulation"><StimulationsTab form={form} /></Tabs.Panel>
                <Tabs.Panel value="summary"><SummaryTab form={form} /></Tabs.Panel>
            </Tabs>
        </Box>
    );
}