import { Button, Group, ScrollArea, Stack } from "@mantine/core";

const ColumnButtonSelect = ({ data, onChange, currentValue }: ColumnButtonSelectProps) => {

    const handleClick = (newValue: string) => {
        onChange(newValue);
    }

    return (
        <ScrollArea w={"100%"} h={"100%"} py={"xs"} sx={{ padding: '0' }}>
            <Stack spacing={"xs"} justify="flex-start">
                {data.map((value, index) =>
                    <Button w={"85%"} m={0} p={0}
                        key={value + index}
                        compact
                        variant={currentValue === value ? "filled" : "default"}
                        onClick={() => handleClick(value)}>{value}</Button>
                )}
            </Stack>
        </ScrollArea>
    )
}

interface ColumnButtonSelectProps {
    data: string[];
    onChange: (newValue: string) => void;
    currentValue: string;
};

export default ColumnButtonSelect;