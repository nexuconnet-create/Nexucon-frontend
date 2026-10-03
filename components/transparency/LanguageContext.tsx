"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'yo' | 'ig' | 'ha';

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {
    portal_title: "Public Transparency Portal",
    portal_subtitle: "Building Trust Through Open Data & Verified Regulatory Oversight",
    nav_home: "Portal Home",
    nav_search: "Project Search",
    nav_map: "GIS Map Explorer",
    nav_verify: "Verify Permit",
    nav_documents: "Public Documents",
    nav_notices: "Safety Notices",
    nav_report: "Report Violation",
    hero_title: "Building Trust Through Open Data",
    hero_subtitle: "Verify statutory building planning permits, inspect certified engineering milestones, and report hazardous construction across Lagos State.",
    search_placeholder: "Search by Project Name, Permit No (e.g. LASBCA/PRM/2026/0419), or LGA...",
    search_btn: "Search Registry",
    quick_verify: "Verify Permit",
    quick_map: "Explore Map",
    quick_report: "Report Hazard",
    stat_active_sites: "Active Verified Sites",
    stat_permits: "Approved Permits",
    stat_compliance: "Statutory Compliance",
    stat_inspections: "Completed Audits",
    featured_projects: "Featured Statutory Projects",
    recent_notices: "Recent Public Safety & Enforcement Bulletins",
    view_details: "View Public Profile",
    verified_badge: "Verified Statutory Permit",
    under_construction: "Under Construction",
    permit_approved: "Permit Approved",
    completed: "Completed & Certified",
    stop_work_order: "Stop-Work Order Served",
    compliant: "Compliant",
    under_review: "Under Technical Review",
    how_protects: "How Nexucon Protects Your Community",
    foi_notice: "Public Information Charter: All data published has been ratified by the relevant Zonal Directorate and verified for civic transparency under Lagos State Urban Planning & Building Regulations.",
  },
  yo: {
    portal_title: "Ẹnu-ọ̀nà Ìtúpalẹ̀ Fún Gbogbo Ènìyàn",
    portal_subtitle: "Kíkọ́ Ìgbẹ́kẹ̀lé Nípasẹ̀ Ìwífún Pátápátá àti Ìbáwí Òfin Ìkọ́lé",
    nav_home: "Ilé Ìbẹ̀rẹ̀",
    nav_search: "Wá Iṣẹ́ Ìkọ́lé",
    nav_map: "Àwòrán Ilẹ̀ (GIS Map)",
    nav_verify: "Dán Ìwé Àṣẹ Wò",
    nav_documents: "Àwọn Ìwé Òfin",
    nav_notices: "Àwọn Ìfilọ̀ Àbò",
    nav_report: "Fi Ẹjọ́ Ìkọ́lé Sùn",
    hero_title: "Kíkọ́ Ìgbẹ́kẹ̀lé Nípasẹ̀ Ìwífún Pátápátá",
    hero_subtitle: "Ṣe ìdánwò àwọn ìwé àṣẹ ìkọ́lé LASBCA, wo àwọn àyẹ̀wò ìmọ̀-ẹ̀rọ, kí o sì ròyìn ìkọ́lé tí kò lábò ní Ìpínlẹ̀ Èkó.",
    search_placeholder: "Wá orúkọ iṣẹ́, nọ́mbà ìwé àṣẹ (bii LASBCA/PRM/...), tàbí agbègbè LGA...",
    search_btn: "Wá Àkọsílẹ̀",
    quick_verify: "Dán Ìwé Àṣẹ Wò",
    quick_map: "Wo Àwòrán Ilẹ̀",
    quick_report: "Fi Ewu Sùn",
    stat_active_sites: "Àwọn Ilé Ìkọ́lé Tí A Fọwọ́sí",
    stat_permits: "Ìwé Àṣẹ Tí A Pèsè",
    stat_compliance: "Ìbáwí Òfin Ìkọ́lé",
    stat_inspections: "Àyẹ̀wò Tí A Parí",
    featured_projects: "Àwọn Iṣẹ́ Ìkọ́lé Pàtàkì",
    recent_notices: "Àwọn Ìfilọ̀ Àbò àti Òfin Titun",
    view_details: "Wo Ìwífún Kíkún",
    verified_badge: "Ìwé Àṣẹ Òfin Tí A Fọwọ́sí",
    under_construction: "Ń Lọ Lọ́wọ́",
    permit_approved: "A Ti Fọwọ́sí Ìwé Àṣẹ",
    completed: "A Ti Parí Pẹ̀lú Ẹ̀rí",
    stop_work_order: "A Ti Dá Iṣẹ́ Dúró (Òfin)",
    compliant: "Ó Bá Òfin Mu",
    under_review: "Wọ́n Ń Ṣàyẹ̀wò Rẹ̀",
    how_protects: "Bí Nexucon Ṣe Ń Dáàbò Bo Àwùjọ Rẹ",
    foi_notice: "Ìwífún yìí jẹ́ èyí tí àjọ LASBCA ti fọwọ́sí fún gbogbo ará ìlú lábẹ́ òfin ìkọ́lé Ìpínlẹ̀ Èkó.",
  },
  ig: {
    portal_title: "Ọnụ Ụzọ Mkpughe Maka Ọhaneze",
    portal_subtitle: "Iwulite Ntụkwasị Obi Site na Ozi doro Anya na Nleba anya Iwu",
    nav_home: "Ụlọ",
    nav_search: "Chọọ Ọrụ Mwube",
    nav_map: "Maapụ GIS",
    nav_verify: "Nyochaa Ikike Ụlọ",
    nav_documents: "Akwụkwọ Ọhaneze",
    nav_notices: "Ọkwa Nchedo",
    nav_report: "Kpesa Mmebi Iwu",
    hero_title: "Iwulite Ntụkwasị Obi Site na Ozi doro Anya",
    hero_subtitle: "Nyochaa ikike ụlọ LASBCA kwadoro, lee anya nyocha injinia, ma kọọ akụkọ banyere ụlọ dị ize ndụ na Lagos State.",
    search_placeholder: "Chọọ aha ọrụ, nọmba ikike, ma ọ bụ LGA...",
    search_btn: "Chọọ",
    quick_verify: "Nyochaa Ikike",
    quick_map: "Lelee Maapụ",
    quick_report: "Kọọ Ihe Egwu",
    stat_active_sites: "Ebe Mwube Kwadoro",
    stat_permits: "Ikike Enyere",
    stat_compliance: "Nkwado Iwu",
    stat_inspections: "Nyocha Emere",
    featured_projects: "Ọrụ Mwube Ndị Pụtara Ìhè",
    recent_notices: "Ọkwa Nchedo Na Nkwụsị Ọrụ",
    view_details: "Lelee Nkọwa",
    verified_badge: "Ikike Ndị Ọchịchị Kwadoro",
    under_construction: "Na-arụ ugbu a",
    permit_approved: "Enyere Ikike",
    completed: "Emechara Ma Kpọọ Nchekwa",
    stop_work_order: "Iwu Nkwụsị Ọrụ",
    compliant: "Na-agbaso Iwu",
    under_review: "Na-enyocha",
    how_protects: "Otu Nexucon Si Echebe Obodo Gị",
    foi_notice: "Ozi a niile bụ nke ndị LASBCA kwadoro maka ọdịmma ọhaneze n'okpuru iwu Lagos State.",
  },
  ha: {
    portal_title: "Dandalin Bayyana Gaskiya Ga Al'umma",
    portal_subtitle: "Gina Amincewa Ta Hanyar Bayanan Gaskiya da Kula da Dokokin Gine-gine",
    nav_home: "Gida",
    nav_search: "Bincika Ayyuka",
    nav_map: "Taswirar GIS",
    nav_verify: "Tabbatar da Izini",
    nav_documents: "Takardun Hukuma",
    nav_notices: "Sanarwar Tsaro",
    nav_report: "Ba da Rahoton Laifi",
    hero_title: "Gina Amincewa Ta Hanyar Bayanan Gaskiya",
    hero_subtitle: "Tabbatar da ingancin izinin ginin LASBCA, duba matakan binciken injiniyoyi, da ba da rahoton gine-gine masu haɗari a Jihar Legas.",
    search_placeholder: "Bincika sunan aiki, lambar izini, ko karamar hukuma...",
    search_btn: "Bincika",
    quick_verify: "Tabbatar da Izini",
    quick_map: "Bincika Taswira",
    quick_report: "Rahoton Hadari",
    stat_active_sites: "Gine-gine Masu Aiki",
    stat_permits: "Izinin da Aka Ba da",
    stat_compliance: "Bin Dokokin Gini",
    stat_inspections: "Binciken da Aka Kammala",
    featured_projects: "Fitattun Ayyukan Gwamnati",
    recent_notices: "Sanarwar Tsaro da Dokar Tsayar da Aiki",
    view_details: "Duba Cikakken Bayani",
    verified_badge: "Ingantaccen Izinin Hukuma",
    under_construction: "Ana Kan Gini",
    permit_approved: "An Amince da Izini",
    completed: "An Kammala da Tabbaci",
    stop_work_order: "An Ba da Dokar Dakatar da Aiki",
    compliant: "Ya Cika Ka'ida",
    under_review: "Ana Nazari a Kai",
    how_protects: "Yadda Nexucon Ke Kare Al'ummarku",
    foi_notice: "Dukkanin bayanan da aka wallafa a nan hukumar LASBCA ce ta amince da su domin al'umma karkashin dokar Jihar Legas.",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexucon_ptp_lang') as LanguageCode;
      if (saved && ['en', 'yo', 'ig', 'ha'].includes(saved)) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexucon_ptp_lang', lang);
    }
  };

  const t = (key: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
