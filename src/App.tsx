import React from "react";
import { MantineProvider, useComputedColorScheme } from '@mantine/core';
import { Notifications } from "@mantine/notifications";
import { Routes, Route } from "react-router-dom";
import BasePage from "./entry/BasePage";
import DefaultPage from "./pages/default/Default";

export default function App() {
    const computedColorScheme = useComputedColorScheme('dark');
    console.log("rendered");
    return (
        <MantineProvider defaultColorScheme={computedColorScheme}>
            <Notifications position="top-right" />
            <BasePage title='CSM data'>
                <Routes>
                    <Route path='*' element={<DefaultPage />} /> {/* This is the default Route */}
                </Routes>
            </BasePage>
        </MantineProvider>
    );
}
