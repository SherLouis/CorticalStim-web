import { TabProperties } from "./tab_properties";
import { StimulationLocationFormValues, getStimPointLabel } from "../../../models/stimulationForm";
import { useTranslation } from "react-i18next";
import { formatSelectedTask } from "../../../components/StimulationTaskSelection";
import { formatSelectedCognitiveEffect } from "../../../components/StimulationEffectSelection";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import sortBy from 'lodash.sortby';
import { useListState } from "@mantine/hooks";
import { MultiSelect } from "@mantine/core";

// TODO: translations for column titles
// TODO: able to select what columns to show
// TODO: be able to export table to csv / excel

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
                            stimulation_time: stim.time,
                            parameters: stim.parameters,
                            task: formatSelectedTask(stim.task),
                            cognitive_effect: formatSelectedCognitiveEffect(stim.effect.cognitive_effect),
                            epi_manifestation: stim.effect.epi_manifestation.join(','),
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
    }, [filters, setPointIdListHandlers])

    return (<>
        <DataTable
            withColumnBorders
            striped
            highlightOnHover
            idAccessor={(record) => String(record.id)}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            records={records}
            columns={[
                { accessor: 'electrode', title: 'Electrode', sortable: true },
                {
                    accessor: 'pointId', title: 'Point', sortable: true,
                    filter: (
                        <MultiSelect
                            data={getRecordsFromForm().flatMap((r) => r.pointId)}
                            value={pointIdList}
                            label="Points"
                            searchable
                            onChange={(newValues) => setPointIdListHandlers.setState(newValues)}
                        />
                    ),
                    filtering: pointIdList.length !== 0
                },
                { accessor: 'roi', title: 'Location', sortable: true },
                { accessor: 'stimulation_time', title: 'Time', sortable: true },
                {
                    accessor: 'parameters',
                    title: 'Parameters',
                    render: (result) => (result.parameters ? (result.parameters.amplitude + 'mA, ' + result.parameters.duration + 's,' + result.parameters.frequency + 'Hz, ' + result.parameters.lenght_path + 's') : '-'),
                    sortable: true
                },
                { accessor: 'task', title: 'Task', sortable: true },
                { accessor: 'epi_manifestation', title: 'Epi. Manif.', sortable: true },
                { accessor: 'post_discharge', title: 'Post Discharge', render: (result) => String(result.post_discharge), sortable: true },
                { accessor: 'post_discharge_details', title: 'Post Discharge Details', sortable: true },
                { accessor: 'crisis', title: 'Crisis', render: (result) => String(result.crisis), sortable: true }
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