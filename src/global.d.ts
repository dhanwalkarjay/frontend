// This file is used to declare global types, including custom HTML elements for JSX.

declare namespace JSX {
  interface IntrinsicElements {
    "spline-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        url?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
