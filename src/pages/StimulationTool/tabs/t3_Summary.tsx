import { TabProperties } from "./tab_properties";
import { StimulationLocationFormValues, getStimPointLabel } from "../../../models/stimulationForm";
import { useTranslation } from "react-i18next";
import { formatSelectedTask } from "../../../components/StimulationTaskSelection";
import { formatSelectedCognitiveEffect } from "../../../components/StimulationEffectSelection";
import { DataTable, DataTableColumn, DataTableSortStatus, useDataTableColumns } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import sortBy from 'lodash.sortby';
import { useListState } from "@mantine/hooks";
import { ActionIcon, Box, Checkbox, Group, MultiSelect, Popover } from "@mantine/core";
import { IconFilterOff, IconFileTypeCsv, IconTableOptions } from "@tabler/icons-react";
import { CSVLink } from "react-csv";
import { DataTableColumnToggle } from "mantine-datatable/dist/hooks";

export default function SummaryTab({ form, filters }: SummaryTabProps) {
    const { t } = useTranslation();

    const getRecordsFromForm = () => {
        // Electrode, PointId, ROI, stimulation time, stimulation parameters ..., Task, Cognitive effect, Epi effect, EEG effect
        return (
            form.values.electrodes.flatMap((elec) =>
                elec.stim_points.flatMap((point) =>
                    point.stimulations.flatMap((stim, i) => {
                        return {
                            id: getStimPointLabel(elec.label, point.index) + i,
                            electrode: elec.label,
                            pointId: getStimPointLabel(elec.label, point.index),
                            roi: formatPointLocation(point.location),
                            stimulation_time: new Date(stim.time).toLocaleString(),
                            amplitude: stim.parameters.amplitude,
                            duration: stim.parameters.duration,
                            frequency: stim.parameters.frequency,
                            lenght_path: stim.parameters.lenght_path,
                            task: formatSelectedTask(stim.task),
                            cognitive_effect: formatSelectedCognitiveEffect(stim.effect.cognitive_effect),
                            epi_manifestation: stim.effect.epi_manifestation !== '' ? t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.' + stim.effect.epi_manifestation) : '-',
                            post_discharge: stim.effect.post_discharge,
                            post_discharge_details: stim.effect.post_discharge ? stim.effect.pd_duration + 's, ' + stim.effect.pd_local + ', ' + stim.effect.pd_type : '-',
                            crisis: stim.effect.crisis
                        } as Result
                    })
                )
            ));
    }
    const formatPointLocation = (point_location: StimulationLocationFormValues) => {
        switch (point_location.type) {
            case 'white':
                return t('pages.stimulationTool.implantation.whiteMatter');
            case 'vep':
                return point_location.vep;
            case 'destrieux':
                return point_location.destrieux;
            case 'mni':
                return 'x=' + point_location.mni.x + ' y=' + point_location.mni.y + ' z=' + point_location.mni.z;
            default:
                return '-'
        }
    }

    const formatBool = (value: boolean) => {
        if (value === true) {
            return t('common.yes');
        }
        return t('common.no');
    }

    const [records, setRecords] = useState(getRecordsFromForm());
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'pointId', direction: 'desc' });
    const [pointIdList, setPointIdListHandlers] = useListState(filters ? filters.pointIds : []);
    const csvFileRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);

    useEffect(() => {
        var data = sortBy(getRecordsFromForm(), sortStatus.columnAccessor);
        data = data.filter((result) => {
            if (pointIdList.length !== 0 && !pointIdList.includes(result.pointId)) { return false; }
            return true;
        });
        setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [form, sortStatus, pointIdList])

    useEffect(() => {
        setPointIdListHandlers.setState(filters ? (filters.pointIds ? filters.pointIds : []) : [])
    }, [filters])

    const clearAllFilters = () => {
        setPointIdListHandlers.setState([]);
    }

    const allColumnsProps = { sortable: true, resizable: false, draggable: false, toggleable: false };

    const columnsLocalStorageKey = 'result_table_columns';
    const tableColumns = [
        { accessor: 'electrode', title: t('pages.stimulationTool.summary.results_table.electrode_title'), ...allColumnsProps },
        {
            accessor: 'pointId', title: t('pages.stimulationTool.summary.results_table.pointId_title'),
            filter: (
                <MultiSelect
                    data={getRecordsFromForm().flatMap((r) => r.pointId)}
                    value={pointIdList}
                    label="Points"
                    searchable
                    onChange={(newValues) => setPointIdListHandlers.setState(newValues)}
                />
            ),
            filtering: pointIdList.length !== 0,
            ...allColumnsProps
        },
        { accessor: 'roi', title: t('pages.stimulationTool.summary.results_table.roi_title'), ...allColumnsProps },
        { accessor: 'stimulation_time', title: t('pages.stimulationTool.summary.results_table.stimulation_time_title'), ...allColumnsProps },
        {
            accessor: 'amplitude',
            title: t('pages.stimulationTool.summary.results_table.amplitude_title'),
            render: (result) => result.amplitude + 'mA',
            ...allColumnsProps
        },
        {
            accessor: 'duration',
            title: t('pages.stimulationTool.summary.results_table.duration_title'),
            render: (result) => result.duration + 's',
            ...allColumnsProps
        },
        {
            accessor: 'frequency',
            title: t('pages.stimulationTool.summary.results_table.frequency_title'),
            render: (result) => result.frequency + 'Hz',
            ...allColumnsProps
        },
        {
            accessor: 'lenght_path',
            title: t('pages.stimulationTool.summary.results_table.length_path_title'),
            render: (result) => result.lenght_path + 's',
            defaultToggle: false,
            ...allColumnsProps
        },
        { accessor: 'task', title: t('pages.stimulationTool.summary.results_table.task_title'), ...allColumnsProps },
        { accessor: 'cognitive_effect', title: t('pages.stimulationTool.summary.results_table.cognitive_effect_title'), ...allColumnsProps },
        { accessor: 'epi_manifestation', title: t('pages.stimulationTool.summary.results_table.epi_manifestation_title'), ...allColumnsProps },
        {
            accessor: 'post_discharge',
            title: t('pages.stimulationTool.summary.results_table.post_discharge_title'),
            render: (result) => formatBool(result.post_discharge),
            defaultToggle: false,
            ...allColumnsProps
        },
        { accessor: 'post_discharge_details', title: t('pages.stimulationTool.summary.results_table.post_discharge_details_title'), ...allColumnsProps },
        {
            accessor: 'crisis',
            title: t('pages.stimulationTool.summary.results_table.crisis_title'),
            render: (result) => formatBool(result.crisis),
            defaultToggle: false,
            ...allColumnsProps
        }
    ] as DataTableColumn<Result>[];
    const { effectiveColumns, columnsToggle, setColumnsToggle } = useDataTableColumns<Result>({
        key: columnsLocalStorageKey,
        columns: tableColumns
    })

    const downloadRecordsToCsv = () => {
        csvFileRef?.current?.link.click();
    }

    const getCsvData = () => {
        // TODO: change this to change data in csv
        return records;
    }

    const getCsvHeaders = () => {
        return tableColumns.map(c => {
            const columnTitle = c?.title as string;
            return { key: c.accessor, label: columnTitle };
        })
    }

    return (
        <Box h={"100%"}>
            <CSVLink
                data={getCsvData()}
                headers={getCsvHeaders()}
                filename='results.csv'
                hidden
                ref={csvFileRef}
                target='_blank'
            />
            <Group position='right' h={"4%"}>
                <ActionIcon title={t('pages.stimulationTool.summary.button_filter_off')}>
                    <IconFilterOff onClick={clearAllFilters} />
                </ActionIcon>
                <Popover position='bottom-end'>
                    <Popover.Target>
                        <ActionIcon title={t('pages.stimulationTool.summary.button_select_columns')}>
                            <IconTableOptions />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Checkbox.Group
                            value={columnsToggle.filter((col) => col.toggled).map(col => col.accessor)}
                            onChange={(checkedValues) => { setColumnsToggle((prevToggleState) => prevToggleState.map(toggle => { return { ...toggle, toggled: checkedValues.includes(toggle.accessor) } as DataTableColumnToggle })) }}
                            label={t('pages.stimulationTool.summary.button_select_columns')}
                        >
                            {columnsToggle.map(c =>
                                <Checkbox
                                    value={c.accessor}
                                    key={c.accessor}
                                    label={effectiveColumns.filter(ec => ec.accessor === c.accessor).length > 0 ? effectiveColumns.filter(ec => ec.accessor === c.accessor)[0].title : ''} />
                            )}
                        </Checkbox.Group>
                    </Popover.Dropdown>
                </Popover>

                <ActionIcon title={t('pages.stimulationTool.summary.button_download_csv')}>
                    <IconFileTypeCsv onClick={downloadRecordsToCsv} />
                </ActionIcon>
            </Group>
            <DataTable
                height={"96%"}
                withColumnBorders
                striped
                highlightOnHover
                idAccessor={(record) => String(record.id)}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                storeColumnsKey={columnsLocalStorageKey}
                records={records}
                groups={[
                    {
                        id: 'implantation_group',
                        title: t('pages.stimulationTool.summary.results_table.implantation_group_title'),
                        columns: effectiveColumns.filter((c) => ['electrode', 'pointId', 'roi'].includes(c.accessor))
                    },
                    {
                        id: 'stimulation_parameters_group',
                        title: t('pages.stimulationTool.summary.results_table.stimulation_parameters_group_title'),
                        columns: effectiveColumns.filter((c) => ['stimulation_time', 'amplitude', 'duration', 'frequency', 'lenght_path', 'task'].includes(c.accessor))
                    },
                    {
                        id: 'effects_group',
                        title: t('pages.stimulationTool.summary.results_table.effects_group_title'),
                        columns: effectiveColumns.filter((c) => ['cognitive_effect', 'epi_manifestation', 'post_discharge', 'post_discharge_details', 'crisis'].includes(c.accessor))
                    }
                ]}
            />
        </Box>
    );
}

interface Result {
    id: string;
    electrode: string;
    pointId: string;
    roi: string;
    stimulation_time: string;
    amplitude: number;
    duration: number;
    frequency: number;
    lenght_path: number;
    task: string;
    cognitive_effect: string;
    epi_manifestation: string;
    post_discharge: boolean;
    post_discharge_details: string;
    crisis: boolean;
}

interface SummaryTabProps extends TabProperties {
    filters?: SummaryFilters
}

export interface SummaryFilters {
    electrodes?: string[],
    pointIds?: string[],

}