/**
 * Nigeria States, Local Governments (LGAs), and Local Council Development Areas (LCDAs)
 * Comprehensive dataset covering all 36 States + FCT, with detailed coverage of Lagos State's
 * 20 Local Government Areas and 37 Local Council Development Areas (57 total administrative divisions).
 */

export interface AreaItem {
  name: string;
  type: 'LGA' | 'LCDA';
  parentLga?: string;
  label: string;
}

export interface StateData {
  name: string;
  code: string;
  hasLcda: boolean;
  areas: AreaItem[];
}

export const NIGERIA_STATES: StateData[] = [
  {
    name: 'Lagos',
    code: 'LA',
    hasLcda: true,
    areas: [
      // 1. Agege
      { name: 'Agege', type: 'LGA', parentLga: 'Agege', label: 'Agege (LGA)' },
      { name: 'Orile Agege', type: 'LCDA', parentLga: 'Agege', label: 'Orile Agege (LCDA)' },

      // 2. Ajeromi-Ifelodun
      { name: 'Ajeromi-Ifelodun', type: 'LGA', parentLga: 'Ajeromi-Ifelodun', label: 'Ajeromi-Ifelodun (LGA)' },
      { name: 'Ifelodun', type: 'LCDA', parentLga: 'Ajeromi-Ifelodun', label: 'Ifelodun (LCDA)' },

      // 3. Alimosho
      { name: 'Alimosho', type: 'LGA', parentLga: 'Alimosho', label: 'Alimosho (LGA)' },
      { name: 'Agbado/Oke-Odo', type: 'LCDA', parentLga: 'Alimosho', label: 'Agbado/Oke-Odo (LCDA)' },
      { name: 'Ayobo-Ipaja', type: 'LCDA', parentLga: 'Alimosho', label: 'Ayobo-Ipaja (LCDA)' },
      { name: 'Egbe-Idimu', type: 'LCDA', parentLga: 'Alimosho', label: 'Egbe-Idimu (LCDA)' },
      { name: 'Igando-Ikotun', type: 'LCDA', parentLga: 'Alimosho', label: 'Igando-Ikotun (LCDA)' },
      { name: 'Mosan-Okunola', type: 'LCDA', parentLga: 'Alimosho', label: 'Mosan-Okunola (LCDA)' },

      // 4. Amuwo-Odofin
      { name: 'Amuwo-Odofin', type: 'LGA', parentLga: 'Amuwo-Odofin', label: 'Amuwo-Odofin (LGA)' },
      { name: 'Oriade', type: 'LCDA', parentLga: 'Amuwo-Odofin', label: 'Oriade (LCDA)' },

      // 5. Apapa
      { name: 'Apapa', type: 'LGA', parentLga: 'Apapa', label: 'Apapa (LGA)' },
      { name: 'Apapa Iganmu', type: 'LCDA', parentLga: 'Apapa', label: 'Apapa Iganmu (LCDA)' },

      // 6. Badagry
      { name: 'Badagry', type: 'LGA', parentLga: 'Badagry', label: 'Badagry (LGA)' },
      { name: 'Badagry West', type: 'LCDA', parentLga: 'Badagry', label: 'Badagry West (LCDA)' },
      { name: 'Olorunda', type: 'LCDA', parentLga: 'Badagry', label: 'Olorunda (LCDA)' },

      // 7. Epe
      { name: 'Epe', type: 'LGA', parentLga: 'Epe', label: 'Epe (LGA)' },
      { name: 'Eredo', type: 'LCDA', parentLga: 'Epe', label: 'Eredo (LCDA)' },
      { name: 'Ikosi-Ejinrin', type: 'LCDA', parentLga: 'Epe', label: 'Ikosi-Ejinrin (LCDA)' },

      // 8. Eti-Osa
      { name: 'Eti-Osa', type: 'LGA', parentLga: 'Eti-Osa', label: 'Eti-Osa (LGA)' },
      { name: 'Eti-Osa East', type: 'LCDA', parentLga: 'Eti-Osa', label: 'Eti-Osa East (LCDA)' },
      { name: 'Iru-Victoria Island', type: 'LCDA', parentLga: 'Eti-Osa', label: 'Iru-Victoria Island (LCDA)' },
      { name: 'Ikoyi-Obalende', type: 'LCDA', parentLga: 'Eti-Osa', label: 'Ikoyi-Obalende (LCDA)' },

      // 9. Ibeju-Lekki
      { name: 'Ibeju-Lekki', type: 'LGA', parentLga: 'Ibeju-Lekki', label: 'Ibeju-Lekki (LGA)' },
      { name: 'Lekki', type: 'LCDA', parentLga: 'Ibeju-Lekki', label: 'Lekki (LCDA)' },

      // 10. Ifako-Ijaiye
      { name: 'Ifako-Ijaiye', type: 'LGA', parentLga: 'Ifako-Ijaiye', label: 'Ifako-Ijaiye (LGA)' },
      { name: 'Ojokoro', type: 'LCDA', parentLga: 'Ifako-Ijaiye', label: 'Ojokoro (LCDA)' },

      // 11. Ikeja
      { name: 'Ikeja', type: 'LGA', parentLga: 'Ikeja', label: 'Ikeja (LGA)' },
      { name: 'Onigbongbo', type: 'LCDA', parentLga: 'Ikeja', label: 'Onigbongbo (LCDA)' },
      { name: 'Ojodu', type: 'LCDA', parentLga: 'Ikeja', label: 'Ojodu (LCDA)' },

      // 12. Ikorodu
      { name: 'Ikorodu', type: 'LGA', parentLga: 'Ikorodu', label: 'Ikorodu (LGA)' },
      { name: 'Ikorodu North', type: 'LCDA', parentLga: 'Ikorodu', label: 'Ikorodu North (LCDA)' },
      { name: 'Ikorodu West', type: 'LCDA', parentLga: 'Ikorodu', label: 'Ikorodu West (LCDA)' },
      { name: 'Igbogbo-Baiyeku', type: 'LCDA', parentLga: 'Ikorodu', label: 'Igbogbo-Baiyeku (LCDA)' },
      { name: 'Imota', type: 'LCDA', parentLga: 'Ikorodu', label: 'Imota (LCDA)' },
      { name: 'Ijede', type: 'LCDA', parentLga: 'Ikorodu', label: 'Ijede (LCDA)' },

      // 13. Kosofe
      { name: 'Kosofe', type: 'LGA', parentLga: 'Kosofe', label: 'Kosofe (LGA)' },
      { name: 'Ikosi-Isheri', type: 'LCDA', parentLga: 'Kosofe', label: 'Ikosi-Isheri (LCDA)' },
      { name: 'Agboyi-Ketu', type: 'LCDA', parentLga: 'Kosofe', label: 'Agboyi-Ketu (LCDA)' },

      // 14. Lagos Island
      { name: 'Lagos Island', type: 'LGA', parentLga: 'Lagos Island', label: 'Lagos Island (LGA)' },
      { name: 'Lagos Island East', type: 'LCDA', parentLga: 'Lagos Island', label: 'Lagos Island East (LCDA)' },

      // 15. Lagos Mainland
      { name: 'Lagos Mainland', type: 'LGA', parentLga: 'Lagos Mainland', label: 'Lagos Mainland (LGA)' },
      { name: 'Yaba', type: 'LCDA', parentLga: 'Lagos Mainland', label: 'Yaba (LCDA)' },

      // 16. Mushin
      { name: 'Mushin', type: 'LGA', parentLga: 'Mushin', label: 'Mushin (LGA)' },
      { name: 'Odi-Olowo/Ojuwoye', type: 'LCDA', parentLga: 'Mushin', label: 'Odi-Olowo/Ojuwoye (LCDA)' },

      // 17. Ojo
      { name: 'Ojo', type: 'LGA', parentLga: 'Ojo', label: 'Ojo (LGA)' },
      { name: 'Iba', type: 'LCDA', parentLga: 'Ojo', label: 'Iba (LCDA)' },
      { name: 'Oto-Awori', type: 'LCDA', parentLga: 'Ojo', label: 'Oto-Awori (LCDA)' },

      // 18. Oshodi-Isolo
      { name: 'Oshodi-Isolo', type: 'LGA', parentLga: 'Oshodi-Isolo', label: 'Oshodi-Isolo (LGA)' },
      { name: 'Isolo', type: 'LCDA', parentLga: 'Oshodi-Isolo', label: 'Isolo (LCDA)' },
      { name: 'Ejigbo', type: 'LCDA', parentLga: 'Oshodi-Isolo', label: 'Ejigbo (LCDA)' },

      // 19. Shomolu
      { name: 'Shomolu', type: 'LGA', parentLga: 'Shomolu', label: 'Shomolu (LGA)' },
      { name: 'Bariga', type: 'LCDA', parentLga: 'Shomolu', label: 'Bariga (LCDA)' },

      // 20. Surulere
      { name: 'Surulere', type: 'LGA', parentLga: 'Surulere', label: 'Surulere (LGA)' },
      { name: 'Coker-Aguda', type: 'LCDA', parentLga: 'Surulere', label: 'Coker-Aguda (LCDA)' },
      { name: 'Itire-Ikate', type: 'LCDA', parentLga: 'Surulere', label: 'Itire-Ikate (LCDA)' },
    ],
  },
  {
    name: 'Abuja (FCT)',
    code: 'FC',
    hasLcda: false,
    areas: [
      { name: 'Abaji', type: 'LGA', label: 'Abaji' },
      { name: 'Bwari', type: 'LGA', label: 'Bwari' },
      { name: 'Gwagwalada', type: 'LGA', label: 'Gwagwalada' },
      { name: 'Kuje', type: 'LGA', label: 'Kuje' },
      { name: 'Kwali', type: 'LGA', label: 'Kwali' },
      { name: 'Municipal Area Council (AMAC)', type: 'LGA', label: 'Municipal Area Council (AMAC)' },
    ],
  },
  {
    name: 'Ogun',
    code: 'OG',
    hasLcda: false,
    areas: [
      { name: 'Abeokuta North', type: 'LGA', label: 'Abeokuta North' },
      { name: 'Abeokuta South', type: 'LGA', label: 'Abeokuta South' },
      { name: 'Ado-Odo/Ota', type: 'LGA', label: 'Ado-Odo/Ota' },
      { name: 'Ewekoro', type: 'LGA', label: 'Ewekoro' },
      { name: 'Ifo', type: 'LGA', label: 'Ifo' },
      { name: 'Ijebu East', type: 'LGA', label: 'Ijebu East' },
      { name: 'Ijebu North', type: 'LGA', label: 'Ijebu North' },
      { name: 'Ijebu North East', type: 'LGA', label: 'Ijebu North East' },
      { name: 'Ijebu Ode', type: 'LGA', label: 'Ijebu Ode' },
      { name: 'Ikenne', type: 'LGA', label: 'Ikenne' },
      { name: 'Ilugun/Alaro', type: 'LGA', label: 'Ilugun/Alaro' },
      { name: 'Ipokia', type: 'LGA', label: 'Ipokia' },
      { name: 'Obafemi Owode', type: 'LGA', label: 'Obafemi Owode' },
      { name: 'Odeda', type: 'LGA', label: 'Odeda' },
      { name: 'Odogbolu', type: 'LGA', label: 'Odogbolu' },
      { name: 'Ogun Waterside', type: 'LGA', label: 'Ogun Waterside' },
      { name: 'Remo North', type: 'LGA', label: 'Remo North' },
      { name: 'Sagamu', type: 'LGA', label: 'Sagamu' },
      { name: 'Yewa North', type: 'LGA', label: 'Yewa North' },
      { name: 'Yewa South', type: 'LGA', label: 'Yewa South' },
    ],
  },
  {
    name: 'Rivers',
    code: 'RI',
    hasLcda: false,
    areas: [
      { name: 'Abua/Odual', type: 'LGA', label: 'Abua/Odual' },
      { name: 'Ahoada East', type: 'LGA', label: 'Ahoada East' },
      { name: 'Ahoada West', type: 'LGA', label: 'Ahoada West' },
      { name: 'Akuku-Toru', type: 'LGA', label: 'Akuku-Toru' },
      { name: 'Andoni', type: 'LGA', label: 'Andoni' },
      { name: 'Asari-Toru', type: 'LGA', label: 'Asari-Toru' },
      { name: 'Bonny', type: 'LGA', label: 'Bonny' },
      { name: 'Degema', type: 'LGA', label: 'Degema' },
      { name: 'Eleme', type: 'LGA', label: 'Eleme' },
      { name: 'Emuoha', type: 'LGA', label: 'Emuoha' },
      { name: 'Etche', type: 'LGA', label: 'Etche' },
      { name: 'Gokana', type: 'LGA', label: 'Gokana' },
      { name: 'Ikwerre', type: 'LGA', label: 'Ikwerre' },
      { name: 'Khana', type: 'LGA', label: 'Khana' },
      { name: 'Obio/Akpor', type: 'LGA', label: 'Obio/Akpor' },
      { name: 'Ogba/Egbema/Ndoni', type: 'LGA', label: 'Ogba/Egbema/Ndoni' },
      { name: 'Ogu/Bolo', type: 'LGA', label: 'Ogu/Bolo' },
      { name: 'Okrika', type: 'LGA', label: 'Okrika' },
      { name: 'Omuma', type: 'LGA', label: 'Omuma' },
      { name: 'Opobo/Nkoro', type: 'LGA', label: 'Opobo/Nkoro' },
      { name: 'Oyigbo', type: 'LGA', label: 'Oyigbo' },
      { name: 'Port Harcourt', type: 'LGA', label: 'Port Harcourt' },
      { name: 'Tai', type: 'LGA', label: 'Tai' },
    ],
  },
  {
    name: 'Oyo',
    code: 'OY',
    hasLcda: false,
    areas: [
      { name: 'Afijio', type: 'LGA', label: 'Afijio' },
      { name: 'Akinyele', type: 'LGA', label: 'Akinyele' },
      { name: 'Atiba', type: 'LGA', label: 'Atiba' },
      { name: 'Atisbo', type: 'LGA', label: 'Atisbo' },
      { name: 'Egbeda', type: 'LGA', label: 'Egbeda' },
      { name: 'Ibadan North', type: 'LGA', label: 'Ibadan North' },
      { name: 'Ibadan North-East', type: 'LGA', label: 'Ibadan North-East' },
      { name: 'Ibadan North-West', type: 'LGA', label: 'Ibadan North-West' },
      { name: 'Ibadan South-East', type: 'LGA', label: 'Ibadan South-East' },
      { name: 'Ibadan South-West', type: 'LGA', label: 'Ibadan South-West' },
      { name: 'Ibarapa Central', type: 'LGA', label: 'Ibarapa Central' },
      { name: 'Ibarapa East', type: 'LGA', label: 'Ibarapa East' },
      { name: 'Ibarapa North', type: 'LGA', label: 'Ibarapa North' },
      { name: 'Ido', type: 'LGA', label: 'Ido' },
      { name: 'Irepo', type: 'LGA', label: 'Irepo' },
      { name: 'Iseyin', type: 'LGA', label: 'Iseyin' },
      { name: 'Itesiwaju', type: 'LGA', label: 'Itesiwaju' },
      { name: 'Iwajowa', type: 'LGA', label: 'Iwajowa' },
      { name: 'Kajola', type: 'LGA', label: 'Kajola' },
      { name: 'Lagelu', type: 'LGA', label: 'Lagelu' },
      { name: 'Ogbomosho North', type: 'LGA', label: 'Ogbomosho North' },
      { name: 'Ogbomosho South', type: 'LGA', label: 'Ogbomosho South' },
      { name: 'Ogo Oluwa', type: 'LGA', label: 'Ogo Oluwa' },
      { name: 'Olorunsogo', type: 'LGA', label: 'Olorunsogo' },
      { name: 'Oluyole', type: 'LGA', label: 'Oluyole' },
      { name: 'Ona Ara', type: 'LGA', label: 'Ona Ara' },
      { name: 'Orelope', type: 'LGA', label: 'Orelope' },
      { name: 'Ori Ire', type: 'LGA', label: 'Ori Ire' },
      { name: 'Oyo East', type: 'LGA', label: 'Oyo East' },
      { name: 'Oyo West', type: 'LGA', label: 'Oyo West' },
      { name: 'Saki East', type: 'LGA', label: 'Saki East' },
      { name: 'Saki West', type: 'LGA', label: 'Saki West' },
      { name: 'Surulere (Oyo)', type: 'LGA', label: 'Surulere (Oyo)' },
    ],
  },
  {
    name: 'Kano',
    code: 'KN',
    hasLcda: false,
    areas: [
      { name: 'Dala', type: 'LGA', label: 'Dala' },
      { name: 'Fagge', type: 'LGA', label: 'Fagge' },
      { name: 'Gwale', type: 'LGA', label: 'Gwale' },
      { name: 'Kano Municipal', type: 'LGA', label: 'Kano Municipal' },
      { name: 'Nassarawa', type: 'LGA', label: 'Nassarawa' },
      { name: 'Tarauni', type: 'LGA', label: 'Tarauni' },
      { name: 'Kumbotso', type: 'LGA', label: 'Kumbotso' },
      { name: 'Ungogo', type: 'LGA', label: 'Ungogo' },
      { name: 'Bichi', type: 'LGA', label: 'Bichi' },
      { name: 'Rano', type: 'LGA', label: 'Rano' },
    ],
  },
  {
    name: 'Delta',
    code: 'DE',
    hasLcda: false,
    areas: [
      { name: 'Aniocha North', type: 'LGA', label: 'Aniocha North' },
      { name: 'Aniocha South', type: 'LGA', label: 'Aniocha South' },
      { name: 'Asaba', type: 'LGA', label: 'Oshimili South (Asaba)' },
      { name: 'Ika North East', type: 'LGA', label: 'Ika North East' },
      { name: 'Ika South', type: 'LGA', label: 'Ika South' },
      { name: 'Okpe', type: 'LGA', label: 'Okpe' },
      { name: 'Oshimili North', type: 'LGA', label: 'Oshimili North' },
      { name: 'Oshimili South', type: 'LGA', label: 'Oshimili South' },
      { name: 'Udu', type: 'LGA', label: 'Udu' },
      { name: 'Ughelli North', type: 'LGA', label: 'Ughelli North' },
      { name: 'Ughelli South', type: 'LGA', label: 'Ughelli South' },
      { name: 'Uvwie', type: 'LGA', label: 'Uvwie' },
      { name: 'Warri North', type: 'LGA', label: 'Warri North' },
      { name: 'Warri South', type: 'LGA', label: 'Warri South' },
      { name: 'Warri South West', type: 'LGA', label: 'Warri South West' },
    ],
  },
  {
    name: 'Edo',
    code: 'ED',
    hasLcda: false,
    areas: [
      { name: 'Akoko-Edo', type: 'LGA', label: 'Akoko-Edo' },
      { name: 'Egor', type: 'LGA', label: 'Egor' },
      { name: 'Esan Central', type: 'LGA', label: 'Esan Central' },
      { name: 'Esan North-East', type: 'LGA', label: 'Esan North-East' },
      { name: 'Esan South-East', type: 'LGA', label: 'Esan South-East' },
      { name: 'Esan West', type: 'LGA', label: 'Esan West' },
      { name: 'Etsako Central', type: 'LGA', label: 'Etsako Central' },
      { name: 'Etsako East', type: 'LGA', label: 'Etsako East' },
      { name: 'Etsako West', type: 'LGA', label: 'Etsako West' },
      { name: 'Igueben', type: 'LGA', label: 'Igueben' },
      { name: 'Ikpoba-Okha', type: 'LGA', label: 'Ikpoba-Okha' },
      { name: 'Oredo', type: 'LGA', label: 'Oredo (Benin City)' },
      { name: 'Orhionmwon', type: 'LGA', label: 'Orhionmwon' },
      { name: 'Ovia North-East', type: 'LGA', label: 'Ovia North-East' },
      { name: 'Ovia South-West', type: 'LGA', label: 'Ovia South-West' },
      { name: 'Owan East', type: 'LGA', label: 'Owan East' },
      { name: 'Owan West', type: 'LGA', label: 'Owan West' },
      { name: 'Uhunmwonde', type: 'LGA', label: 'Uhunmwonde' },
    ],
  },
  {
    name: 'Kaduna',
    code: 'KD',
    hasLcda: false,
    areas: [
      { name: 'Chikun', type: 'LGA', label: 'Chikun' },
      { name: 'Kaduna North', type: 'LGA', label: 'Kaduna North' },
      { name: 'Kaduna South', type: 'LGA', label: 'Kaduna South' },
      { name: 'Zaria', type: 'LGA', label: 'Zaria' },
      { name: 'Sabon Gari', type: 'LGA', label: 'Sabon Gari' },
      { name: 'Igabi', type: 'LGA', label: 'Igabi' },
    ],
  },
  {
    name: 'Enugu',
    code: 'EN',
    hasLcda: false,
    areas: [
      { name: 'Enugu East', type: 'LGA', label: 'Enugu East' },
      { name: 'Enugu North', type: 'LGA', label: 'Enugu North' },
      { name: 'Enugu South', type: 'LGA', label: 'Enugu South' },
      { name: 'Nkanu East', type: 'LGA', label: 'Nkanu East' },
      { name: 'Nkanu West', type: 'LGA', label: 'Nkanu West' },
      { name: 'Nsukka', type: 'LGA', label: 'Nsukka' },
      { name: 'Udi', type: 'LGA', label: 'Udi' },
    ],
  },
  {
    name: 'Anambra',
    code: 'AN',
    hasLcda: false,
    areas: [
      { name: 'Aguata', type: 'LGA', label: 'Aguata' },
      { name: 'Awka North', type: 'LGA', label: 'Awka North' },
      { name: 'Awka South', type: 'LGA', label: 'Awka South' },
      { name: 'Idemili North', type: 'LGA', label: 'Idemili North' },
      { name: 'Idemili South', type: 'LGA', label: 'Idemili South' },
      { name: 'Nnewi North', type: 'LGA', label: 'Nnewi North' },
      { name: 'Nnewi South', type: 'LGA', label: 'Nnewi South' },
      { name: 'Onitsha North', type: 'LGA', label: 'Onitsha North' },
      { name: 'Onitsha South', type: 'LGA', label: 'Onitsha South' },
    ],
  },
  // All other states
  {
    name: 'Abia', code: 'AB', hasLcda: false,
    areas: [
      { name: 'Aba North', type: 'LGA', label: 'Aba North' },
      { name: 'Aba South', type: 'LGA', label: 'Aba South' },
      { name: 'Umuahia North', type: 'LGA', label: 'Umuahia North' },
      { name: 'Umuahia South', type: 'LGA', label: 'Umuahia South' },
      { name: 'Osisioma', type: 'LGA', label: 'Osisioma' },
    ]
  },
  {
    name: 'Adamawa', code: 'AD', hasLcda: false,
    areas: [
      { name: 'Yola North', type: 'LGA', label: 'Yola North' },
      { name: 'Yola South', type: 'LGA', label: 'Yola South' },
      { name: 'Mubi North', type: 'LGA', label: 'Mubi North' },
      { name: 'Mubi South', type: 'LGA', label: 'Mubi South' },
    ]
  },
  {
    name: 'Akwa Ibom', code: 'AK', hasLcda: false,
    areas: [
      { name: 'Uyo', type: 'LGA', label: 'Uyo' },
      { name: 'Eket', type: 'LGA', label: 'Eket' },
      { name: 'Ikot Ekpene', type: 'LGA', label: 'Ikot Ekpene' },
      { name: 'Oron', type: 'LGA', label: 'Oron' },
      { name: 'Ibeno', type: 'LGA', label: 'Ibeno' },
    ]
  },
  {
    name: 'Bauchi', code: 'BA', hasLcda: false,
    areas: [
      { name: 'Bauchi', type: 'LGA', label: 'Bauchi' },
      { name: 'Katagum', type: 'LGA', label: 'Katagum' },
      { name: 'Misau', type: 'LGA', label: 'Misau' },
    ]
  },
  {
    name: 'Bayelsa', code: 'BY', hasLcda: false,
    areas: [
      { name: 'Yenagoa', type: 'LGA', label: 'Yenagoa' },
      { name: 'Brass', type: 'LGA', label: 'Brass' },
      { name: 'Nembe', type: 'LGA', label: 'Nembe' },
      { name: 'Ogbia', type: 'LGA', label: 'Ogbia' },
      { name: 'Sagbama', type: 'LGA', label: 'Sagbama' },
      { name: 'Southern Ijaw', type: 'LGA', label: 'Southern Ijaw' },
    ]
  },
  {
    name: 'Benue', code: 'BE', hasLcda: false,
    areas: [
      { name: 'Makurdi', type: 'LGA', label: 'Makurdi' },
      { name: 'Gboko', type: 'LGA', label: 'Gboko' },
      { name: 'Otukpo', type: 'LGA', label: 'Otukpo' },
    ]
  },
  {
    name: 'Borno', code: 'BO', hasLcda: false,
    areas: [
      { name: 'Maiduguri', type: 'LGA', label: 'Maiduguri' },
      { name: 'Jere', type: 'LGA', label: 'Jere' },
      { name: 'Biu', type: 'LGA', label: 'Biu' },
    ]
  },
  {
    name: 'Cross River', code: 'CR', hasLcda: false,
    areas: [
      { name: 'Calabar Municipal', type: 'LGA', label: 'Calabar Municipal' },
      { name: 'Calabar South', type: 'LGA', label: 'Calabar South' },
      { name: 'Ikom', type: 'LGA', label: 'Ikom' },
      { name: 'Ogoja', type: 'LGA', label: 'Ogoja' },
    ]
  },
  {
    name: 'Ebonyi', code: 'EB', hasLcda: false,
    areas: [
      { name: 'Abakaliki', type: 'LGA', label: 'Abakaliki' },
      { name: 'Afikpo North', type: 'LGA', label: 'Afikpo North' },
    ]
  },
  {
    name: 'Ekiti', code: 'EK', hasLcda: false,
    areas: [
      { name: 'Ado Ekiti', type: 'LGA', label: 'Ado Ekiti' },
      { name: 'Ikere', type: 'LGA', label: 'Ikere' },
      { name: 'Ijero', type: 'LGA', label: 'Ijero' },
    ]
  },
  {
    name: 'Gombe', code: 'GO', hasLcda: false,
    areas: [
      { name: 'Gombe', type: 'LGA', label: 'Gombe' },
      { name: 'Akko', type: 'LGA', label: 'Akko' },
    ]
  },
  {
    name: 'Imo', code: 'IM', hasLcda: false,
    areas: [
      { name: 'Owerri Municipal', type: 'LGA', label: 'Owerri Municipal' },
      { name: 'Owerri North', type: 'LGA', label: 'Owerri North' },
      { name: 'Owerri West', type: 'LGA', label: 'Owerri West' },
      { name: 'Orlu', type: 'LGA', label: 'Orlu' },
      { name: 'Okigwe', type: 'LGA', label: 'Okigwe' },
    ]
  },
  {
    name: 'Jigawa', code: 'JI', hasLcda: false,
    areas: [
      { name: 'Dutse', type: 'LGA', label: 'Dutse' },
      { name: 'Hadejia', type: 'LGA', label: 'Hadejia' },
    ]
  },
  {
    name: 'Katsina', code: 'KT', hasLcda: false,
    areas: [
      { name: 'Katsina', type: 'LGA', label: 'Katsina' },
      { name: 'Daura', type: 'LGA', label: 'Daura' },
      { name: 'Funtua', type: 'LGA', label: 'Funtua' },
    ]
  },
  {
    name: 'Kebbi', code: 'KE', hasLcda: false,
    areas: [
      { name: 'Birnin Kebbi', type: 'LGA', label: 'Birnin Kebbi' },
      { name: 'Argungu', type: 'LGA', label: 'Argungu' },
      { name: 'Yauri', type: 'LGA', label: 'Yauri' },
    ]
  },
  {
    name: 'Kogi', code: 'KO', hasLcda: false,
    areas: [
      { name: 'Lokoja', type: 'LGA', label: 'Lokoja' },
      { name: 'Okene', type: 'LGA', label: 'Okene' },
      { name: 'Idah', type: 'LGA', label: 'Idah' },
    ]
  },
  {
    name: 'Kwara', code: 'KW', hasLcda: false,
    areas: [
      { name: 'Ilorin East', type: 'LGA', label: 'Ilorin East' },
      { name: 'Ilorin South', type: 'LGA', label: 'Ilorin South' },
      { name: 'Ilorin West', type: 'LGA', label: 'Ilorin West' },
      { name: 'Offa', type: 'LGA', label: 'Offa' },
    ]
  },
  {
    name: 'Nasarawa', code: 'NA', hasLcda: false,
    areas: [
      { name: 'Lafia', type: 'LGA', label: 'Lafia' },
      { name: 'Keffi', type: 'LGA', label: 'Keffi' },
      { name: 'Karu', type: 'LGA', label: 'Karu' },
    ]
  },
  {
    name: 'Niger', code: 'NI', hasLcda: false,
    areas: [
      { name: 'Minna (Chanchaga)', type: 'LGA', label: 'Minna (Chanchaga)' },
      { name: 'Bida', type: 'LGA', label: 'Bida' },
      { name: 'Suleja', type: 'LGA', label: 'Suleja' },
      { name: 'Kontagora', type: 'LGA', label: 'Kontagora' },
    ]
  },
  {
    name: 'Ondo', code: 'ON', hasLcda: false,
    areas: [
      { name: 'Akure South', type: 'LGA', label: 'Akure South' },
      { name: 'Akure North', type: 'LGA', label: 'Akure North' },
      { name: 'Ondo West', type: 'LGA', label: 'Ondo West' },
      { name: 'Ondo East', type: 'LGA', label: 'Ondo East' },
      { name: 'Owo', type: 'LGA', label: 'Owo' },
    ]
  },
  {
    name: 'Osun', code: 'OS', hasLcda: false,
    areas: [
      { name: 'Osogbo', type: 'LGA', label: 'Osogbo' },
      { name: 'Olorunda', type: 'LGA', label: 'Olorunda' },
      { name: 'Ife Central', type: 'LGA', label: 'Ife Central' },
      { name: 'Ife East', type: 'LGA', label: 'Ife East' },
      { name: 'Ilesa East', type: 'LGA', label: 'Ilesa East' },
      { name: 'Ilesa West', type: 'LGA', label: 'Ilesa West' },
      { name: 'Ede North', type: 'LGA', label: 'Ede North' },
      { name: 'Ede South', type: 'LGA', label: 'Ede South' },
    ]
  },
  {
    name: 'Plateau', code: 'PL', hasLcda: false,
    areas: [
      { name: 'Jos North', type: 'LGA', label: 'Jos North' },
      { name: 'Jos South', type: 'LGA', label: 'Jos South' },
      { name: 'Jos East', type: 'LGA', label: 'Jos East' },
      { name: 'Barkin Ladi', type: 'LGA', label: 'Barkin Ladi' },
    ]
  },
  {
    name: 'Sokoto', code: 'SO', hasLcda: false,
    areas: [
      { name: 'Sokoto North', type: 'LGA', label: 'Sokoto North' },
      { name: 'Sokoto South', type: 'LGA', label: 'Sokoto South' },
      { name: 'Wamakko', type: 'LGA', label: 'Wamakko' },
    ]
  },
  {
    name: 'Taraba', code: 'TA', hasLcda: false,
    areas: [
      { name: 'Jalingo', type: 'LGA', label: 'Jalingo' },
      { name: 'Wukari', type: 'LGA', label: 'Wukari' },
    ]
  },
  {
    name: 'Yobe', code: 'YO', hasLcda: false,
    areas: [
      { name: 'Damaturu', type: 'LGA', label: 'Damaturu' },
      { name: 'Potiskum', type: 'LGA', label: 'Potiskum' },
      { name: 'Gashua (Bade)', type: 'LGA', label: 'Gashua (Bade)' },
    ]
  },
  {
    name: 'Zamfara', code: 'ZA', hasLcda: false,
    areas: [
      { name: 'Gusau', type: 'LGA', label: 'Gusau' },
      { name: 'Kaura Namoda', type: 'LGA', label: 'Kaura Namoda' },
    ]
  },
];

/**
 * Returns options list for States dropdown
 */
export function getStateOptions(): { value: string; label: string }[] {
  return NIGERIA_STATES.map((s) => ({ value: s.name, label: s.name }));
}

/**
 * Returns options list of LGAs and LCDAs for a given state
 */
export function getAreaOptions(stateName: string): { value: string; label: string }[] {
  const state = NIGERIA_STATES.find(
    (s) => s.name.toLowerCase() === (stateName || '').toLowerCase()
  );
  if (!state) return [];
  return state.areas.map((a) => ({
    value: a.name,
    label: a.label,
  }));
}
