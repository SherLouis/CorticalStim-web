import { TabProperties } from "./tab_properties";
import { StimulationLocationFormValues, getStimPointLabel } from "../../../models/stimulationForm";
import { useTranslation } from "react-i18next";
import { formatSelectedTask } from "../../../components/StimulationTaskSelection";
import { formatSelectedCognitiveEffect } from "../../../components/StimulationEffectSelection";
import { DataTable, DataTableSortStatus, useDataTableColumns } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import sortBy from 'lodash.sortby';
import { useListState } from "@mantine/hooks";
import { ActionIcon, Group, MultiSelect } from "@mantine/core";
import { IconFilterOff, IconFileTypeCsv } from "@tabler/icons-react";
import { CSVLink } from "react-csv";

// TODO: bouton pour clear all filters
// TODO: be able to export table to csv / excel
// TODO: able to select what columns to show

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
                            parameters: stim.parameters,
                            task: formatSelectedTask(stim.task),
                            cognitive_effect: formatSelectedCognitiveEffect(stim.effect.cognitive_effect),
                            epi_manifestation: stim.effect.epi_manifestation.map(manif => t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.' + manif)).join(','),
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
                return 'VEP - ' + point_location.vep;
            case 'destrieux':
                return 'Destrieux - ' + point_location.destrieux;
            case 'mni':
                return 'MNI - x=' + point_location.mni.x + ' y=' + point_location.mni.y + ' z=' + point_location.mni.z;
            default:
                return '-'
        }
    }

    const [records, setRecords] = useState(getRecordsFromForm());
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'pointId', direction: 'desc' });
    const [pointIdList, setPointIdListHandlers] = useListState(filters ? filters.pointIds : []);
    const csvFileRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);

    const clearAllFilters = () => {
        setPointIdListHandlers.setState([]);
    }

    const downloadRecordsToCsv = () => {
        csvFileRef?.current?.link.click();
    }

    const getCsvData = () => {
        // TODO: change this to change data in csv
        return records;
    }

    useEffect(() => {
        console.log(pointIdList);
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

    const allColumnsProps = { sortable: true, resizable: true };

    // FixME: does not work with groups.
    const { effectiveColumns, resetColumnsWidth } = useDataTableColumns<Result>({
        key: 'result_table_columns',
        columns: [
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
                accessor: 'parameters',
                title: t('pages.stimulationTool.summary.results_table.parameters_title'),
                render: (result) => (result.parameters ? (result.parameters.amplitude + 'mA, ' + result.parameters.duration + 's,' + result.parameters.frequency + 'Hz, ' + result.parameters.lenght_path + 's') : '-'),
                ...allColumnsProps
            },
            { accessor: 'task', title: t('pages.stimulationTool.summary.results_table.task_title'), ...allColumnsProps },
            { accessor: 'epi_manifestation', title: t('pages.stimulationTool.summary.results_table.epi_manifestation_title'), ...allColumnsProps },
            { accessor: 'post_discharge', title: t('pages.stimulationTool.summary.results_table.post_discharge_title'), render: (result) => String(result.post_discharge), ...allColumnsProps },
            { accessor: 'post_discharge_details', title: t('pages.stimulationTool.summary.results_table.post_discharge_details_title'), ...allColumnsProps },
            { accessor: 'crisis', title: t('pages.stimulationTool.summary.results_table.crisis_title'), render: (result) => String(result.crisis), ...allColumnsProps }
        ]
    })

    return (<>
        <CSVLink
            data={getCsvData()}
            filename='results.csv'
            hidden
            ref={csvFileRef}
            target='_blank'
        />
        <Group>
            <ActionIcon>
                <IconFilterOff onClick={clearAllFilters} />
            </ActionIcon>
            <ActionIcon>
                <IconFileTypeCsv onClick={downloadRecordsToCsv} />
            </ActionIcon>
        </Group>
        <DataTable
            withColumnBorders
            striped
            highlightOnHover
            idAccessor={(record) => String(record.id)}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
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
                    columns: effectiveColumns.filter((c) => ['stimulation_time', 'parameters', 'task'].includes(c.accessor))
                },
                {
                    id: 'effects_group',
                    title: t('pages.stimulationTool.summary.results_table.effects_group_title'),
                    columns: effectiveColumns.filter((c) => ['epi_manifestation', 'post_discharge', 'post_discharge_details', 'crisis'].includes(c.accessor))
                }
            ]}
        />
    </>)
}

interface Result {
    id: string;
    electrode: string;
    pointId: string;
    roi: string;
    stimulation_time: string;
    parameters: {
        amplitude: number;
        duration: number;
        frequency: number;
        lenght_path: number;
    };
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