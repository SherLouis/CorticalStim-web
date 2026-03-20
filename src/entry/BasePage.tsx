import { PropsWithChildren, useEffect, useState } from 'react'
import { ActionIcon, Avatar, Menu } from '@mantine/core';
import { IconSun, IconMoonStars, IconSettings, IconLogout, IconLogin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../pages/Routes';
import { useMantineColorScheme } from '@mantine/core';
import { TFunction } from 'i18next';

export default function BasePage(props: PropsWithChildren<BasePageProps>) {
    const { colorScheme } = useMantineColorScheme();

    // Sync Tailwind's dark mode with Mantine's color scheme
    useEffect(() => {
        if (colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [colorScheme]);

    return (
        <div className="bg-surface dark:bg-slate-900 font-body text-on-surface dark:text-gray-100 antialiased overflow-hidden flex flex-col h-screen w-full">
            <TopHeader title={props.title} />
            <div className="flex-1 flex overflow-hidden relative">
                {props.children}
            </div>
        </div>
    );
}

function TopHeader({ title }: { title: string }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <header className="flex-none z-50 w-full bg-slate-50 dark:bg-slate-950 flex justify-between items-center px-6 py-3 border-b border-surface-container-high dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-8">
                <span 
                    className="text-xl font-bold text-blue-800 dark:text-blue-300 font-headline cursor-pointer" 
                    onClick={() => navigate(AppPath.APP_ROOT)}
                >
                    {title}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <LanguageSelectionMenu />
                <ThemeToggleIcon t={t} />
                <ProfileMenu t={t} />
            </div>
        </header>
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
                <ActionIcon variant="subtle" className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors rounded-full active:scale-95 duration-150 ease-in-out">
                    <Avatar size="sm" src={getSvgPathForLanguage(currentLanguage)} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {languages.map(lang =>
                    <Menu.Item disabled={currentLanguage === lang} key={lang} onClick={() => i18n.changeLanguage(lang)}>
                        <div className="flex items-center gap-2">
                            <Avatar size="sm" src={getSvgPathForLanguage(lang)} />
                            <span className="uppercase text-xs font-bold">{lang}</span>
                        </div>
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

const ThemeToggleIcon = ({ t }: { t: TFunction }) => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <button
            className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors rounded-full flex items-center justify-center active:scale-95 duration-150 ease-in-out text-slate-600 dark:text-slate-300"
            onClick={() => toggleColorScheme()}
            title={t('app.header.toggle_theme')}
        >
            {isDarkTheme ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
        </button>
    );
}

const ProfileMenu = ({ t }: { t: TFunction }) => {
    const authState = useAuthState();
    const navigate = useNavigate();

    const initials = authState.user ? (authState.user?.displayName || 'U').split(' ').map(word => word.charAt(0).toUpperCase()).join('') : 'U';

    const handleSignOut = () => {
        authState.authProvider.signOut().then(() => {
            console.log('User signed out');
        })
    }

    return (
        <Menu shadow="md" position="bottom-end">
            <Menu.Target>
                <div className="h-8 w-8 rounded-full overflow-hidden bg-primary text-white border border-outline-variant/20 flex items-center justify-center font-bold text-sm cursor-pointer ml-2 hover:opacity-90 active:scale-95 transition-all">
                    {initials}
                </div>
            </Menu.Target>

            <Menu.Dropdown>
                {authState.isAuthenticated && <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate(AppPath.ACCOUNT)}>{t('app.header.menu.profile')}</Menu.Item>}
                {authState.isAuthenticated && <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleSignOut}>{t('app.header.menu.logout')}</Menu.Item>}
                {!authState.isAuthenticated && <Menu.Item leftSection={<IconLogin size={14} />} onClick={() => navigate(AppPath.LOGIN)}>{t('app.header.menu.login')}</Menu.Item>}
            </Menu.Dropdown>
        </Menu>
    );
}

interface BasePageProps {
    title: string;
}
