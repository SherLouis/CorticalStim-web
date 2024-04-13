import { ActionIcon, AppShell, Avatar, Group, Header, Menu, Title, useMantineColorScheme } from '@mantine/core';
import { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme } = useMantineColorScheme();

    return (
        <AppShell
            h={"100vh"}
            padding="1vh"
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2] },
            })}
            header={
                <Header height={"5%"} p={"md"}>
                    <Group position="apart">
                        <Title order={1}>{props.title}</Title>
                        <Group position="right">
                            <LanguageSelectionMenu />
                            <ThemeToggleIcon />
                        </Group>
                    </Group>
                </Header>
            }
        >
            {props.children}
        </AppShell>
    );

}

const LanguageSelectionMenu = () => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;

    const getSvgPathForLanguage = (language?: string) => {
        switch (language) {
            case 'fr':
                return '/CorticalStim-web/assets/images/flag_fr.svg';

            case 'en':
                return '/CorticalStim-web/assets/images/flag_uk.svg';
            default:
                return '/CorticalStim-web/assets/images/flag_uk.svg';
        }
    }

    return (
        <Menu withArrow position="bottom">
            <Menu.Target>
                { }
                <ActionIcon>
                    <Avatar src={getSvgPathForLanguage(currentLanguage)} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item disabled={currentLanguage === 'en'}>
                    <ActionIcon
                        variant={currentLanguage === 'en' ? "outline" : "default"}
                        onClick={() => i18n.changeLanguage('en')}
                    >
                        <Avatar src={getSvgPathForLanguage('en')} />
                    </ActionIcon>
                </Menu.Item>
                <Menu.Item disabled={currentLanguage === 'fr'}>
                    <ActionIcon
                        variant={currentLanguage === 'fr' ? "outline" : "default"}
                        onClick={() => i18n.changeLanguage('fr')}
                    >
                        <Avatar src={getSvgPathForLanguage('fr')} />
                    </ActionIcon>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

const ThemeToggleIcon = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <ActionIcon
            variant="outline"
            color={isDarkTheme ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
        >
            {isDarkTheme ? <IconSun size="1rem" /> : <IconMoonStars size="1rem" />}
        </ActionIcon>
    );
}

interface BasePageProps {
    title: string;
}
