import { ActionIcon, AppShell, Avatar, Container, Group, Menu, Title, useMantineColorScheme } from '@mantine/core';
import { PropsWithChildren } from 'react'
import { IconSun, IconMoonStars, IconSettings, IconLogout, IconLogin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from '../context/AuthContext';
import { TFunction } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../pages/Routes';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme } = useMantineColorScheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <AppShell
            h={"100vh"}
            padding={0}
            styles={(theme) => ({
                main: { backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2], minHeight: "96vh", height: "96vh" },
            })}
            header={
                <Container h={"4vh"} fluid px={"sm"}>
                    <Group position="apart" align='center' h={"100%"} noWrap>
                        <Title size={'2vh'}
                            onClick={() => navigate(AppPath.APP_ROOT)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}>
                            {props.title}
                        </Title>

                        <Group position="right" h={"70%"} p={0} noWrap spacing={"xs"}>
                            <ProfileMenu t={t} />
                            <LanguageSelectionMenu />
                            <ThemeToggleIcon t={t} />
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
                <Avatar color='indigo' variant='filled' radius="xl" style={{ cursor: 'pointer' }}>{initials}</Avatar>
            </Menu.Target>

            <Menu.Dropdown>
                {authState.isAuthenticated && <Menu.Item icon={<IconSettings size={14} />} onClick={() => navigate(AppPath.ACCOUNT)}>{t('app.header.menu.profile')}</Menu.Item>}
                {authState.isAuthenticated && <Menu.Item icon={<IconLogout size={14} />} onClick={handleSignOut}>{t('app.header.menu.logout')}</Menu.Item>}
                {!authState.isAuthenticated && <Menu.Item icon={<IconLogin size={14} />} onClick={() => navigate(AppPath.LOGIN)}>{t('app.header.menu.login')}</Menu.Item>}
            </Menu.Dropdown>
        </Menu>
    );
}

interface BasePageProps {
    title: string;
}
