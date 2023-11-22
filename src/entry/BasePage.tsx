import { ActionIcon, AppShell, Group, Title, useMantineColorScheme } from '@mantine/core';
import React, { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';
    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
            })}
        >
            <AppShell.Header>
                <Group justify={'space-between'}>
                    <Title>{props.title}</Title>

                    <Group justify='flex-end'>
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
            </AppShell.Header>

            <AppShell.Main>
                {props.children}
            </AppShell.Main>
        </AppShell>
    );
}

interface BasePageProps {
    title: string;
}
