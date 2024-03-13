import { Button, Group, Stack } from "@mantine/core";

const ColumnButtonSelect = ({ data, onChange, currentValue }: ColumnButtonSelectProps) => {

    const handleClick = (newValue: string) => {
        onChange(newValue);
    }

    return (
        <Stack spacing={"xs"} justify="flex-start">
            {data.map((value, index) =>
                <Group key={index} spacing={"xs"}>
                    <Button w={"85%"} m={0} p={0}
                        variant={currentValue === value ? "filled" : "default"}
                        onClick={() => handleClick(value)}>{value}</Button>
                </Group>
            )}
        </Stack>
    )
}

interface ColumnButtonSelectProps {
    data: string[];
    onChange: (newValue: string) => void;
    currentValue: string;
};

export default ColumnButtonSelect;