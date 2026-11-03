import { MantineColor } from "@mantine/core";
import { SVGProps, useState } from "react";

export default function SvgSelectableComponent({ paths, onSelectCallback, onMouseOverCallback, highlightOnMouseOver = true, highlightColor = "red", svgWidth = 200, svgHeight = 200, svgViewBox }: SvgSelectableComponentProps) {
    const [highlightedPath, setHighlightedPath] = useState<string | null>(null);

    const handleMouseOver = (event: React.MouseEvent<SVGElement>) => {
        const element = event.currentTarget as SVGElement;
        setHighlightedPath(element.id);
        onMouseOverCallback(element.id);
    };

    const handleMouseOut = () => {
        setHighlightedPath(null);
    };

    const handleClick = () => {
        onSelectCallback(highlightedPath!);
    };

    const svgProps: React.SVGProps<SVGSVGElement> = {
        width: svgWidth,
        height: svgHeight,
        viewBox: svgViewBox
    };

    return (
        <svg
            fill="current"
            {...svgProps}
        >
            {paths.map((path) => {
                const pathProps: SvgPathProps = {
                    key: path.id,
                    d: path.d,
                    id: path.id,
                    fill: highlightedPath == path.id && highlightOnMouseOver ? highlightColor : "current",
                    onMouseOver: handleMouseOver,
                    onMouseOut: handleMouseOut,
                    onClick: handleClick,
                    title: path.title,
                    desc: path.desc
                };
                return <path {...pathProps} />
            })}
        </svg>
    )
}

interface SvgSelectableComponentProps {
    paths: SvgPathProps[];
    onSelectCallback: (id: string) => void;
    onMouseOverCallback: (id: string) => void;
    highlightOnMouseOver?: boolean;
    highlightColor?: MantineColor;
    svgWidth?: number;
    svgHeight?: number;
    svgViewBox?: string;
}

export interface SvgPathProps extends SVGProps<SVGPathElement> {
    d: string;
    id: string;
    title?: string;
    desc?: string;
}