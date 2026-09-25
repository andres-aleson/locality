export function Avatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      aria-hidden
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
    >
      {initials}
    </div>
  );
}
