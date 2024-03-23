import { DataTableSortStatus } from "mantine-datatable";
import { useState } from "react";
import { TabProperties } from "./tab_properties";

// TODO: table with results summary
// TODO: be able to filter table
// TODO: sortable table
// TODO: able to select what columns to show
// TODO: be able to export table to csv / excel

export default function SummaryTab({form, filters}: SummaryTabProps) {
    //const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const getRecordsFromForm = () => {
        // Electrode, PointId, ROI, stimulation time, stimulation parameters ..., Task, Cognitive effect, Epi effect, EEG effect
    }

    return (<>
        {filters?.pointIds}
    </>)
}

interface SummaryTabProps extends TabProperties {
    filters? : SummaryFilters
}

export interface SummaryFilters {
    electrodes?: string[],
    pointIds? : string[],

}