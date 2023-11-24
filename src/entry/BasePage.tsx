import { ActionIcon, AppShell, Group, Header, Title, useMantineColorScheme } from '@mantine/core';
import React, { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';
    return (
        <AppShell
            padding="md"
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
            })}
            header={
                <Header height={60}>
                    <Group position="apart">
                        <Title>{props.title}</Title>

                        <Group position="right">
                            <ActionIcon
                                variant="outline"
                                color={dark ? 'yellow' : 'blue'}
                                onClick={() => toggleColorScheme()}
                                title="Toggle color scheme"
                            >
                                {dark ? <IconSun size="1rem" /> : <IconMoonStars size="1rem" />}
                            </ActionIcon>
                        </Group>
                    </Group>
                </Header>
            }
        >
            {props.children}
        </AppShell>
    );
}

interface BasePageProps {
    title: string;
}
