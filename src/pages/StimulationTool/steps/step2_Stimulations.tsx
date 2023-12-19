import { Button } from "@mantine/core";
import StepProperties from "./step";

export default function StimulationsStep({form, onComplete}:StepProperties) {
    return (<>
        <Button onClick={onComplete}>Next</Button>
    </>)
}