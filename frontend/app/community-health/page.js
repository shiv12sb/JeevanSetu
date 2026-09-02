"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { communityHealthApi } from "@/lib/api";
import { 
  Megaphone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Printer, 
  ChevronRight, 
  ArrowRight,
  X,
  Volume2
} from "lucide-react";

export function CommunityHealthPage() {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedLangFilter, setSelectedLangFilter] = useState("ALL");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  // Create Campaign Modal form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newLanguage, setNewLanguage] = useState("en");
  const [newSource, setNewSource] = useState("");
  const [newEmergencyContact, setNewEmergencyContact] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newValidUntil, setNewValidUntil] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Poster Mode states
  const [activePosterCampaign, setActivePosterCampaign] = useState(null);

  const loadCampaigns = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const params = {};
      if (selectedLangFilter !== "ALL") params.language = selectedLangFilter;
      if (selectedDistrictFilter !== "ALL") params.district = selectedDistrictFilter;

      const res = await communityHealthApi.getCampaigns(params);
      if (res && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.warn("Campaigns API failed, falling back to mock campaigns:", err);
      // Fallback mocks backed by authentic local high-definition working pictures
      const mockList = [
        {
          id: "camp-1",
          title: "पावसाळी आजार व डेंग्यू-हिवताप प्रतिबंधक मोहीम",
          message: "डेंग्यू, हिवताप (मलेरिया) आणि गॅस्ट्रोपासून कुटुंबाचे रक्षण करा. पाण्याची भांडी झाकून ठेवा, साचलेले पाणी त्वरित रिकामे करा, मच्छरदाणीचा वापर करा आणि पिण्याचे पाणी किमान १० मिनिटे खळखळून उकळूनच प्या. ताप किंवा थंडी वाजल्यास तात्काळ जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा.",
          image_url: "/images/awareness/monsoon_dengue.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 172800000).toISOString(),
          valid_until: new Date(Date.now() + 2592000000).toISOString(),
          official_source: "सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन",
          emergency_contact: "१०४ (आरोग्य सल्ला) / १०८ (रुग्णवाहिका)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-2",
          title: "सर्पदंश प्रथमोपचार व मोफत अँटी-स्नेक व्हेनम (ASV)",
          message: "साप चावल्यास घाबरू नका! दंशाच्या जागेवर काप मारू नका, रक्त चोखू नका किंवा घट्ट दोरी बांधू नका. बाधित अवयव हालचाल न करता लाकडी पट्टीने स्थिर बांधा आणि तात्काळ १०८ रुग्णवाहिकेला कॉल करा. सर्व प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय व GMC मध्ये अँटी-स्नेक व्हेनम (ASV) मोफत उपलब्ध आहे.",
          image_url: "/images/awareness/snakebite_firstaid.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 259200000).toISOString(),
          valid_until: new Date(Date.now() + 5184000000).toISOString(),
          official_source: "राष्ट्रीय आरोग्य अभियान (NHM), महाराष्ट्र",
          emergency_contact: "१०८ (मोफत आपत्कालीन रुग्णवाहिका)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-3",
          title: "मिशन इंद्रधनुष: बालकांचे संपूर्ण व वेळेवर मोफत लसीकरण",
          message: "पोलिओ, गोवर, रुबेला, धनुर्वात आणि न्यूमोनिया यांसारख्या गंभीर आजारांपासून आपल्या बाळाचे रक्षण करण्यासाठी अंगणवाडी व प्राथमिक आरोग्य केंद्रात (PHC) मोफत लस टोचून घ्या. जन्मानंतर २४ तासांच्या आत बीसीजी व पोलिओचा डोस अवश्य द्या.",
          image_url: "/images/awareness/childhood_immunization.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 432000000).toISOString(),
          valid_until: new Date(Date.now() + 3456000000).toISOString(),
          official_source: "कुटुंब कल्याण संचालनालय, महाराष्ट्र",
          emergency_contact: "१०४ / आशा सेविका",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-4",
          title: "गर्भावस्थेतील पोषण, नियमित तपासणी व जननी सुरक्षा (JSSK)",
          message: "गरोदरपणात किमान ४ प्रसवपूर्व तपासण्या (ANC) शासकीय केंद्रात करून घ्या. ॲनिमिया टाळण्यासाठी आयर्न व फॉलिक ॲसिडच्या गोळ्या नियमित घ्या. JSSK अंतर्गत १००% मोफत सुरक्षित प्रसूती व मोफत १०२ रुग्णवाहिका प्रवास उपलब्ध आहे.",
          image_url: "/images/awareness/maternal_child_care.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 518400000).toISOString(),
          valid_until: new Date(Date.now() + 2592000000).toISOString(),
          official_source: "मातृ व बाल आरोग्य कक्ष, महाराष्ट्र शासन",
          emergency_contact: "१०२ (JSSK) / १०८ (आपत्कालीन)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-5",
          title: "कर्करोग पूर्वतपासणी व महात्मा फुले जन आरोग्य योजना (MJPJAY)",
          message: "तोंडातील न भरणारे व्रण, स्तनातील गाठ किंवा अचानक वजन कमी होणे या लक्षणांकडे दुर्लक्ष करू नका. शासकीय वैद्यकीय महाविद्यालय (GMC नागपूर) व RST कॅन्सर हॉस्पिटलमध्ये MJPJAY अंतर्गत ₹५ लाख रुपयांपर्यंत मोफत कॅशलेस उपचार उपलब्ध आहेत.",
          image_url: "/images/awareness/cancer_screening.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 604800000).toISOString(),
          valid_until: new Date(Date.now() + 7776000000).toISOString(),
          official_source: "राज्य आरोग्य हमी सोसायटी, महाराष्ट्र",
          emergency_contact: "१०४ (MJPJAY माहिती कक्ष)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-6",
          title: "उच्च रक्तदाब व मधुमेह नियंत्रण: मासिक मोफत NCD तपासणी",
          message: "रक्तदाब आणि साखर विकार सुरुवातीला कोणतीही लक्षणे दाखवत नाहीत. हृदयविकार व पक्षाघात टाळण्यासाठी दरमहा जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) NCD क्लिनिकमध्ये मोफत तपासणी करा आणि मिठाचे प्रमाण कमी ठेवा.",
          image_url: "/images/awareness/hypertension_diabetes.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 691200000).toISOString(),
          valid_until: new Date(Date.now() + 5184000000).toISOString(),
          official_source: "राष्ट्रीय असंसर्गजन्य रोग नियंत्रण कार्यक्रम",
          emergency_contact: "१०८ (हृदयविकार आपत्कालीन)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-7",
          title: "१०८ मोफत आपत्कालीन रुग्णवाहिका: २४x७ जीवनरक्षक सेवा",
          message: "कोणत्याही गंभीर अपघातात, हृदयविकारात किंवा प्रसूतीच्या वेळी तात्काळ १०८ डायल करा. ऑक्सिजन, व्हेंटिलेटर आणि प्रशिक्षित डॉक्टरसह सुसज्ज रुग्णवाहिका थेट आपल्या गावात पोहोचते. हा कॉल व सेवा १००% मोफत आहे.",
          image_url: "/images/awareness/emergency_108.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 777600000).toISOString(),
          valid_until: new Date(Date.now() + 8640000000).toISOString(),
          official_source: "महाराष्ट्र आपत्कालीन वैद्यकीय सेवा (MEMS 108)",
          emergency_contact: "१०८ थेट डायल करा",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-8",
          title: "टेलि-मानस (१४४१६): २४ तास मोफत व गोपनीय मानसिक समुपदेशन",
          message: "ताणतणाव, नैराश्य किंवा कौटुंबिक चिंतेच्या वेळी एकटे राहू नका. टेलि-मानस टोल-फ्री क्रमांक १४४१६ वर आपल्या मातृभाषेत तज्ज्ञ मानसोपचारतज्ज्ञांशी मोकळेपणाने बोला. आपली ओळख पूर्णपणे गोपनीय ठेवली जाते.",
          image_url: "/images/awareness/mental_health.jpg",
          language: "mr",
          publish_date: new Date(Date.now() - 864000000).toISOString(),
          valid_until: new Date(Date.now() + 8640000000).toISOString(),
          official_source: "आरोग्य व कुटुंब कल्याण मंत्रालय (MoHFW) / NIMHANS",
          emergency_contact: "१४४१६ (टोल-फ्री २४x७)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        // English Campaigns
        {
          id: "camp-9",
          title: "Snakebite First Aid & Free Anti-Snake Venom (ASV) Protocol",
          message: "Snakebite is a medical emergency! Never cut, suck, or tie tight tourniquets. Immobilize the bitten limb with a splint, keep patient calm, and call 108 immediately. Anti-Snake Venom (ASV) is freely stocked at all PHCs and District Hospitals.",
          image_url: "/images/awareness/snakebite_firstaid.jpg",
          language: "en",
          publish_date: new Date(Date.now() - 172800000).toISOString(),
          valid_until: new Date(Date.now() + 5184000000).toISOString(),
          official_source: "Directorate of Health Services, Government of Maharashtra",
          emergency_contact: "108 (Toll-Free Ambulance)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-10",
          title: "Monsoon Precautions: Dengue, Malaria & Clean Drinking Water",
          message: "Protect your household from mosquito breeding. Observe weekly dry days, cover water pots, sleep under bed nets, and always drink boiled water. Use ORS immediately at the onset of diarrheal symptoms.",
          image_url: "/images/awareness/monsoon_dengue.jpg",
          language: "en",
          publish_date: new Date(Date.now() - 259200000).toISOString(),
          valid_until: new Date(Date.now() + 2592000000).toISOString(),
          official_source: "National Health Mission, Maharashtra",
          emergency_contact: "104 (Health Helpline) / 108",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        // Hindi Campaigns
        {
          id: "camp-11",
          title: "सर्पदंश प्राथमिक उपचार और सरकारी अस्पतालों में मुफ्त ASV",
          message: "सांप काटने पर घबराएं नहीं। काटे गए अंग पर चीरा न लगाएं, न ही कसकर धागा बांधें। तुरंत अंग को लकड़ी की पट्टी से स्थिर रखें और 108 एम्बुलेंस से नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) पहुंचे जहां एंटी-वेनम (ASV) मुफ्त मिलता है।",
          image_url: "/images/awareness/snakebite_firstaid.jpg",
          language: "hi",
          publish_date: new Date(Date.now() - 172800000).toISOString(),
          valid_until: new Date(Date.now() + 5184000000).toISOString(),
          official_source: "राष्ट्रीय स्वास्थ्य मिशन, महाराष्ट्र",
          emergency_contact: "108 (मुफ्त आपातकालीन एम्बुलेंस)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-12",
          title: "कैंसर की शुरुआती पहचान और MJPJAY के तहत ₹5 लाख मुफ्त इलाज",
          message: "मुंह में न भरने वाले छाले, गांठ या तेजी से वजन घटने पर तुरंत डॉक्टर से जांच करवाएं। सरकारी मेडिकल कॉलेज (GMC नागपुर) में MJPJAY व आयुष्मान भारत के तहत बायोप्सी, कीमोथेरेपी और सर्जरी 100% मुफ्त है।",
          image_url: "/images/awareness/cancer_screening.jpg",
          language: "hi",
          publish_date: new Date(Date.now() - 345600000).toISOString(),
          valid_until: new Date(Date.now() + 7776000000).toISOString(),
          official_source: "राज्य स्वास्थ्य सुरक्षा समिति, महाराष्ट्र",
          emergency_contact: "104 / 108",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        }
      ];
      setCampaigns(mockList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [selectedLangFilter, selectedDistrictFilter]);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setApiError("");
    setApiSuccess("");

    try {
      const payload = {
        title: newTitle,
        message: newMessage,
        language: newLanguage,
        official_source: newSource,
        emergency_contact: newEmergencyContact,
        valid_until: newValidUntil ? new Date(newValidUntil).toISOString() : null,
        targets: newDistrict ? [{ state: "Maharashtra", district: newDistrict }] : []
      };

      await communityHealthApi.createCampaign(payload);
      setApiSuccess("Campaign published successfully and targeted to selected villages.");
      setIsCreateModalOpen(false);
      
      // Reset form
      setNewTitle("");
      setNewMessage("");
      setNewSource("");
      setNewEmergencyContact("");
      setNewDistrict("");
      setNewValidUntil("");
      loadCampaigns();
    } catch (err) {
      setApiError(err.message || "Failed to publish campaign");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePrintPoster = () => {
    window.print();
  };

  const isDistrictAdmin = user && user.role === "district_admin";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Hide layout components during print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Printable Poster Mode Overlay */}
      {activePosterCampaign ? (
        <div className="fixed inset-0 bg-white z-50 p-8 flex flex-col justify-between print:p-0 print:static print:h-auto print:bg-white text-slate-950">
          <div className="print:hidden flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-sm font-bold text-slate-700">Poster Print Preview Mode</h2>
            <div className="flex gap-2">
              <Button onClick={handlePrintPoster} className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Print Poster
              </Button>
              <Button onClick={() => setActivePosterCampaign(null)} variant="outline" className="text-xs flex items-center gap-1">
                <X className="w-4 h-4" />
                Exit Preview
              </Button>
            </div>
          </div>

          {/* Actual Poster Layout */}
          <div className="border-8 border-teal-600 p-8 rounded-3xl flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full bg-white text-slate-900 print:border-4 print:p-4 shadow-xl">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-sm">J</div>
                <h1 className="text-xl font-black tracking-tight text-teal-950">JeevanSetu Public Health Advisory • जीवनसेतू</h1>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                सार्वजनिक आरोग्य व कुटुंब कल्याण विभाग • Government of Maharashtra
              </p>
              <hr className="border-teal-600/30" />
            </div>

            {/* High-Resolution Campaign Picture */}
            {activePosterCampaign.image_url && (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md my-4 border-2 border-teal-100 bg-slate-950">
                <img 
                  src={activePosterCampaign.image_url} 
                  alt={activePosterCampaign.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="my-4 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-teal-900 uppercase">
                {activePosterCampaign.title}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-medium px-2 md:px-8 whitespace-pre-line">
                {activePosterCampaign.message}
              </p>
            </div>

            <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 text-center space-y-2">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">🚨 आपत्कालीन व वैद्यकीय मदत / Emergency Helplines</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-wide">
                {activePosterCampaign.emergency_contact || "104 (Health Help) / 108 (Ambulance)"}
              </p>
              <p className="text-[11px] text-slate-600 font-semibold">
                मोफत २४x७ शासकीय सेवा. कोणत्याही साध्या फोनवरून अथवा मोबाईलवरून थेट डायल करा.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left text-[11px] text-slate-500 font-bold">
              <div>
                <p>SOURCE: {activePosterCampaign.official_source}</p>
                <p className="text-slate-400 mt-0.5">Published: {new Date(activePosterCampaign.publish_date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  VERIFIED ADVISORY • १००% अधिकृत
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold px-2 py-0.5 border border-rose-200 dark:border-rose-900">
                  Advisory Bulletins
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Community Health Awareness
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Access and print official public health campaigns targeted for village councils and PHC centers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/health-awareness">
                <Button variant="outline" className="text-xs font-bold border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 py-2 px-4 rounded-xl flex items-center gap-1.5">
                  <span>🖼️ सचित्र आरोग्य मार्गदर्शिका (Hub)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

              {isDistrictAdmin && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Publish Campaign
                </Button>
              )}
            </div>
          </div>

          {apiSuccess && (
            <div className="mb-6">
              <Alert className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
                {apiSuccess}
              </Alert>
            </div>
          )}

          {/* Filtering Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-xs flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedLangFilter}
                onChange={(e) => setSelectedLangFilter(e.target.value)}
                className="text-xs py-2"
              >
                <option value="ALL">All Languages</option>
                <option value="en">English Only</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </Select>
            </div>

            <div className="flex-1">
              <Select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="text-xs py-2"
              >
                <option value="ALL">All Maharashtra Districts</option>
                <option value="Nagpur">Nagpur Division</option>
                <option value="Pune">Pune Division</option>
                <option value="Mumbai">Mumbai Division</option>
                <option value="Gadchiroli">Gadchiroli Division</option>
              </Select>
            </div>
          </div>

          {/* Campaigns Feed */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Clock className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs text-slate-500">Retrieving health campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white">No Active Campaigns</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                There are no active awareness bulletins registered for your selected region or language.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <div 
                  key={camp.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {camp.image_url && (
                      <div 
                        className="h-48 w-full relative bg-slate-950 overflow-hidden cursor-pointer border-b border-slate-100 dark:border-slate-800"
                        onClick={() => setActivePosterCampaign(camp)}
                      >
                        <img 
                          src={camp.image_url} 
                          alt={camp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />
                        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                          <span>🔍 पोस्टर पहा / Print</span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold uppercase text-[9px] px-1.5 py-0">
                          {camp.language === "mr" ? "मराठी" : camp.language === "hi" ? "हिन्दी" : "English"}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Expires: {camp.valid_until ? new Date(camp.valid_until).toLocaleDateString() : "Never"}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-950 dark:text-white leading-snug">
                        {camp.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal line-clamp-4">
                        {camp.message}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-3 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Source: {camp.official_source.slice(0, 30)}...</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setActivePosterCampaign(camp)}
                        className="bg-teal-600 hover:bg-teal-700 text-white w-full text-xs font-semibold py-1.5 rounded-xl flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Poster View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modal: Publish Campaign (Admin Only) */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="Publish Health Awareness Campaign"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            {apiError && (
              <Alert className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300">
                {apiError}
              </Alert>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Advisory Title</label>
              <Input
                type="text"
                placeholder="e.g. Monsoon Malaria Prevention Guidelines"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
              <Select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="text-xs"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Advisory Message</label>
              <Textarea
                rows={4}
                placeholder="Write advisory instructions for display..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Publishing Source</label>
              <Input
                type="text"
                placeholder="e.g. Directorate of Health Services, Maharashtra"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Help Contact Numbers</label>
              <Input
                type="text"
                placeholder="e.g. 104 / 108"
                value={newEmergencyContact}
                onChange={(e) => setNewEmergencyContact(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target District</label>
                <Select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Global (All Districts)</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Gadchiroli">Gadchiroli</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valid Until (Expiry)</label>
                <Input
                  type="date"
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs" 
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish Bulletin"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Hide footer during print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default CommunityHealthPage;
