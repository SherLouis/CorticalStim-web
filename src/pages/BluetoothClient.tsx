// BluetoothClient.tsx
import React, { useState } from 'react';

const SERVICE_UUID = '0000ffee-0000-1000-8000-00805f9b34fb'; // à adapter
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb'; // à adapter

export default function BluetoothClient() {
    const [deviceName, setDeviceName] = useState('');
    const [status, setStatus] = useState('');
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);

    const connect = async () => {
        try {
            setStatus('Recherche...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }],
            });
            setDeviceName(device.name || 'Inconnu');
            setStatus('Connexion...');

            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService(SERVICE_UUID);
            const char = await service?.getCharacteristic(CHARACTERISTIC_UUID);
            setCharacteristic(char || null);
            setStatus('Connecté !');
            if (char?.properties.notify) {
                await startNotifications(char);
            }
            else {
                console.warn("Notify not in properties");
            }
        } catch (error) {
            console.error(error);
            setStatus('Erreur de connexion');
        }
    };

    const sendCommand = async (command: string) => {
        if (!characteristic) {
            setStatus('Pas connecté');
            return;
        }
        const encoder = new TextEncoder();
        await characteristic.writeValue(encoder.encode(command));
        setStatus(`Commande envoyée : ${command}`);
    };

    const startNotifications = async (char: BluetoothRemoteGATTCharacteristic) => {
        try {
            await char.startNotifications();
            char.addEventListener('characteristicvaluechanged', (event: Event) => {
                const target = event.target as BluetoothRemoteGATTCharacteristic;
                const value = target.value;
                const decoder = new TextDecoder();
                const message = decoder.decode(value);
                console.log('Notification reçue :', message);
                setStatus(`Message reçu : ${message}`);
            });
            console.log('Notifications activées');
        } catch (err) {
            console.error('Erreur de notifications', err);
            setStatus('Erreur de notifications');
        }
    };


    return (
        <div className="p-4 space-y-4">
            <h1>Web Bluetooth Client</h1>
            <p>Appareil : {deviceName || 'Aucun'}</p>
            <p>Status : {status}</p>
            <button onClick={connect}>Connecter</button>
            <button onClick={() => sendCommand('NEXT_IMAGE')}>
                Envoyer "NEXT_IMAGE"
            </button>
        </div>
    );
}
