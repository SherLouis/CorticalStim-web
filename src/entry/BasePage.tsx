import { ActionIcon, AppShell, Avatar, Burger, Button, Container, Divider, Group, Header, MediaQuery, Menu, Navbar, Stack, Switch, Text, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { PropsWithChildren, useState } from 'react'
import { IconSun, IconMoonStars, IconSettings, IconLogout, IconLogin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from '../context/AuthContext';
import { TFunction } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../pages/Routes';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [navOpened, setNavOpened] = useState(false);

    return (
        <AppShell
            h={"100vh"}
            padding={0}
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2], minHeight: "96vh", height: "96vh" },
            })}
            navbarOffsetBreakpoint="sm"
            navbar={
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Navbar p="md" w={250} hiddenBreakpoint="sm" hidden={!navOpened} position={{ right: 0 }}>
                        <Stack>
                            {/** Theme Toggle */}
                            <ThemeToggleSwitch t={t} />
                            <Divider orientation='horizontal' size={'sm'} color={'gray'} />
                            {/** Language switch */}
                            <LanguageSelectionGroup t={t} />
                            <Divider orientation='horizontal' size={'sm'} color={'gray'} />
                            {/** Profile and settings */}
                            <ProfileNavSection t={t} />
                        </Stack>
                    </Navbar>
                </MediaQuery>
            }
            header={
                <Header height={'4vh'} p={"xs"}>
                    <Group position="apart" align='center' h={"100%"} noWrap>
                        <Title size={'lg'}
                            onClick={() => navigate(AppPath.APP_ROOT)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}>
                            {props.title}
                        </Title>

                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                            <Burger
                                opened={navOpened}
                                onClick={() => setNavOpened((o) => !o)}
                                size="sm"
                                color={theme.colors.gray[6]}
                                mr="xl"
                            />
                        </MediaQuery>

                        <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                            <Group position="right" h={"70%"} p={0} noWrap spacing={"sm"}>
                                <ProfileMenu t={t} />
                                <LanguageSelectionMenu />
                                <ThemeToggleIcon t={t} />
                            </Group>
                        </MediaQuery>
                    </Group>
                </Header>
            }
        >
            {props.children}
        </AppShell>
    );

}

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

const LanguageSelectionMenu = () => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;
    const languages = ['en', 'fr'];

    return (
        <Menu withArrow position="bottom">
            <Menu.Target>
                { }
                <ActionIcon>
                    <Avatar src={getSvgPathForLanguage(currentLanguage)} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {languages.map(lang =>
                    <Menu.Item disabled={currentLanguage === lang}>
                        <ActionIcon
                            variant={currentLanguage === lang ? "outline" : "default"}
                            onClick={() => i18n.changeLanguage(lang)}
                        >
                            <Avatar src={getSvgPathForLanguage(lang)} />
                        </ActionIcon>
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

const LanguageSelectionGroup = ({ t }: { t: TFunction }) => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;
    const languages = ['en', 'fr'];
    return (
        <Container>
            <Text>{t('app.header.change_language')}</Text>
            <Group position="center">
                {languages.map((lang) =>
                    <ActionIcon
                        variant={currentLanguage === lang ? "outline" : "default"}
                        onClick={() => i18n.changeLanguage(lang)}
                        disabled={currentLanguage === lang}
                        key={'lang_' + lang}
                    >
                        <Avatar src={getSvgPathForLanguage(lang)} />
                    </ActionIcon>
                )}
            </Group>
        </Container>
    );
}

const ThemeToggleIcon = ({ t }: { t: TFunction }) => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <ActionIcon
            variant="outline"
            color={isDarkTheme ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title={t('app.header.toggle_theme')}
        >
            {isDarkTheme ? <IconSun /> : <IconMoonStars />}
        </ActionIcon>
    );
}

const ThemeToggleSwitch = ({ t }: { t: TFunction }) => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { colors } = useMantineTheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <Switch
            variant="outline"
            color={isDarkTheme ? 'gray' : 'dark'}
            onClick={() => toggleColorScheme()}
            label={t('app.header.toggle_theme')}
            labelPosition="left"
            offLabel={<IconSun size="1rem" stroke={2.5} color={colors.yellow[4]} />}
            onLabel={<IconMoonStars size="1rem" stroke={2.5} color={colors.blue[6]} />}
        />
    );
}

const ProfileMenu = ({ t }: { t: TFunction }) => {
    const authState = useAuthState();
    const navigate = useNavigate();

    const initials = authState.user ? authState.user?.displayName.split(' ').map(word => word.charAt(0).toUpperCase()).join('') : 'U';

    const handleSignOut = () => {
        authState.authProvider.signOut().then(() => {
            console.log('User signed out');
        })
    }

    return (
        <Menu shadow="md">
            <Menu.Target>
                <Avatar color='indigo' variant='filled' radius="md" style={{ cursor: 'pointer' }} size={"md"}>{initials}</Avatar>
            </Menu.Target>

            <Menu.Dropdown>
                {authState.isAuthenticated && <Menu.Item icon={<IconSettings size={14} />} onClick={() => navigate(AppPath.ACCOUNT)}>{t('app.header.menu.profile')}</Menu.Item>}
                {authState.isAuthenticated && <Menu.Item icon={<IconLogout size={14} />} onClick={handleSignOut}>{t('app.header.menu.logout')}</Menu.Item>}
                {!authState.isAuthenticated && <Menu.Item icon={<IconLogin size={14} />} onClick={() => navigate(AppPath.LOGIN)}>{t('app.header.menu.login')}</Menu.Item>}
            </Menu.Dropdown>
        </Menu>
    );
}

const ProfileNavSection = ({ t }: { t: TFunction }) => {
    const authState = useAuthState();
    const navigate = useNavigate();

    const initials = authState.user ? authState.user?.displayName.split(' ').map(word => word.charAt(0).toUpperCase()).join('') : 'U';

    const handleSignOut = () => {
        authState.authProvider.signOut().then(() => {
            console.log('User signed out');
        })
    }

    return (
        <Stack>
            {!authState.isAuthenticated && <Button variant='subtle' leftIcon={<IconLogin size={14} />} onClick={() => navigate(AppPath.LOGIN)}>{t('app.header.menu.login')}</Button>}

            {authState.isAuthenticated &&
                <>
                    <Group>
                        <Avatar color='indigo' variant='filled' radius="md" style={{ cursor: 'pointer' }} size={"md"}>{initials}</Avatar>
                        <Title order={4}>{authState.user?.displayName}</Title>
                    </Group>
                    <Button variant='subtle' leftIcon={<IconSettings size={14} />} onClick={() => navigate(AppPath.ACCOUNT)}>{t('app.header.menu.profile')}</Button>
                    <Button variant='subtle' leftIcon={<IconLogout size={14} />} onClick={handleSignOut}>{t('app.header.menu.logout')}</Button>
                </>
            }
        </Stack>
    );
}

interface BasePageProps {
    title: string;
}
