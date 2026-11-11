import { useEffect, useMemo, useRef, useState } from "react";

import { ActionIcon, Alert, Box, Checkbox, Group, MultiSelect, Popover } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconAlertTriangle, IconFileTypeCsv, IconFilterOff, IconTableOptions } from "@tabler/icons-react";
import sortBy from 'lodash.sortby';
import { DataTable, DataTableColumn, DataTableSortStatus, useDataTableColumns } from "mantine-datatable";
import { DataTableColumnToggle } from "mantine-datatable/dist/hooks";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";

import { Electrode, Stimulation, StimulationPoint } from "@/core/domain";
import { StimulationLocation } from "@/core/domain/stimulationPoint";
import { computeChargeDensity, getStimPointDisplayLabel, getStimPointLabel } from "@/core/domain/utils";

import { TabProperties } from "./tab_properties";
import { formatEpiManifestation, formatSelectedObservedEffect } from "../../../components/StimulationEffectSelection";
import { formatSelectedTask } from "../../../components/StimulationTaskSelection";

const formatPointLocation = (point_location: StimulationLocation) => {
    switch (point_location.type) {
        case 'white':
            return point_location.isWhiteMatter ? 'white' : '';
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

const formatBool = (value: boolean, t: any) => {
    if (value === true) {
        return t('common.yes');
    }
    return t('common.no');
}

const formatYesNoUnknown = (value: string, t: any) => {
    switch (value.toLowerCase()) {
        case "yes":
            return t('common.yes');
        case "no":
            return t('common.no');
        case "unknown":
            return t('common.unknown');
        default:
            return value
    }
}

const allColumnsProps = { sortable: true, resizable: false, draggable: false, toggleable: false };

export default function SummaryTab({ store, filters }: SummaryTabProps) {
    const { t } = useTranslation();

    // Use adapter if available, otherwise fall back to form
    const source = store.session

    const allRecords = useMemo(() => {
        return (
            source.electrodes.flatMap((elec: Electrode) =>
                elec.stimulationPoints.flatMap((point: StimulationPoint) =>
                    point.stimulations.flatMap((stim: Stimulation, i: number) => {
                        return {
                            id: getStimPointLabel(elec.label, point.index) + i,
                            electrode: elec.label,
                            pointId: getStimPointLabel(elec.label, point.index),
                            roi: formatPointLocation(point.location),
                            stimulation_time: new Date(stim.time).toLocaleString(),
                            amplitude: stim.parameters.amplitude,
                            duration: stim.parameters.duration,
                            frequency: stim.parameters.frequency,
                            length_path: stim.parameters.lengthPath,
                            charge_density: computeChargeDensity(stim.parameters.amplitude, stim.parameters.lengthPath),
                            task: formatSelectedTask(stim.task),
                            cognitive_effect: formatSelectedObservedEffect(stim.effect.observed_effect),
                            observed_effect_comments: stim.effect.observed_effect_comments,
                            epi_manifestation: formatEpiManifestation(stim.effect.epi_manifestation, t),
                            contact_in_epi_zone: stim.effect.contact_in_epi_zone,
                            contact_in_epi_zone_comments: stim.effect.contact_in_epi_zone_comments,
                            post_discharge: stim.effect.post_discharge,
                            post_discharge_details: stim.effect.post_discharge ? stim.effect.pd_duration + 's, ' + stim.effect.pd_local + ', ' + stim.effect.pd_type : '-',
                            crisis: stim.effect.crisis,
                            crisis_comments: stim.effect.crisis_comments
                        } as Result
                    })
                )
            ));
    }, [source.electrodes, t]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'pointId', direction: 'desc' });
    const [pointIdList, setPointIdListHandlers] = useListState(filters ? filters.pointIds : []);

    const records = useMemo(() => {
        let data = sortBy(allRecords, sortStatus.columnAccessor);
        if (sortStatus.direction === 'desc') data.reverse();

        return data.filter((result) => {
            if (pointIdList.length !== 0 && !pointIdList.includes(result.pointId)) { return false; }
            return true;
        });
    }, [allRecords, sortStatus, pointIdList]);

    const csvFileRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);

    const lastFiltersRef = useRef(filters);
    useEffect(() => {
        if (filters !== lastFiltersRef.current) {
            setPointIdListHandlers.setState(filters?.pointIds ?? []);
            lastFiltersRef.current = filters;
        }
    }, [filters, setPointIdListHandlers]);

    const clearAllFilters = () => {
        setPointIdListHandlers.setState([]);
        setSortStatus({ columnAccessor: 'pointId', direction: 'desc' });
    }


    const columnsLocalStorageKey = 'result_table_columns';
    const tableColumns = useMemo(() => [
        { accessor: 'electrode', title: t('pages.stimulationTool.summary.results_table.electrode_title'), ...allColumnsProps },
        {
            accessor: 'pointId', title: t('pages.stimulationTool.summary.results_table.pointId_title'),
            render: (result: Result) => getStimPointDisplayLabel(result.pointId),
            filter: (
                <MultiSelect
                    data={Array.from(new Set(allRecords.map((r: Result) => r.pointId)))
                        .map((id: string) => ({ value: id, label: getStimPointDisplayLabel(id) }))}
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
            render: (result: Result) => result.amplitude + ' mA',
            ...allColumnsProps
        },
        {
            accessor: 'duration',
            title: t('pages.stimulationTool.summary.results_table.duration_title'),
            render: (result: Result) => result.duration + ' s',
            ...allColumnsProps
        },
        {
            accessor: 'frequency',
            title: t('pages.stimulationTool.summary.results_table.frequency_title'),
            render: (result: Result) => result.frequency + ' Hz',
            ...allColumnsProps
        },
        {
            accessor: 'length_path',
            title: t('pages.stimulationTool.summary.results_table.length_path_title'),
            render: (result: Result) => result.length_path + ' µs',
            defaultToggle: false,
            ...allColumnsProps
        },
        {
            accessor: 'charge_density',
            title: t('pages.stimulationTool.summary.results_table.charge_density_title'),
            render: (result: Result) => result.charge_density.toFixed(2) + ' µC/cm²',
            defaultToggle: true,
            ...allColumnsProps
        },
        { accessor: 'task', title: t('pages.stimulationTool.summary.results_table.task_title'), ...allColumnsProps },
        { accessor: 'cognitive_effect', title: t('pages.stimulationTool.summary.results_table.observed_effect_title'), ...allColumnsProps },
        { accessor: 'observed_effect_comments', title: t('pages.stimulationTool.summary.results_table.observed_effect_comments_title'), defaultToggle: false, ...allColumnsProps },
        { accessor: 'epi_manifestation', title: t('pages.stimulationTool.summary.results_table.epi_manifestation_title'), ...allColumnsProps },
        { accessor: 'contact_in_epi_zone', title: t('pages.stimulationTool.summary.results_table.contact_in_epi_zone_title'), render: (result: Result) => formatYesNoUnknown(result.contact_in_epi_zone, t), ...allColumnsProps },
        { accessor: 'contact_in_epi_zone_comments', title: t('pages.stimulationTool.summary.results_table.contact_in_epi_zone_comments_title'), defaultToggle: false, ...allColumnsProps },
        {
            accessor: 'post_discharge',
            title: t('pages.stimulationTool.summary.results_table.post_discharge_title'),
            render: (result: Result) => formatBool(result.post_discharge, t),
            ...allColumnsProps
        },
        {
            accessor: 'post_discharge_details',
            title: t('pages.stimulationTool.summary.results_table.post_discharge_details_title'),
            defaultToggle: false,
            ...allColumnsProps
        },
        {
            accessor: 'crisis',
            title: t('pages.stimulationTool.summary.results_table.crisis_title'),
            render: (result: Result) => formatBool(result.crisis, t),
            defaultToggle: false,
            ...allColumnsProps
        },
        {
            accessor: 'crisis_comments',
            title: t('pages.stimulationTool.summary.results_table.crisis_comments_title'),
            defaultToggle: false,
            ...allColumnsProps
        }
    ] as DataTableColumn<Result>[], [t, allRecords, pointIdList, setPointIdListHandlers]);

    const { effectiveColumns, columnsToggle, setColumnsToggle } = useDataTableColumns<Result>({
        key: columnsLocalStorageKey,
        columns: tableColumns
    })

    const downloadRecordsToCsv = () => {
        csvFileRef?.current?.link.click();
    }

    const csvHeaders = useMemo(() => {
        return tableColumns.map(c => {
            const columnTitle = c?.title as string;
            return { key: c.accessor, label: columnTitle };
        })
    }, [tableColumns]);

    return (
        <Box h={"100%"}>
            <Alert w={"100%"} display={records.length === 0 ? 'block' : 'none'}
                icon={<IconAlertTriangle size="2rem" color="red" />}
                title={t('pages.stimulationTool.summary.alert_no_data_title')}>
                {t('pages.stimulationTool.summary.alert_no_data_text')}
            </Alert>
            <Box h={"100%"} display={records.length > 0 ? 'block' : 'none'}>
                <CSVLink
                    data={records}
                    headers={csvHeaders}
                    filename={`${source.patient_id}_${new Date().toISOString().split('T')[0]}_summary.csv`}
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
                            columns: effectiveColumns.filter((c) => ['stimulation_time', 'amplitude', 'duration', 'frequency', 'length_path', 'charge_density', 'task'].includes(c.accessor))
                        },
                        {
                            id: 'effects_group',
                            title: t('pages.stimulationTool.summary.results_table.effects_group_title'),
                            columns: effectiveColumns.filter((c) => ['cognitive_effect', 'observed_effect_comments', 'epi_manifestation', 'contact_in_epi_zone', 'contact_in_epi_zone_comments', 'post_discharge', 'post_discharge_details', 'crisis', 'crisis_comments'].includes(c.accessor))
                        }
                    ]}
                />
            </Box>
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
    length_path: number;
    charge_density: number;
    task: string;
    cognitive_effect: string;
    epi_manifestation: string;
    contact_in_epi_zone: string;
    contact_in_epi_zone_comments: string;
    post_discharge: boolean;
    post_discharge_details: string;
    crisis: boolean;
    crisis_comments: string;
}

interface SummaryTabProps extends TabProperties {
    filters?: SummaryFilters
}

export interface SummaryFilters {
    electrodes?: string[],
    pointIds?: string[],
}