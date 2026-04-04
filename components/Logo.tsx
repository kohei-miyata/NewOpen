interface Props {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#f97316" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="20"
        fill="white"
        letterSpacing="-1"
      >
        N
      </text>
    </svg>
  );
}
