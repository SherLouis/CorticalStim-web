import { Box, Button, Flex, Group, Stack, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import ColumnButtonSelect from "./ColumnButtonSelect";
import { StimulationTaskFormValues } from "../core/models/stimulationForm";
import Section from "./Section";


export default function StimulationTaskSelection({ form, last_values }: StimulationTaskSelectionProps) {
    const { t } = useTranslation();

    // TODO: preset
    const handleValueChange = (level: 'category' | 'subcategory' | 'characteristic', newValue: string) => {
        switch (level) {
            case 'category':
                form.setFieldValue("characteristic", "");
                form.setFieldValue("subcategory", "");
                form.setFieldValue("category", newValue === form.values.category ? "" : newValue);
                break;
            case 'subcategory':
                form.setFieldValue("characteristic", "");
                form.setFieldValue("subcategory", newValue === form.values.subcategory ? "" : newValue);
                break;
            case 'characteristic':
                form.setFieldValue("characteristic", newValue === form.values.characteristic ? "" : newValue);
                break;
        }
    }

    const setOtherValue = (value: string) => {
        form.setFieldValue("category", value);
        form.setFieldValue("subcategory", "");
        form.setFieldValue("characteristic", "");
    }

    const taskSelection = (
        <Group position={"left"} align={"flex-start"} w={"100%"} h={"90%"}>
            <Box sx={{ flex: 3 }} h={"100%"}>
                <Stack h={"100%"}>
                    <Button compact size="sm"
                        variant={JSON.stringify(form.values) === JSON.stringify(NO_TASK) ? "filled" : "light"}
                        onClick={() => { form.setValues(NO_TASK); }}>
                        {t('pages.stimulationTool.stimulation.task_no_task_used')}
                    </Button>
                    <Box p={0} m={0} display={last_values.length > 0 ? 'block' : 'none'}>
                        <Title order={6}>{t('pages.stimulationTool.stimulation.task_last_used_title')}</Title>
                        <Button.Group orientation="vertical">
                            {last_values.map((v, i) => (
                                <Button compact size="sm" key={"btn_last_task_" + i}
                                    variant={formatSelectedTask(form.values) === formatSelectedTask(v) ? "filled" : "light"}
                                    onClick={() => { form.setValues(v); }}>
                                    {formatSelectedTask(v)}
                                </Button>
                            ))}
                        </Button.Group>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ flex: 9 }} h={"100%"}>
                <Stack h={"100%"} spacing={0}>
                    <Box h={"90%"} w={"100%"}>
                        <TaskTable form={form} handleValueChange={handleValueChange} />
                    </Box>
                    <TextInput
                        h={"10%"}
                        placeholder={t('pages.stimulationTool.stimulation.task_other_value_label')}
                        onChange={(v) => setOtherValue(v.currentTarget.value)} />
                </Stack>
            </Box>
        </Group>
    );

    return (
        <Section
            header={<Title order={5}>{t('pages.stimulationTool.stimulation.task_title')}</Title>}
            children={taskSelection}
        />
    );
}

export const formatSelectedTask = (task_values: StimulationTaskFormValues): string => {
    return task_values.category !== "" ? (task_values.category +
        (task_values.subcategory !== "" ? ('/' + task_values.subcategory
            + (task_values.characteristic !== "" ? ('/' + task_values.characteristic) : '')) : '')) : '-'
}

