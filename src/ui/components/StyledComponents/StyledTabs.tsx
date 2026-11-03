import { createStyles } from "@mantine/core";

export const useCustomTabStyle = createStyles((theme) => ({
    tab: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.white,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
        fontSize: theme.fontSizes.md,
        padding: `${theme.spacing.xs}`,

        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },

        '&[data-active]': {
            backgroundColor: theme.colors.blue[7],
            borderColor: theme.colors.blue[7],
            color: theme.white,
        },
    }
})
);