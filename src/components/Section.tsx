import { Box, BoxProps, Stack, StackProps, useMantineTheme } from "@mantine/core";
import { ReactNode } from "react"

const Section = ({ header, children, bodyOpts, ...props }: SectionProps) => {
    const theme = useMantineTheme();
    const headerBgColor = theme.colors.gray[6];
    const bodyBgColor = theme.colors.gray[4];
    return (
        <Stack {...props} h={"100%"} w={"100%"} gap={0}>
            <Box w={"100%"} px="md" h={"15%"}
                style={{
                    backgroundColor: headerBgColor,
                    borderTopLeftRadius: 'var(--mantine-radius-lg)',
                    borderTopRightRadius: 'var(--mantine-radius-lg)',
                    alignContent: "center"
                }}>
                {header}
            </Box>
            <Box w={"100%"} h={"85%"}
                p="sm"
                style={{
                    backgroundColor: bodyBgColor,
                    borderBottomLeftRadius: 'var(--mantine-radius-lg)',
                    borderBottomRightRadius: 'var(--mantine-radius-lg)',
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