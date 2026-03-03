import { NumberInput, Group, ActionIcon, NumberInputProps, Stack, Input } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

export default function CustomNumberInput(props: CustomNumberInputProps) {
    const digit_increment = () => {
        if (props.digit_step === undefined) { return }
        const new_value = typeof (props.value) === 'number' ? Math.min(props.value + props.digit_step, typeof props.max === 'number' ? props.max : Infinity) : props.digit_step;
        props.onChange(parseFloat(new_value.toFixed(props.decimalScale ?? 1)));
    }
    const decimal_increment = () => {
        if (props.decimal_step === undefined) { return }
        const new_value = typeof (props.value) === 'number' ? Math.min(props.value + props.decimal_step, typeof props.max === 'number' ? props.max : Infinity) : props.decimal_step;
        props.onChange(parseFloat(new_value.toFixed(props.decimalScale ?? 1)));
    }
    const digit_decrement = () => {
        if (props.digit_step === undefined) { return }
        const new_value = typeof (props.value) === 'number' ? Math.max(props.value - props.digit_step, typeof props.min === 'number' ? props.min : -Infinity) : -props.digit_step;
        props.onChange(parseFloat(new_value.toFixed(props.decimalScale ?? 1)));
    }
    const decimal_decrement = () => {
        if (props.decimal_step === undefined) { return }
        const new_value = typeof (props.value) === 'number' ? Math.max(props.value - props.decimal_step, typeof props.min === 'number' ? props.min : -Infinity) : -props.decimal_step;
        props.onChange(parseFloat(new_value.toFixed(props.decimalScale ?? 1)));
    }
    return (
        <Input.Wrapper label={props.label}>
            <Group gap={0} align='center' wrap="nowrap">
                {props.useCustom &&
                    <Stack gap={0}>
                        <ActionIcon variant={props.variant} onClick={digit_increment} h={"50%"} size={"xs"}>
                            <IconChevronUp size={16} />
                        </ActionIcon>
                        <ActionIcon variant={props.variant} onClick={digit_decrement} h={"50%"} size={"xs"}>
                            <IconChevronDown size={16} />
                        </ActionIcon>
                    </Stack>}
                <NumberInput
                    value={props.value}
                    min={typeof props.min === 'number' ? props.min : undefined}
                    max={typeof props.max === 'number' ? props.max : undefined}
                    onBlur={e => props.onChange(Math.max(typeof props.min === 'number' ? props.min : -Infinity, Math.min(typeof props.max === 'number' ? props.max : Infinity, Number(e.currentTarget.value))))}
                    label={undefined}
                    hideControls={props.useCustom}
                    step={props.step}
                    decimalScale={props.decimalScale}
                    styles={{ input: { textAlign: 'center' } }}
                />
                {props.useCustom &&
                    <Stack gap={0}>
                        <ActionIcon variant={props.variant} onClick={decimal_increment} h={"50%"} size={"xs"}>
                            <IconChevronUp size={16} />
                        </ActionIcon>
                        <ActionIcon variant={props.variant} onClick={decimal_decrement} h={"50%"} size={"xs"}>
                            <IconChevronDown size={16} />
                        </ActionIcon>
                    </Stack>}
            </Group>
        </Input.Wrapper>
    );
}

interface CustomNumberInputProps extends NumberInputProps {
    digit_step?: number;
    decimal_step?: number;
    onChange: (v: string | number) => void;
    spacing?: number | string;
    variant?: 'subtle' | 'filled' | 'outline' | 'light' | 'default' | 'transparent' | 'gradient';
    useCustom?: boolean;
}