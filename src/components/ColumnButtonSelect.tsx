import { UseFormReturnType } from "@mantine/form/lib/types";
import { Button } from "@mantine/core";
import { useState } from "react";

const ColumnButtonSelect = ({ data, form, form_path, onChange }: ColumnButtonSelectProps) => {

    const [currentValue, setValue] = useState<string>();

    const handleClick = (newValue: string) => {
        if (newValue !== currentValue) {
            form.setFieldValue(form_path, newValue);
            setValue(newValue);
            onChange(newValue);
        }
    }

    return (
        <Button.Group orientation="vertical">
            {data.map((value, index) =>
                <Button key={index}
                    variant={form.getInputProps(form_path).value === value ? "filled" : "default"}
                    onClick={() => handleClick(value)}>{value}</Button>
            )}
        </Button.Group>
    )
}

interface ColumnButtonSelectProps {
    data: string[];
    form: UseFormReturnType<any>;
    form_path: string;
    onChange: (newValue: string) => void;
};

export default ColumnButtonSelect;