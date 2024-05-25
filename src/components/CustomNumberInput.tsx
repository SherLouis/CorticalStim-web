import { NumberInput, Group, ActionIcon, NumberInputProps, MantineNumberSize, Stack, Variants, Input } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

export default function CustomNumberInput(props: CustomNumberInputProps) {
    const digit_increment = () => {
        if (props.digit_step === undefined) { return }
        props.onChange(typeof (props.value) === 'number' ? Math.min(props.value + props.digit_step, props.max !== undefined ? props.max : Infinity) : props.digit_step);
    }
    const decimal_increment = () => {
        if (props.decimal_step === undefined) { return }
        props.onChange(typeof (props.value) === 'number' ? Math.min(props.value + props.decimal_step, props.max !== undefined ? props.max : Infinity) : props.decimal_step);
    }
    const digit_decrement = () => {
        if (props.digit_step === undefined) { return }
        props.onChange(typeof (props.value) === 'number' ? Math.max(props.value - props.digit_step, props.min !== undefined ? props.min : -Infinity) : -props.digit_step);
    }
    const decimal_decrement = () => {
        if (props.decimal_step === undefined) { return }
        props.onChange(typeof (props.value) === 'number' ? Math.max(props.value - props.decimal_step, props.min !== undefined ? props.min : -Infinity) : -props.decimal_step);
    }
    return (
        <Input.Wrapper label={props.label}>
            <Group spacing={0} align='center' noWrap>
                {props.useCustom &&
                    <Stack spacing={0}>
                        <ActionIcon variant={props.variant} onClick={digit_increment} h={"50%"} size={"xs"}>
                            <IconChevronUp size={"xs"} />
                        </ActionIcon>
                        <ActionIcon variant={props.variant} onClick={digit_decrement} h={"50%"} size={"xs"}>
                            <IconChevronDown size={"xs"} />
                        </ActionIcon>
                    </Stack>}
                <NumberInput
                    value={props.value}
                    min={props.min}
                    max={props.max}
                    precision={props.precision}
                    onBlur={e => props.onChange(Math.max(props.min !== undefined ? props.min : -Infinity, Math.min(props.max !== undefined ? props.max : Infinity, Number(e.currentTarget.value))))}
                    label={undefined}
                    hideControls={props.useCustom}
                    step={props.step}
                    styles={{ input: { textAlign: 'center' } }}
                />
                {props.useCustom &&
                    <Stack spacing={0}>
                        <ActionIcon variant={props.variant} onClick={decimal_increment} h={"50%"} size={"xs"}>
                            <IconChevronUp size={"xs"} />
                        </ActionIcon>
                        <ActionIcon variant={props.variant} onClick={decimal_decrement} h={"50%"} size={"xs"}>
                            <IconChevronDown size={"xs"} />
                        </ActionIcon>
                    </Stack>}
            </Group>
        </Input.Wrapper>
    );
}

interface CustomNumberInputProps extends NumberInputProps {
    digit_step?: number;
    decimal_step?: number;
    onChange: (v: number) => void;
    spacing?: MantineNumberSize;
    variant?: Variants<'subtle' | 'filled' | 'outline' | 'light' | 'default' | 'transparent' | 'gradient'>
    useCustom?: boolean;
}