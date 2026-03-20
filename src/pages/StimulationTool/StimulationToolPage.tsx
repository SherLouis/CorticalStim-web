import { Text, Group, Alert, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ElectrodeSetupStep from "./tabs/t1_ImplantationSetup";
import StimulationsTab from "./tabs/t2_Stimulations";
import SummaryTab, { SummaryFilters } from "./tabs/t3_Summary";
import { IconFolderOpen, IconDownload, IconAlertCircle, IconCheck, IconX, IconChevronLeft, IconChevronRight, IconMicroscope, IconBolt, IconChartBar, IconHelp, IconArchive, IconUser } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useStimulationRepository } from "../../infra/ZustandStimulationRepository";
import { Session } from "../../core/domain/Session";

export default function StimulationToolPage() {
    const { t } = useTranslation();
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    const repository = useStimulationRepository();
    const session = repository.getSession();

    const [form_previous_values, set_form_previous_values] = useState<string>(JSON.stringify(new Session()));
    
    const [activeTab, setActiveTab] = useState<string | null>('implantation');
    const [summaryFilters, setSummaryFilters] = useState<SummaryFilters>({});
    const [hasUnsavedData, setHasUnsavedData] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const downloadFormValues = () => {
        var data = new Blob([JSON.stringify(session)], { type: 'application/json' });
        var dataURL = window.URL.createObjectURL(data);
        var tempLink = document.createElement('a');
        tempLink.href = dataURL;
        tempLink.setAttribute('download', `${session.patient_id}-${new Date().toISOString().split('T')[0]}.json`);
        tempLink.click();
        set_form_previous_values(JSON.stringify(session));
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null) {
            return;
        }

        const uploadedFile = e.target.files[0];

        const fileReader = new FileReader();
        if (uploadedFile !== undefined)
            notifications.show({
                id: 'opened_file',
                title: t('pages.stimulationTool.notifications.loading_data_from_file_title'),
                message: t('pages.stimulationTool.notifications.loading_data_from_file_message'),
                loading: true
            });
        fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = () => {
            try {
                const values = JSON.parse(fileReader.result as string);
                const loadedSession = Session.fromJSON(values);
                repository.loadSession(loadedSession);
                set_form_previous_values(JSON.stringify(loadedSession));
                notifications.update({
                    id: 'opened_file',
                    title: t('pages.stimulationTool.notifications.success_loaded_from_file_title'),
                    message: t('pages.stimulationTool.notifications.success_loaded_from_file_message'),
                    autoClose: 2000,
                    icon: <IconCheck />,
                    color: 'green',
                    loading: false
                });
            }
            catch (e) {
                notifications.update({
                    id: 'opened_file',
                    title: t('pages.stimulationTool.notifications.failed_loading_from_file_title'),
                    message: t('pages.stimulationTool.notifications.failed_loading_from_file_message'),
                    autoClose: 2000,
                    icon: <IconX />,
                    color: 'red',
                    loading: false
                });
            }
        }
    };

    const handleViewPointSummary = (pointId: string) => {
        setSummaryFilters({ pointIds: [pointId] });
        setActiveTab('summary');
    }

    useEffect(() => {
        window.onbeforeunload = confirmExit;
        function confirmExit() {
            return hasUnsavedData ? "Show confirm" : null;
        }
    }, [hasUnsavedData])

    useEffect(() => {
        const shouldDisplayUnsavedMessage = JSON.stringify(session) !== form_previous_values;
        setHasUnsavedData(shouldDisplayUnsavedMessage)
    }, [session, form_previous_values]);

    return (
        <div className="flex h-full w-full bg-surface">
            {/* Sidebar */}
            <aside className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-50 dark:bg-slate-950 flex flex-col p-4 border-r border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none z-40 shrink-0`}>
                <div className="mb-6 flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 min-w-[40px] rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                        <IconUser className="text-on-primary-container" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <TextInput
                                variant="unstyled"
                                value={session.patient_id}
                                onChange={(event) => repository.setPatientId(event.currentTarget.value)}
                                placeholder="Patient ID"
                                classNames={{ input: "font-headline font-extrabold text-blue-900 dark:text-blue-100 p-0 h-6 leading-tight text-sm bg-transparent" }}
                            />
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold truncate">Pre-op Phase</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 flex flex-col gap-1 overflow-x-hidden">
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-transform duration-200 active:scale-98 mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        {sidebarCollapsed ? <IconChevronRight size="1.2rem" /> : <IconChevronLeft size="1.2rem" />}
                        {!sidebarCollapsed && <span>Collapse Menu</span>}
                    </button>

                    <TabLink 
                        icon={<IconMicroscope size="1.2rem" />} 
                        label={t("pages.stimulationTool.implantation.tab_title")} 
                        active={activeTab === 'implantation'} 
                        collapsed={sidebarCollapsed}
                        onClick={() => setActiveTab('implantation')} 
                    />
                    <TabLink 
                        icon={<IconBolt size="1.2rem" />} 
                        label={t("pages.stimulationTool.stimulation.tab_title")} 
                        active={activeTab === 'stimulation'} 
                        collapsed={sidebarCollapsed}
                        onClick={() => setActiveTab('stimulation')} 
                    />
                    <TabLink 
                        icon={<IconChartBar size="1.2rem" />} 
                        label={t("pages.stimulationTool.summary.tab_title")} 
                        active={activeTab === 'summary'} 
                        collapsed={sidebarCollapsed}
                        onClick={() => setActiveTab('summary')} 
                    />
                </nav>

                <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
                    <TabLink 
                        icon={<IconHelp size="1.2rem" />} 
                        label="Support" 
                        collapsed={sidebarCollapsed}
                    />
                    <TabLink 
                        icon={<IconArchive size="1.2rem" />} 
                        label="Archive" 
                        collapsed={sidebarCollapsed}
                    />
                    <button 
                        onClick={downloadFormValues}
                        className={`mt-4 w-full bg-primary-container text-on-primary-container py-2.5 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center ${sidebarCollapsed ? 'px-0' : 'px-4'}`}
                        title={t('pages.stimulationTool.button_download_form')}
                    >
                        <IconDownload size="1.2rem" className="shrink-0" />
                        {!sidebarCollapsed && <span className="ml-2 truncate">Export JSON</span>}
                    </button>
                    
                    <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} accept=".json" style={{ display: 'none' }} />
                    <button 
                        onClick={() => openInputFileRef.current?.click()}
                        className={`mt-2 w-full bg-surface-variant text-on-surface-variant py-2.5 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center ${sidebarCollapsed ? 'px-0' : 'px-4'}`}
                        title={t('pages.stimulationTool.button_open_form')}
                    >
                        <IconFolderOpen size="1.2rem" className="shrink-0" />
                        {!sidebarCollapsed && <span className="ml-2 truncate">Import JSON</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface-container-low overflow-hidden relative">
                {hasUnsavedData && (
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={0} py="xs" className="shrink-0">
                        <Group p={0} m={0}>
                            <Text fw={700} >{t('pages.stimulationTool.unsaved_alert_title')}</Text>
                            <Text >{t('pages.stimulationTool.unsaved_alert_text')}</Text>
                        </Group>
                    </Alert>
                )}
                
                <div className="flex-1 overflow-auto relative">
                    {activeTab === 'implantation' && <ElectrodeSetupStep />}
                    {activeTab === 'stimulation' && <StimulationsTab viewPointSummary={handleViewPointSummary} />}
                    {activeTab === 'summary' && <SummaryTab filters={summaryFilters} />}
                </div>
            </main>
        </div>
    );
}

function TabLink({ icon, label, active, collapsed, onClick }: { icon: React.ReactNode, label: string, active?: boolean, collapsed: boolean, onClick?: () => void }) {
    const activeClass = active 
        ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm" 
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-slate-800/30";
    
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-3 py-2.5 rounded-lg font-inter text-sm font-medium transition-transform duration-200 active:scale-98 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-3 hover:translate-x-1 w-full'} ${activeClass}`}
            title={collapsed ? label : undefined}
        >
            <div className="shrink-0">{icon}</div>
            {!collapsed && <span className="truncate">{label}</span>}
        </button>
    );
}