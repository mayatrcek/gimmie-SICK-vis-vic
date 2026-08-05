import SstGallery from "@/components/SstGallery";

export const metadata = {
  title: "Sea temperature — GIMMIE SICK VIS",
  description:
    "Live sea-surface temperature for Victorian waters from NOAA ACSPO satellite passes, with the sharp thermal fronts picked out.",
};

export default function Sst() {
  return <SstGallery />;
}
