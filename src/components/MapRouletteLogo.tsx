import logoUrl from "../assets/logo.png";

export const MapRouletteLogo = ({
  size,
}: {
  size: "small" | "medium" | "large";
}) => {
  return (
    <div className="flex items-center flex-none">
      <img src={logoUrl} alt="MapRoulette" className={`h-${size} w-auto`} />
    </div>
  );
};
