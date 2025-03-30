import { Box, BoxProps, Stack, StackProps, useMantineTheme } from "@mantine/core";
import { ReactNode } from "react"

const Section = ({ header, children, bodyOpts, ...props }: SectionProps) => {
    const theme = useMantineTheme();
    const headerBgColor = theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[6];
    const bodyBgColor = theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[4];
    return (
        <Stack {...props} h={"100%"} w={"100%"} spacing={0}>
            <Box w={"100%"} px={theme.spacing.md} h={"15%"}
                sx={{
                    backgroundColor: headerBgColor,
                    borderTopLeftRadius: theme.radius.lg,
                    borderTopRightRadius: theme.radius.lg,
                    alignContent: "center"
                }}>
                {header}
            </Box>
            <Box w={"100%"} h={"85%"}
                p={theme.spacing.sm}
                sx={{
                    backgroundColor: bodyBgColor,
                    borderBottomLeftRadius: theme.radius.lg,
                    borderBottomRightRadius: theme.radius.lg,
                }}
                {...bodyOpts}
            >
                {children}
            </Box>
        </Stack>
    )
}

interface SectionProps extends StackProps {
    header: ReactNode;
    children: ReactNode;
    bodyOpts?: BoxProps;
}

export default Section;