const TaskTable = ({ form, handleValueChange }: TaskTableProps) => {
    const tasks: TaskDdo[] = [
        { level: "category", category: "Sensitive", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Sensitive", subcategory: "Somatic", characteristic: "" },
        { level: "subcategory", category: "Sensitive", subcategory: "Visual", characteristic: "" },
        { level: "subcategory", category: "Sensitive", subcategory: "Auditory", characteristic: "" },
        { level: "category", category: "Motor", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Motor", subcategory: "Positive", characteristic: "" },
        { level: "subcategory", category: "Motor", subcategory: "Negative", characteristic: "" },
        { level: "subcategory", category: "Motor", subcategory: "Coordination", characteristic: "" },
        { level: "category", category: "Language", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Language", subcategory: "Expressive", characteristic: "" },
        { level: "characteristic", category: "Language", subcategory: "Expressive", characteristic: "Oral" },
        { level: "characteristic", category: "Language", subcategory: "Expressive", characteristic: "Writen" },
        { level: "subcategory", category: "Language", subcategory: "Receptive", characteristic: "" },
        { level: "characteristic", category: "Language", subcategory: "Receptive", characteristic: "Reading" },
        { level: "characteristic", category: "Language", subcategory: "Receptive", characteristic: "Auditory" },
        { level: "subcategory", category: "Language", subcategory: "Semantic", characteristic: "" },
        { level: "subcategory", category: "Language", subcategory: "Naming", characteristic: "" },
        { level: "characteristic", category: "Language", subcategory: "Naming", characteristic: "Visual" },
        { level: "characteristic", category: "Language", subcategory: "Naming", characteristic: "Auditory" },
        { level: "subcategory", category: "Language", subcategory: "Counting", characteristic: "" },
        { level: "category", category: "Memory", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Memory", subcategory: "Episodic", characteristic: "" },
        { level: "characteristic", category: "Memory", subcategory: "Episodic", characteristic: "Verbal" },
        { level: "characteristic", category: "Memory", subcategory: "Episodic", characteristic: "Visual" },
        { level: "subcategory", category: "Memory", subcategory: "Working", characteristic: "" },
        { level: "characteristic", category: "Memory", subcategory: "Working", characteristic: "Verbal" },
        { level: "characteristic", category: "Memory", subcategory: "Working", characteristic: "Visual" },
        { level: "subcategory", category: "Memory", subcategory: "Semantic", characteristic: "" },
        { level: "category", category: "Executive", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Executive", subcategory: "Calcul", characteristic: "" },
    ];

    const getTaskOptions = (level: 'category' | 'subcategory' | 'characteristic') => {
        switch (level) {
            case 'category':
                return tasks.filter((task) => task.level === level).map((task) => task.category);
            case 'subcategory':
                return tasks.filter((task) => task.level === level
                    && task.category === form.values.category).map((task) => task.subcategory);
            case 'characteristic':
                return tasks.filter((task) => task.level === level
                    && task.category === form.values.category
                    && task.subcategory === form.values.subcategory).map((task) => task.characteristic);
            default:
                return [];
        }
    }

    return (
        <Stack w={"100%"} h={"100%"} p={0} spacing={"xs"}>
            <Flex direction={"row"} justify={"flex-start"} align={"flex-start"} wrap={"nowrap"} w={"100%"} h={"100%"}>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }}>
                    <Box h={"100%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getTaskOptions('category')}
                            currentValue={form.values.category}
                            onChange={(v) => handleValueChange('category', v)}
                        />
                    </Box>
                </Stack>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }} px={"sm"}>
                    <Box h={"100%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getTaskOptions('subcategory')}
                            currentValue={form.values.subcategory}
                            onChange={(v) => handleValueChange('subcategory', v)}
                        />
                    </Box>
                </Stack>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }}>
                    <Box h={"100%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getTaskOptions('characteristic')}
                            currentValue={form.values.characteristic}
                            onChange={(v) => handleValueChange('characteristic', v)}
                        />
                    </Box>
                </Stack>
            </Flex>
        </Stack>
    );
}

interface TaskTableProps {
    form: UseFormReturnType<StimulationTaskFormValues>;
    handleValueChange: (level: 'category' | 'subcategory' | 'characteristic', newValue: string) => void
}

export interface TaskDdo {
    level: string;
    category: string;
    subcategory: string;
    characteristic: string
}

interface StimulationTaskSelectionProps {
    form: UseFormReturnType<StimulationTaskFormValues>;
    last_values: { category: string; subcategory: string; characteristic: string }[];
}


export const NO_TASK: StimulationTaskFormValues = { category: "None", subcategory: "", characteristic: "" };

