declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import { Component } from 'react';

  interface PlotParams {
    data?: any[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Plotly.Frame[];
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    revision?: number;
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
    onPurge?: (figure: any, graphDiv: any) => void;
    onError?: (err: Error) => void;
    onAfterPlot?: () => void;
    onRedraw?: () => void;
    onSelected?: (event: any) => void;
    onSelecting?: (event: any) => void;
    onRestyle?: (data: any) => void;
    onRelayout?: (layout: any) => void;
    onClickAnnotation?: (event: any) => void;
    onDeselect?: () => void;
    onClick?: (event: any) => void;
    onDoubleClick?: (event: any) => void;
    onHover?: (event: any) => void;
    onUnhover?: (event: any) => void;
    className?: string;
    divId?: string;
  }

  export default class Plot extends Component<PlotParams> {}
} 