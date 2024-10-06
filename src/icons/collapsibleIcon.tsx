import { type SVGProps } from "react";

interface CollapsibleProps extends SVGProps<SVGSVGElement> {
  collapsed?: boolean;
}

export default function CollapsibleIcon({
  collapsed = false,
  ...props
}: CollapsibleProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${
        collapsed ? "rotate-180" : ""
      }`}
      {...props}
    >
      <polyline points={collapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
    </svg>
  );
}
