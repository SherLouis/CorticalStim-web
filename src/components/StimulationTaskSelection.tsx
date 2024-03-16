import { Box, Button, List, Stack, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import ColumnButtonSelect from "./ColumnButtonSelect";
import { StimulationTaskFormValues } from "../models/stimulationForm";


export default function StimulationTaskSelection({ form, last_values }: StimulationTaskSelectionProps) {
    const { t } = useTranslation();
    
    // TODO: preset

    const handleValueChange = (level: 'category' | 'subcategory' | 'characteristic', newValue: string) => {
        switch (level) {
            case 'category':
                form.setFieldValue("characteristic", "");
                form.setFieldValue("subcategory", "");
                form.setFieldValue("category", newValue);
                break;
            case 'subcategory':
                form.setFieldValue("characteristic", "");
                form.setFieldValue("subcategory", newValue);
                break;
            case 'characteristic':
                form.setFieldValue("characteristic", newValue);
                break;
        }
    }

    return (
        <Box w={"100%"} mah={"100%"}>
            <Stack h={"100%"} spacing={"xs"}>
                <Title order={3}>{t('pages.stimulationTool.stimulation.task_title')}</Title>

                <Box>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.task_last_used_title')}</Title>
                    <Button.Group orientation='vertical'>
                        {last_values.map(v => (
                            <Button compact size="sm"
                                variant={formatSelectedTask(form.values) === formatSelectedTask(v) ? "filled" : "light"}
                                onClick={() => { form.setValues(v); }}>
                                {formatSelectedTask(v)}
                            </Button>
                        ))}
                    </Button.Group>
                </Box>

                <TaskTable form={form} handleValueChange={handleValueChange} />
            </Stack>
        </Box>
    );
}

export const formatSelectedTask = (task_values: StimulationTaskFormValues): string => {
    return task_values.category +
        (task_values.subcategory !== "" ? ('/' + task_values.subcategory
            + (task_values.characteristic !== "" ? ('/' + task_values.characteristic) : '')) : '')
}

const TaskTable = ({ form, handleValueChange }: TaskTableProps) => {
    const tasks: TaskDdo[] = [
        { level: "category", category: "Category1", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Category1", subcategory: "Subcategory1", characteristic: "" },
        { level: "characteristic", category: "Category1", subcategory: "Subcategory1", characteristic: "characteristic1" },
        { level: "characteristic", category: "Category1", subcategory: "Subcategory1", characteristic: "characteristic2" },
        { level: "subcategory", category: "Category1", subcategory: "Subcategory2", characteristic: "" },
        { level: "characteristic", category: "Category1", subcategory: "Subcategory2", characteristic: "characteristic1" },
        { level: "characteristic", category: "Category1", subcategory: "Subcategory2", characteristic: "characteristic2" },
        { level: "category", category: "Category2", subcategory: "", characteristic: "" },
        { level: "subcategory", category: "Category2", subcategory: "Subcategory1", characteristic: "" },
        { level: "characteristic", category: "Category2", subcategory: "Subcategory1", characteristic: "characteristic1" },
        { level: "characteristic", category: "Category2", subcategory: "Subcategory1", characteristic: "characteristic2" },
        { level: "subcategory", category: "Category2", subcategory: "Subcategory2", characteristic: "" },
        { level: "characteristic", category: "Category2", subcategory: "Subcategory2", characteristic: "characteristic1" },
        { level: "characteristic", category: "Category2", subcategory: "Subcategory2", characteristic: "characteristic2" },
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
        <Table sx={{ tableLayout: 'fixed', width: "100%", border: 0 }}>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Characteristic</th>
                </tr>
            </thead>
            <tbody>
                <tr key={"options"}>
                    <td valign="top">
                        <ColumnButtonSelect
                            data={getTaskOptions('category')}
                            currentValue={form.values.category}
                            onChange={(v) => handleValueChange('category', v)}
                        />
                    </td>
                    <td valign="top">
                        <ColumnButtonSelect
                            data={getTaskOptions('subcategory')}
                            currentValue={form.values.subcategory}
                            onChange={(v) => handleValueChange('subcategory', v)}
                        />
                    </td>
                    <td valign="top">
                        <ColumnButtonSelect
                            data={getTaskOptions('characteristic')}
                            currentValue={form.values.characteristic}
                            onChange={(v) => handleValueChange('characteristic', v)}
                        />
                    </td>
                </tr>
            </tbody>
        </Table>
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
