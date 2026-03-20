import { Chip, ChipProps, MantineColor, MantineTheme, useMantineTheme } from "@mantine/core";
import React from "react";
import { Stimulation } from "../core/models/stimulationForm";
import { NO_EFFECT } from "./StimulationEffectSelection";


const StimulatedContact = ({ selected, stimulations, onChange, forcedVariant, forcedEffect, ...props }: StimulatedContactProps) => {
    const theme = useMantineTheme();

    const getContactBorderStyle = (): React.CSSProperties => {
        const EFFECT_BORDER_STYLE = getEffectBorderStyle(theme);
        const NO_EFFECT_BORDER_STYLE = {};
        if (forcedEffect !== undefined) {
            return forcedEffect ? EFFECT_BORDER_STYLE : NO_EFFECT_BORDER_STYLE
        }
        const hasEffect = stimulations.some((stim) => JSON.stringify(stim.effect.observed_effect) !== JSON.stringify(NO_EFFECT));
        return hasEffect ? EFFECT_BORDER_STYLE : NO_EFFECT_BORDER_STYLE;
    }

    const nbStims = stimulations.length;
    const color = getStimulatedStyledContactColor(stimulations, selected, theme, false, forcedVariant);
    const labelStyle = getContactBorderStyle();

    return (
        <Chip
            checked={selected || nbStims > 0 || forcedVariant !== undefined}
            variant={selected || nbStims > 0 || forcedVariant !== undefined ? 'filled' : 'light'}
            onChange={onChange as any} // Typing hack for Chip onChange differences
            color={color}
            styles={{ label: labelStyle }}
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
    forcedVariant?: ForcedVariantOptions;
    forcedEffect?: boolean | undefined;
}

type ForcedVariantOptions = 'default' | 'selected' | 'crisis' | 'postDischarge' | 'singleStim' | 'multipleStim' | undefined;

export default StimulatedContact;

const getEffectBorderStyle = (theme: MantineTheme) => {
    return { borderColor: theme.colors.red[9], borderWidth: 3, borderStyle: 'solid', borderRadius: 'xl' };
}

export const getStimulatedStyledContactBorderStyle = (stimulations: Stimulation[], theme: MantineTheme) => {
    const hasEffect = stimulations.some((stim) => JSON.stringify(stim.effect.observed_effect) !== JSON.stringify(NO_EFFECT));
    return hasEffect ? getEffectBorderStyle(theme) : {};
}

export const getStimulatedStyledContactColor = (stimulations: Stimulation[], selected: boolean, theme: MantineTheme, useThemeColor: boolean, forcedVariant?: ForcedVariantOptions): string => {
    const COLORS = {
        DEFAULT: { color: 'gray', themeHex: theme.colors.gray[5] },
        SELECTED: { color: 'blue', themeHex: theme.colors.blue[7] },
        CRISIS: {
            color: 'red.6', themeHex: theme.colors.red[6]
        },
        POST_DISCHARGE: { color: 'orange', themeHex: theme.colors.orange[6] },
        SINGLE_STIM: { color: 'green.4', themeHex: theme.colors.green[4] },
        MULTI_STIM: { color: 'green.9', themeHex: theme.colors.green[9] },
    };

    if (forcedVariant !== undefined) {
        switch (forcedVariant) {
            case 'default':
                return useThemeColor ? COLORS.DEFAULT.themeHex : COLORS.DEFAULT.color;
            case 'selected':
                return useThemeColor ? COLORS.SELECTED.themeHex : COLORS.SELECTED.color;
            case 'crisis':
                return useThemeColor ? COLORS.CRISIS.themeHex : COLORS.CRISIS.color;
            case 'postDischarge':
                return useThemeColor ? COLORS.POST_DISCHARGE.themeHex : COLORS.POST_DISCHARGE.color;
            case 'singleStim':
                return useThemeColor ? COLORS.SINGLE_STIM.themeHex : COLORS.SINGLE_STIM.color;
            case 'multipleStim':
                return useThemeColor ? COLORS.MULTI_STIM.themeHex : COLORS.MULTI_STIM.color;
        }
    }
    if (selected) {
        return useThemeColor ? COLORS.SELECTED.themeHex : COLORS.SELECTED.color;
    }
    const nbStims = stimulations.length;
    const eegCrisis = stimulations.some((stim) => stim.effect.crisis);
    const postDischarge = stimulations.some((stim) => stim.effect.post_discharge);
    if (eegCrisis) {
        return useThemeColor ? COLORS.CRISIS.themeHex : COLORS.CRISIS.color;
    }
    if (postDischarge) {
        return useThemeColor ? COLORS.POST_DISCHARGE.themeHex : COLORS.POST_DISCHARGE.color;
    }
    if (nbStims === 1) {
        return useThemeColor ? COLORS.SINGLE_STIM.themeHex : COLORS.SINGLE_STIM.color;
    }
    if (nbStims > 1) {
        return useThemeColor ? COLORS.MULTI_STIM.themeHex : COLORS.MULTI_STIM.color;
    }
    return useThemeColor ? COLORS.DEFAULT.themeHex : COLORS.DEFAULT.color;
};