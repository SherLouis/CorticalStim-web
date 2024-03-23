import { TabProperties } from "./tab_properties";

// TODO: table with results summary
// TODO: be able to filter table
// TODO: be able to export table to csv / excel

export default function SummaryTab({form, filters}: SummaryTabProps) {
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