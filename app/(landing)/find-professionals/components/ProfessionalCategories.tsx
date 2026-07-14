"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

import { 
  UserCog, 
  PenTool, 
  Building2, 
  Wrench, 
  Mountain, 
  Calculator, 
  HardHat, 
  FileCheck, 
  Briefcase, 
  ClipboardList, 
  Hammer, 
  ShieldCheck, 
  SearchCheck 
} from "lucide-react";

const categories = [
  { id: 1, title: "Skippers (Senior)", icon: UserCog, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783966222/Contractor_Photos_-_Download_Free_High-Quality_Pictures___Freepik_2_zj5myh.png" },
  { id: 2, title: "Architects", icon: PenTool, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783965987/African_Civil_Engineer_at_Work_Site_2_uabcjw.png" },
  { id: 3, title: "Structural Engineers", icon: Building2, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783965986/__3_2_iesmm1.png" },
  { id: 4, title: "MEP Engineers", icon: Wrench, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783968747/Premium_zdje%CC%A8cie___portret_inz%CC%87ynierii_z_kaskiem_i_bezpieczen%CC%81stwa_unifrom_stoja%CC%A8c_w_fabryce__Przemys_1_lajyeh.png" },
  { id: 5, title: "GeoTech Engineers", icon: Mountain, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783974766/The_Diamondback_701_Tool_Vest_2_cuwpwk.png" },
  { id: 6, title: "Quantity Surveyors", icon: Calculator, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783965987/AI_photo_of_a_man_dressed_in_an_engineering_uniform_1_fb8qwa.png" },
  { id: 7, title: "Civil Engineers", icon: HardHat, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783966246/Labor_Day_Smiling_Construction_Worker_with_Yellow_Hard_Hat___Labor_Day_2025_Inspiration_1_kui7rc.png" },
  { id: 8, title: "Permit Specialists", icon: FileCheck, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783965987/__2_2_cdq7nw.png" },
  { id: 9, title: "Project Managers", icon: Briefcase, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783965988/Authentic_People_Stock_Photos_for_Your_Projects_1_j33cgh.png" },
  { id: 10, title: "Site Supervisors", icon: ClipboardList, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783966201/Grau_Profissionalizante___Prazeres_1_pybwdf.png" },
  { id: 11, title: "Field Workers", icon: Hammer, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783975977/SPE%CC%81CIALISTE_HSE_1_wqhxsw.png" },
  { id: 12, title: "Safety Officers", icon: ShieldCheck, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783966211/__10_1_btexgv.png" },
  { id: 13, title: "QA/QC Inspectors", icon: SearchCheck, image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783976082/What_Is_Warehouse_Inventory_Management_Software_and_How_Does_It_Benefit_You__1_vzcwlo.png" }
];

function ProfessionalCategoriesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const categoryFilter = searchParams.get("category");

  const filteredCategories = categories.filter((cat) => {
    let match = true;
    if (query && !cat.title.toLowerCase().includes(query)) {
      match = false;
    }
    // Simple matching: if category filter is selected, match exactly or plural 
    // e.g. "Architect" -> "Architects"
    if (categoryFilter && !cat.title.toLowerCase().includes(categoryFilter.toLowerCase())) {
      match = false;
    }
    return match;
  });

  return (
    <>
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#ffffff] mb-4"
        >
          Explore <br className="hidden md:block" /> Professional Categories
        </motion.h2>
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {filteredCategories.map((cat, index) => {
            const isLast = index === filteredCategories.length - 1;
            const isAloneOnMd = isLast && filteredCategories.length % 3 === 1;
            const isAloneOnSm = isLast && filteredCategories.length % 2 === 1;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`relative group bg-[#ffffff] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-full max-w-[327px] mx-auto ${isAloneOnSm ? "sm:col-span-2" : ""
                  } ${isAloneOnMd ? "md:col-span-1 md:col-start-2" : "md:col-start-auto"}`}
              >
                {/* Image Container */}
                <div className="relative h-[310px] w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Title Block */}
                <div className="relative bg-[#ffffff] py-4 px-6 flex items-center justify-center text-center">
                  <h3 className="text-[#0F181F] font-bold text-[14px]">
                    {cat.title}
                  </h3>
                  <div className="absolute right-0 top-0 bottom-0 bg-[#022C4F] w-14 flex items-center justify-center transition-all duration-300 group-hover:bg-[#034078]">
                    <cat.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-white/60 py-12">
          No categories match your filter criteria.
        </div>
      )}
    </>
  );
}

export default function ProfessionalCategories() {
  return (
    <section className="w-full bg-[#0F181F] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <React.Suspense fallback={<div className="text-white text-center py-12">Loading...</div>}>
          <ProfessionalCategoriesContent />
        </React.Suspense>
      </div>
    </section>
  );
}
