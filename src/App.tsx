import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import BasePage from './entry/BasePage';
import DefaultPage from './pages/default/Default';

export default function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    console.log("App rendered");
    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications position="top-right" />
                <BasePage title='Cortical Stimulation Tool'>
                    <Routes>
                        <Route path='*' element={<DefaultPage />} /> {/* This is the default Route */}
                    </Routes>
                </BasePage>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}
