import naturalCompare from 'natural-compare'
import { ElectrodeFormValues, SideOptions } from "../../core/models/stimulationForm";

const parseMniImplantationFromTsv = (tsvData: string): ElectrodeFormValues[] => {
    const getSideFromMni = (x: number, y: number, z: number): SideOptions => {
        return x > 0 ? 'right' : 'left';
    };

    const getElectrodeLabelFromContactLabel = (contactLabel: string) => {
        return contactLabel.slice(0, -1).replace(/_$/, '');
    }

    const getMNIPositionBetweenTwoContacts = (first: { x: number, y: number, z: number }, second: { x: number, y: number, z: number }) => {
        return {
            x: Number(((first.x + second.x) / 2).toFixed(2)),
            y: Number(((first.y + second.y) / 2).toFixed(2)),
            z: Number(((first.z + second.z) / 2).toFixed(2))
        };
    }

    const contactsData = tsvData.split('\n')
        .map(row => row.trim().split('\t'))
        .filter(rowData => {
            if (rowData.length !== 4) {
                console.warn(`tsv2impl : Skipping row. Expecting 4 columns, got ${rowData.length}. Data: ${rowData}`);
                return false;
            };
            return true;
        })
        .map(rowData => {
            return {
                contactLabel: rowData[0],
                mniX: parseFloat(rowData[1]),
                mniY: parseFloat(rowData[2]),
                mniZ: parseFloat(rowData[3])
            } as TsvRowData;
        })
        .sort((a, b) => naturalCompare(a.contactLabel, b.contactLabel));

    if (contactsData.length === 0) {
        return [];
    }

    let results = [] as ElectrodeFormValues[];

    // sorted data based on contact label. Assuming first contact of every electrode ends with 1 (contact number)
    let currentElectrode = {
        label: getElectrodeLabelFromContactLabel(contactsData[0].contactLabel),
        side: undefined,
        n_contacts: 0,
        confirmed: false,
        stim_points: []
    } as ElectrodeFormValues;

    let previousContactPosition = { x: 0, y: 0, z: 0 };


    for (const contactData of contactsData) {
        if (contactData.contactLabel.startsWith(currentElectrode.label)) {
            // Still same electrode
            if (currentElectrode.n_contacts === 0) {
                // Compute side based on position of first contact of electrode
                currentElectrode.side = getSideFromMni(contactData.mniX, contactData.mniY, contactData.mniZ);
            }
            else {
                const stim_point_mni = getMNIPositionBetweenTwoContacts(previousContactPosition, { x: contactData.mniX, y: contactData.mniY, z: contactData.mniZ });
                currentElectrode.stim_points.push({
                    index: currentElectrode.n_contacts - 1,
                    location: {
                        type: 'mni',
                        vep: "",
                        destrieux: "",
                        white_matter: "",
                        mni: stim_point_mni,
                        done: true
                    },
                    stimulations: []
                });
            }
            previousContactPosition = { x: contactData.mniX, y: contactData.mniY, z: contactData.mniZ };
            currentElectrode.n_contacts += 1;
        }
        else {
            // Moved to new electrode
            results.push(currentElectrode);

            currentElectrode = {
                label: getElectrodeLabelFromContactLabel(contactData.contactLabel),
                side: getSideFromMni(contactData.mniX, contactData.mniY, contactData.mniZ),
                n_contacts: 1,
                confirmed: false,
                stim_points: []
            };

            previousContactPosition = { x: contactData.mniX, y: contactData.mniY, z: contactData.mniZ };
        }
    }
    // Add last electrode to results
    results.push(currentElectrode)

    return results as ElectrodeFormValues[];
}

type TsvRowData = {
    contactLabel: string;
    mniX: number;
    mniY: number;
    mniZ: number;
}

export default parseMniImplantationFromTsv;