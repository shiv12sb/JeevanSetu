import { MAHARASHTRA_VERIFIED_HOSPITALS } from "@/lib/maharashtraDoctorHospitalData";
import HospitalDetailPage from "@/components/HospitalDetailClient";

export function generateStaticParams() {
  return MAHARASHTRA_VERIFIED_HOSPITALS.map((hosp) => ({
    id: hosp.id.toString(),
  }));
}

export default async function Page() {
  return <HospitalDetailPage />;
}
