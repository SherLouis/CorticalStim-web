import { ActionIcon, AppShell, Avatar, Group, Header, Menu, Title, useMantineColorScheme } from '@mantine/core';
import { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

// TODO: menu for language switch
export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const { i18n } = useTranslation();

    return (
        <AppShell
            padding="md"
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
            })}
            header={
                <Header height={60} p={"md"}>
                    <Group position="apart">
                        <Title>{props.title}</Title>

                        <Group position="right">
                            <Menu withArrow position="bottom">
                                <Menu.Target>
                                    <Avatar src={i18n.resolvedLanguage === 'fr' ? '/CorticalStim-web/assets/images/flag_fr.svg' : '/CorticalStim-web/assets/images/flag_uk.svg'} />
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item disabled={i18n.resolvedLanguage === 'en'}>
                                        <ActionIcon
                                            variant={i18n.resolvedLanguage === 'en' ? "outline" : "default"}
                                            onClick={() => i18n.changeLanguage('en')}
                                        >
                                            <Avatar src={'/CorticalStim-web/assets/images/flag_uk.svg'} />
                                        </ActionIcon>
                                    </Menu.Item>
                                    <Menu.Item disabled={i18n.resolvedLanguage === 'fr'}>
                                        <ActionIcon
                                            variant={i18n.resolvedLanguage === 'fr' ? "outline" : "default"}
                                            onClick={() => i18n.changeLanguage('fr')}
                                        >
                                            <Avatar src={'/CorticalStim-web/assets/images/flag_fr.svg'} />
                                        </ActionIcon>
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
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
