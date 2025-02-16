import { Chip, ChipProps, MantineColor, Sx, useMantineTheme } from "@mantine/core";
import { Stimulation } from "../core/models/stimulationForm";
import { NO_EFFECT } from "./StimulationEffectSelection";


const StimulatedContact = ({ selected, stimulations, onChange, forcedVariant, forcedEffect, ...props }: StimulatedContactProps) => {
    const theme = useMantineTheme();

    const SELECTED_COLOR = 'blue';
    const DEFAULT_COLOR = 'gray';
    const CRISIS_COLOR = 'red.6'
    const POST_DISCHARGE_COLOR = 'orange';
    const SINGLE_STIM_COLOR = 'green.4';
    const MULTI_STIM_COLOR = 'green.9';

    const getContactColor = (): MantineColor => {
        if (forcedVariant !== undefined) {
            switch (forcedVariant) {
                case 'default':
                    return DEFAULT_COLOR;
                case 'selected':
                    return SELECTED_COLOR;
                case 'crisis':
                    return '';
                case 'postDischarge':
                    return POST_DISCHARGE_COLOR;
                case 'singleStim':
                    return SINGLE_STIM_COLOR;
                case 'multipleStim':
                    return MULTI_STIM_COLOR;
            }
        }
        if (selected) {
            return SELECTED_COLOR;
        }
        const nbStims = stimulations.length;
        const eegCrisis = stimulations.some((stim) => stim.effect.crisis);
        const postDischarge = stimulations.some((stim) => stim.effect.post_discharge);
        if (eegCrisis) {
            return CRISIS_COLOR;
        }
        if (postDischarge) {
            return POST_DISCHARGE_COLOR;
        }
        if (nbStims === 1) {
            return SINGLE_STIM_COLOR;
        }
        if (nbStims > 1) {
            return MULTI_STIM_COLOR;
        }
        return DEFAULT_COLOR;
    };

    const getContactBorderStyle = (): Sx => {
        const EFFECT_BORDER_SX = { '& .mantine-Chip-label': { borderColor: theme.colors.red[9], borderWidth: 3, borderStyle: 'solid', borderRadius: 'xl' } };
        const NO_EFFECT_BORDER_SX = {};
        if (forcedEffect !== undefined) {
            return forcedEffect ? EFFECT_BORDER_SX : NO_EFFECT_BORDER_SX
        }
        const hasEffect = stimulations.some((stim) => stim.effect.observed_effect !== NO_EFFECT);
        return hasEffect ? EFFECT_BORDER_SX : NO_EFFECT_BORDER_SX;
    }

    const nbStims = stimulations.length;
    const color = getContactColor();
    const sx = getContactBorderStyle();

    return (
        <Chip
            checked={selected || nbStims > 0}
            variant={selected || nbStims > 0 ? 'filled' : 'light'}
            onChange={onChange}
            color={color}
            sx={sx}
            {...props}
        >
            {props.children}
        </Chip>
    );
};

interface StimulatedContactProps extends ChipProps {
    selected: boolean;
    stimulations: Stimulation[];
    onChange: (_checked: boolean) => void;
    forcedVariant?: 'default' | 'selected' | 'crisis' | 'postDischarge' | 'singleStim' | 'multipleStim' | undefined;
    forcedEffect?: boolean | undefined;
}

export default StimulatedContact;