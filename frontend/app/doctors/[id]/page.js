import { MAHARASHTRA_VERIFIED_DOCTORS } from "@/lib/maharashtraDoctorHospitalData";
import DoctorDetailPage from "@/components/DoctorDetailClient";

export function generateStaticParams() {
  return MAHARASHTRA_VERIFIED_DOCTORS.map((doc) => ({
    id: doc.id.toString(),
  }));
}

export default async function Page() {
  return <DoctorDetailPage />;
}
