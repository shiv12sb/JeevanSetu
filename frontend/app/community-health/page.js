"use client";

import React, { useState, useEffect } from "react";
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
      // Fallback mocks
      const mockList = [
        {
          id: "camp-1",
          title: "Monsoon Disease Prevention Advisory",
          message: "Protect your family from Dengue, Malaria, and Waterborne infections. Keep water storage containers tightly covered, use mosquito nets, discard stagnant water around your premises, and drink boiled water. Seek immediate care at the nearest PHC if fever develops.",
          image_url: "https://images.unsplash.com/photo-1584036561566-baf241883c4e?w=800&auto=format&fit=crop",
          language: "en",
          publish_date: new Date(Date.now() - 432000000).toISOString(),
          valid_until: new Date(Date.now() + 2592000000).toISOString(),
          official_source: "Directorate of Health Services, Government of Maharashtra",
          emergency_contact: "104 (Health Helpline) / 108 (Ambulance)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-2",
          title: "पावसाळी आजार प्रतिबंधक मार्गदर्शक सूचना",
          message: "डेंग्यू, हिवताप आणि गॅस्ट्रोपासून स्वतःचे संरक्षण करा. पाणी साठवलेली भांडी झाकून ठेवा, साचलेले पाणी रिकामे करा, डास प्रतिबंधक जाळ्यांचा वापर करा. ताप आल्यास तात्काळ जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा.",
          image_url: "https://images.unsplash.com/photo-1584036561566-baf241883c4e?w=800&auto=format&fit=crop",
          language: "mr",
          publish_date: new Date(Date.now() - 432000000).toISOString(),
          valid_until: new Date(Date.now() + 2592000000).toISOString(),
          official_source: "सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन",
          emergency_contact: "१०४ (आरोग्य सल्ला) / १०८ (रुग्णवाहिका)",
          targets: [{ state: "Maharashtra", district: "Nagpur" }]
        },
        {
          id: "camp-3",
          title: "Mission Indradhanush: Child Immunization",
          message: "Ensure full vaccination protection for all infants under 2 years and pregnant women. Vaccines against Polio, Measles, Rubella, and Tetanus are provided 100% free at all sub-centres and PHCs. Contact your village ASHA worker for details.",
          image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=800&auto=format&fit=crop",
          language: "en",
          publish_date: new Date(Date.now() - 864000000).toISOString(),
          valid_until: new Date(Date.now() + 1296000000).toISOString(),
          official_source: "National Health Mission, Maharashtra",
          emergency_contact: "108 / 102 (JSSK Helpline)",
          targets: []
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
          <div className="border-8 border-teal-600 p-8 rounded-3xl flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full bg-white text-slate-900 print:border-4 print:p-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">J</div>
                <h1 className="text-xl font-bold tracking-tight">JeevanSetu Public Health Advisory</h1>
              </div>
              <hr className="border-teal-600/30" />
            </div>

            <div className="my-8 text-center space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-teal-800 uppercase md:text-4xl">{activePosterCampaign.title}</h2>
              <p className="text-lg leading-relaxed text-slate-700 font-medium px-4 md:px-12 whitespace-pre-line">{activePosterCampaign.message}</p>
            </div>

            <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">🚨 Dynamic Emergency Contacts</p>
              <p className="text-2xl font-black text-rose-600 tracking-wide">{activePosterCampaign.emergency_contact || "104 (Health Help) / 108 (Ambulance)"}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Immediate routing provided without cellular smartphone. Dial from any keypad device.</p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-[11px] text-slate-500 font-bold">
              <div>
                <p>SOURCE: {activePosterCampaign.official_source}</p>
                <p className="text-slate-400 mt-0.5">Published: {new Date(activePosterCampaign.publish_date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-[10px]">VERIFIED ADVISORY</p>
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {camp.image_url && (
                      <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                        <img 
                          src={camp.image_url} 
                          alt={camp.title}
                          className="w-full h-full object-cover"
                        />
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
