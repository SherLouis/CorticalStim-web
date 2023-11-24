import { ActionIcon, AppShell, Avatar, Group, Header, Menu, Title, useMantineColorScheme } from '@mantine/core';
import { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';

// TODO: menu for language switch
export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const { i18n } = useTranslation();

    const getCountryCodeForLanguage = (language: string | undefined): string => {
        switch (language) {
            case 'fr':
                return 'fr';
            default:
                return 'gb';
        }
    }

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
                                    <Avatar>
                                        <ReactCountryFlag countryCode={getCountryCodeForLanguage(i18n.resolvedLanguage)} className="emojiFlag" />
                                    </Avatar>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item disabled={i18n.resolvedLanguage === 'en'}>
                                        <ActionIcon
                                            variant={i18n.resolvedLanguage === 'en' ? "outline" : "default"}
                                            onClick={() => i18n.changeLanguage('en')}
                                        >
                                            <ReactCountryFlag countryCode={getCountryCodeForLanguage('en')} />
                                        </ActionIcon>
                                    </Menu.Item>
                                    <Menu.Item disabled={i18n.resolvedLanguage === 'en'}>
                                        <ActionIcon
                                            variant={i18n.resolvedLanguage === 'fr' ? "outline" : "default"}
                                            onClick={() => i18n.changeLanguage('fr')}
                                        >
                                            <ReactCountryFlag countryCode={getCountryCodeForLanguage('fr')} />
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
