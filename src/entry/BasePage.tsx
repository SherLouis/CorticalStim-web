import { ActionIcon, AppShell, Avatar, Container, Group, Header, Menu, Title, useMantineColorScheme } from '@mantine/core';
import { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme } = useMantineColorScheme();

    return (
        <AppShell
            h={"100vh"}
            padding={0}
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2], minHeight: "95vh", height: "95vh" },
            })}
            header={
                <Container h={"5vh"} fluid px={"sm"}>
                    <Group position="apart" align='center' h={"100%"} noWrap>
                        <Title size={'2vh'}>{props.title}</Title>

                        <Group position="right" h={"60%"} p={0} noWrap spacing={"xs"}>
                            <LanguageSelectionMenu />
                            <ThemeToggleIcon />
                        </Group>
                    </Group>
                </Container>
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
                <ActionIcon size={"80%"}>
                    <Avatar src={getSvgPathForLanguage(currentLanguage)} size={"90%"} />
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
            size={"80%"}
            variant="outline"
            color={isDarkTheme ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
        >
            {isDarkTheme ? <IconSun size="100%" /> : <IconMoonStars size="100%" />}
        </ActionIcon>
    );
}

interface BasePageProps {
    title: string;
}
