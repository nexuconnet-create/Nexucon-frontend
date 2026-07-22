'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal, Search, Bell, Sparkles, ShieldCheck, HardHat, Landmark, Calendar, Truck, Wrench, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ExecutionTeamBuilderPage() {
  const contractors = [
    {
      name: 'PrimeStone Construction Ltd.',
      subtitle: 'High-Rise Commercial Buildings',
      experience: '22 Years',
      projects: '190',
      teamSize: '220+ Professionals',
      location: 'Abuja',
      clientSatisfaction: '98%',
      insuranceVerified: true,
      safetyRecord: '0 LTI - 5 Yrs',
      financialStability: 'Audited Tier 1',
      availability: 'Immediate',
      mobileWorkforce: true,
      equipmentOwned: true,
      logo: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784561128/Prime_it4p9t.png'
    },
    {
      name: 'Vortex Engineering & Construction',
      subtitle: 'Commercial, Industrial & Institutional Projects',
      experience: '18 Years',
      projects: '117',
      teamSize: '135+ Professionals',
      location: 'Port Harcourt',
      clientSatisfaction: '95%',
      insuranceVerified: true,
      safetyRecord: '1 LTI - 3 Yrs',
      financialStability: 'Audited Tier 2',
      availability: 'In 2 Weeks',
      mobileWorkforce: true,
      equipmentOwned: true,
      logo: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784561141/Vertex_ymna7a.png'
    },
    {
      name: 'BlueRock Infrastructure Ltd.',
      subtitle: 'Commercial Buildings & Civil Infrastructure',
      experience: '20 Years',
      projects: '142',
      teamSize: '175+ Professionals',
      location: 'Lagos',
      clientSatisfaction: '96%',
      insuranceVerified: true,
      safetyRecord: '0 LTI - 4 Yrs',
      financialStability: 'Audited Tier 1',
      availability: 'Immediate',
      mobileWorkforce: true,
      equipmentOwned: false,
      logo: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784561113/BlueRock_pysprf.png'
    },
    {
      name: 'Crestline Construction Group',
      subtitle: 'Residential Estates & Commercial Complexes',
      experience: '14 Years',
      projects: '88',
      teamSize: '110+ Professionals',
      location: 'Ibadan',
      clientSatisfaction: '92%',
      insuranceVerified: false,
      safetyRecord: '2 LTI - 2 Yrs',
      financialStability: 'Audited Tier 2',
      availability: 'In 1 Month',
      mobileWorkforce: false,
      equipmentOwned: true,
      logo: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784561113/Crestline_xy6pna.png'
    },
    {
      name: 'UrbanCore Projects Ltd',
      subtitle: 'Design & Build • Turnkey Construction',
      experience: '12 Years',
      projects: '105',
      teamSize: '100+ Professionals',
      location: 'Lagos',
      clientSatisfaction: '94%',
      insuranceVerified: true,
      safetyRecord: '0 LTI - 3 Yrs',
      financialStability: 'Audited Tier 2',
      availability: 'Immediate',
      mobileWorkforce: true,
      equipmentOwned: true,
      logo: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784561141/UrbanCore_xfsv4c.png'
    },
  ];

  const executionTeam = [
    {
      name: 'Team Alpha Construction',
      subtitle: 'Commercial Strategy Group',
      teamSize: '12 Professionals',
      experience: '14 Years',
      projects: '65',
      lead: 'David Johnson - Project Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png'
    },
    {
      name: 'Team BuildPro Elite',
      subtitle: 'Structural Development',
      teamSize: '15 Professionals',
      experience: '16 Years',
      projects: '84',
      lead: 'Ahmed Musa - Senior Project Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg'
    },
    {
      name: 'Team Skyline Execution',
      subtitle: 'High-Rise Strategy',
      teamSize: '18 Professionals',
      experience: '15 Years',
      projects: '157',
      lead: 'Michael Adeyemi - Construction Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png'
    },
    {
      name: 'Team Foundation Experts',
      subtitle: 'Commercial, Institutional Projects',
      teamSize: '10 Professionals',
      experience: '12 Years',
      projects: '48',
      lead: 'Olivia Thompson - Project Director',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg'
    },
    {
      name: 'Team Urban Construct',
      subtitle: 'Mixed-Use Strategy Group',
      teamSize: '14 Professionals',
      experience: '12 Years',
      projects: '45',
      lead: 'James Ibrahim - Site Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png'
    },
    {
      name: 'Team Precision Build',
      subtitle: 'Advanced Infrastructure',
      teamSize: '16 Professionals',
      experience: '17 Years',
      projects: '92',
      lead: 'Samuel Bello - Construction Lead',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg'
    },
    {
      name: 'Team Prime Execution',
      subtitle: 'Industrial Strategy',
      teamSize: '15 Professionals',
      experience: '14 Years',
      projects: '71',
      lead: 'John Okafor - Senior Construction Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png'
    },
    {
      name: 'Team Elite SiteWorks',
      subtitle: 'Commercial Zone Strategy',
      teamSize: '17 Professionals',
      experience: '16 Years',
      projects: '105',
      lead: 'Aisha Williams - Operations Manager',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg'
    },
    {
      name: 'Team Vision Builders',
      subtitle: 'Commercial Estate Strategy',
      teamSize: '20 Professionals',
      experience: '19 Years',
      projects: '118',
      lead: 'Ahmed Musa - Project Director',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png'
    },
    {
      name: 'Team Dynamic Construct',
      subtitle: 'Institutional Projects',
      teamSize: '12 Professionals',
      experience: '10 Years',
      projects: '55',
      lead: 'David Johnson - Site Supervisor',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg'
    }
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Execution Team Builder
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-4xl leading-relaxed">
            Build a verified construction team based on your approved project. Nexucon recommends experienced professionals tailored to your project type, scope, and location, helping you transition confidently from design into execution.
          </p>
        </div>
        <Link href="/professional/dashboard/team/execution-builder/ai-assistant" className="w-full md:w-auto shrink-0">
          <Button variant="outline" className="w-full md:w-auto px-8 py-5 cursor-pointer border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 h-[44px] flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Smart AI Assistant
          </Button>
        </Link>
      </div>

      {/* Banner */}
      <div className="w-full bg-[#022C4F] rounded-[32px] p-8 flex items-center justify-between mb-10 shadow-md">
        <h2 className="text-[24px] font-extrabold text-white">Victoria Heights Residential Estate</h2>
        <button className="w-10 h-10 rounded-full bg-white text-[#022C4F] flex items-center justify-center hover:bg-gray-100 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Project Overview */}
      <div className="mb-12">
        <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-6">Project Overview</h3>
        <p className="text-[13px] font-bold text-[#0F181F] mb-4">Project Information</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
          <div>
            <span className="text-[12px] font-bold text-[#0F181F]">Project Type:</span>
            <span className="text-[12px] text-gray-600 font-medium ml-2">Medium Commercial Building</span>
          </div>
          <div>
            <span className="text-[12px] font-bold text-[#0F181F]">Location:</span>
            <span className="text-[12px] text-gray-600 font-medium ml-2">Lekki, Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-2 lg:col-span-2">
            <span className="text-[12px] font-bold text-[#0F181F]">Construction Readiness:</span>
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-[12px] text-green-600 font-medium">Ready for Execution</span>
            </div>
          </div>
          <div>
            <span className="text-[12px] font-bold text-[#0F181F]">Estimated Construction Duration:</span>
            <span className="text-[12px] text-gray-600 font-medium ml-2">14 Months</span>
          </div>
          <div className="lg:col-span-3">
            <span className="text-[12px] font-bold text-[#0F181F]">Recommended Team Size:</span>
            <span className="text-[12px] text-gray-600 font-medium ml-2">12-15 Professionals</span>
          </div>
        </div>
      </div>

      {/* Recommended Contractors */}
      <div className="mb-12">
        <div className="mb-6">
          <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-1">Recommended Contractors</h3>
          <p className="text-[11px] text-gray-500 font-medium">Verified contractors recommended for your project based on building type, project scale, location, delivery history, certifications, and client satisfaction.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {contractors.map((company, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-[#022C4F] transition-all flex flex-col">

              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 mb-4 overflow-hidden relative">
                {company.logo ? (
                  <Image src={company.logo} alt={company.name} fill className="object-contain p-1.5" />
                ) : (
                  <div className="text-[20px] font-extrabold text-[#022C4F] tracking-tighter">{company.name.charAt(0)}</div>
                )}
              </div>

              <h4 className="text-[15px] font-extrabold text-[#022C4F] mb-1">{company.name}</h4>
              <p className="text-[11px] text-gray-500 font-medium mb-6">{company.subtitle}</p>

              <div className="flex flex-col gap-2 mb-5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#0F181F]">Experience:</span>
                  <span className="text-gray-600">{company.experience}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#0F181F]">Completed Projects:</span>
                  <span className="text-gray-600">{company.projects}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#0F181F]">Team Size:</span>
                  <span className="text-gray-600">{company.teamSize}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#0F181F]">Location:</span>
                  <span className="text-gray-600">{company.location}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#0F181F]">Client Satisfaction:</span>
                  <span className="text-[#022C4F] font-bold flex items-center gap-1">
                    <Star size={10} className="fill-[#022C4F] text-[#022C4F]" />
                    {company.clientSatisfaction}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Compliance & Operations</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${company.insuranceVerified ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <ShieldCheck size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold">{company.insuranceVerified ? 'Insured/Bonded' : 'Unverified Insurance'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-blue-50 border-blue-100 text-blue-700">
                    <HardHat size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold line-clamp-1">{company.safetyRecord}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-purple-50 border-purple-100 text-purple-700">
                    <Landmark size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold line-clamp-1">{company.financialStability}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-orange-50 border-orange-100 text-orange-700">
                    <Calendar size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold line-clamp-1">{company.availability}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${company.mobileWorkforce ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    <Truck size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold">{company.mobileWorkforce ? 'Mobile Workforce' : 'Local Only'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${company.equipmentOwned ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    <Wrench size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold">{company.equipmentOwned ? 'Owns Equipment' : 'Rents Equipment'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <Button variant="primary" className="flex-1 h-[36px] text-[11px]">
                  View Company
                </Button>
                <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                  <MoreHorizontal size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Recommended Execution Team */}
      <div>
        <div className="mb-6">
          <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-1">Recommended Execution Team</h3>
          <p className="text-[11px] text-gray-500 font-medium">Recommended multidisciplinary execution teams tailored to your project's size, complexity, location and approved construction package. Each team consists of verified professionals with proven experience delivering similar projects.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {executionTeam.map((team, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-[20px] p-4 shadow-sm hover:shadow-md hover:border-[#022C4F] transition-all flex flex-col">

              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100">
                <Image src={team.image} alt='' fill className="object-cover" />
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-[#8BC34A]"></div>
              </div>

              <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-0.5 line-clamp-1">{team.name}</h4>
              <p className="text-[10px] text-gray-400 font-medium mb-4 line-clamp-1">{team.subtitle}</p>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[#0F181F]">Team Size:</span>
                  <span className="text-gray-600">{team.teamSize}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[#0F181F]">Average Experience:</span>
                  <span className="text-gray-600">{team.experience}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[#0F181F]">Completed Projects:</span>
                  <span className="text-gray-600">{team.projects}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1">
                  <span className="font-bold text-[#0F181F] shrink-0 mr-1">Lead:</span>
                  <span className="text-gray-600 line-clamp-1 text-right">{team.lead}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Button variant="primary" className="flex-1 h-[32px] text-[10px]">
                  Invite Team
                </Button>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                  <MoreHorizontal size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
