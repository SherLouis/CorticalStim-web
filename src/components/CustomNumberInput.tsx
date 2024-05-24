import { NumberInput, Group, ActionIcon, NumberInputProps, MantineNumberSize, Stack, Variants, Box } from '@mantine/core';
import { IconCaretDown, IconCaretUp } from '@tabler/icons-react';

export default function CustomNumberInput(props: CustomNumberInputProps) {
    const digit_increment = () => {
        props.onChange(typeof (props.value) === 'number' ? Math.min(props.value + props.digit_step, props.max ? props.max : Infinity) : props.digit_step);
    }
    const decimal_increment = () => {
        props.onChange(typeof (props.value) === 'number' ? Math.min(props.value + props.decimal_step, props.max ? props.max : Infinity) : props.decimal_step);
    }
    const digit_decrement = () => {
        props.onChange(typeof (props.value) === 'number' ? Math.max(props.value - props.digit_step, props.min ? props.min : -Infinity) : -props.digit_step);
    }
    const decimal_decrement = () => {
        props.onChange(typeof (props.value) === 'number' ? Math.max(props.value - props.decimal_step, props.min ? props.min : -Infinity) : -props.decimal_step);
    }
    return (
        // TODO: Change this to use Input.Wrapper to make it better
        <Box h={"100%"}>
            {props.label}
            <Group spacing={0} align='end' noWrap>
                <Stack spacing={0} h={"50%"}>
                    <ActionIcon variant={props.variant} onClick={digit_increment} h={"50%"} size={"sm"}>
                        <IconCaretUp size={"sm"} />
                    </ActionIcon>
                    <ActionIcon variant={props.variant} onClick={digit_decrement} h={"50%"} size={"sm"}>
                        <IconCaretDown size={"sm"} />
                    </ActionIcon>
                </Stack>

                <NumberInput
                    {...props}
                    label={undefined}
                    hideControls
                    onChange={props.onChange}
                    type='number'
                    styles={{ input: { textAlign: 'center' } }}
                />

                <Stack spacing={0} h={"50%"}>
                    <ActionIcon variant={props.variant} onClick={decimal_increment} h={"50%"} size={"sm"}>
                        <IconCaretUp size={"sm"} />
                    </ActionIcon>
                    <ActionIcon variant={props.variant} onClick={decimal_decrement} h={"50%"} size={"sm"}>
                        <IconCaretDown size={"sm"} />
                    </ActionIcon>
                </Stack>
            </Group>
        </Box>
    );
}

interface CustomNumberInputProps extends NumberInputProps {
    digit_step: number;
    decimal_step: number;
    onChange: (v: number) => void;
    spacing?: MantineNumberSize;
    variant?: Variants<'subtle' | 'filled' | 'outline' | 'light' | 'default' | 'transparent' | 'gradient'>
}