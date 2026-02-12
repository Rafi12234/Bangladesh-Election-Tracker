// Bangladesh administrative divisions and districts data
// This provides the hierarchical structure for admin selectors

export interface DivisionData {
  id: string;
  name: string;
  bnName: string;
  districts: DistrictData[];
}

export interface DistrictData {
  id: string;
  name: string;
  bnName: string;
  constituencies: number[]; // Constituency numbers
}

export const divisions: DivisionData[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    bnName: 'ঢাকা',
    districts: [
      { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', constituencies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
      { id: 'gazipur', name: 'Gazipur', bnName: 'গাজীপুর', constituencies: [1, 2, 3, 4, 5] },
      { id: 'narayanganj', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', constituencies: [1, 2, 3, 4, 5] },
      { id: 'tangail', name: 'Tangail', bnName: 'টাঙ্গাইল', constituencies: [1, 2, 3, 4, 5, 6, 7, 8] },
      { id: 'kishoreganj', name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'manikganj', name: 'Manikganj', bnName: 'মানিকগঞ্জ', constituencies: [1, 2, 3] },
      { id: 'munshiganj', name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', constituencies: [1, 2, 3] },
      { id: 'narsingdi', name: 'Narsingdi', bnName: 'নরসিংদী', constituencies: [1, 2, 3, 4, 5] },
      { id: 'faridpur', name: 'Faridpur', bnName: 'ফরিদপুর', constituencies: [1, 2, 3, 4] },
      { id: 'gopalganj', name: 'Gopalganj', bnName: 'গোপালগঞ্জ', constituencies: [1, 2, 3] },
      { id: 'madaripur', name: 'Madaripur', bnName: 'মাদারীপুর', constituencies: [1, 2] },
      { id: 'rajbari', name: 'Rajbari', bnName: 'রাজবাড়ী', constituencies: [1, 2] },
      { id: 'shariatpur', name: 'Shariatpur', bnName: 'শরীয়তপুর', constituencies: [1, 2, 3] },
    ],
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    districts: [
      { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', constituencies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
      { id: 'coxs-bazar', name: "Cox's Bazar", bnName: 'কক্সবাজার', constituencies: [1, 2, 3, 4] },
      { id: 'comilla', name: 'Comilla', bnName: 'কুমিল্লা', constituencies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
      { id: 'feni', name: 'Feni', bnName: 'ফেনী', constituencies: [1, 2, 3] },
      { id: 'brahmanbaria', name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'chandpur', name: 'Chandpur', bnName: 'চাঁদপুর', constituencies: [1, 2, 3, 4, 5] },
      { id: 'lakshmipur', name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', constituencies: [1, 2, 3, 4] },
      { id: 'noakhali', name: 'Noakhali', bnName: 'নোয়াখালী', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'rangamati', name: 'Rangamati', bnName: 'রাঙ্গামাটি', constituencies: [1] },
      { id: 'bandarban', name: 'Bandarban', bnName: 'বান্দরবান', constituencies: [1] },
      { id: 'khagrachhari', name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', constituencies: [1] },
    ],
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    districts: [
      { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'bogra', name: 'Bogra', bnName: 'বগুড়া', constituencies: [1, 2, 3, 4, 5, 6, 7] },
      { id: 'pabna', name: 'Pabna', bnName: 'পাবনা', constituencies: [1, 2, 3, 4, 5] },
      { id: 'natore', name: 'Natore', bnName: 'নাটোর', constituencies: [1, 2, 3] },
      { id: 'naogaon', name: 'Naogaon', bnName: 'নওগাঁ', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'nawabganj', name: 'Nawabganj', bnName: 'নবাবগঞ্জ', constituencies: [1, 2, 3] },
      { id: 'sirajganj', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'joypurhat', name: 'Joypurhat', bnName: 'জয়পুরহাট', constituencies: [1, 2] },
    ],
  },
  {
    id: 'khulna',
    name: 'Khulna',
    bnName: 'খুলনা',
    districts: [
      { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'jessore', name: 'Jessore', bnName: 'যশোর', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'satkhira', name: 'Satkhira', bnName: 'সাতক্ষীরা', constituencies: [1, 2, 3, 4] },
      { id: 'bagerhat', name: 'Bagerhat', bnName: 'বাগেরহাট', constituencies: [1, 2, 3, 4] },
      { id: 'jhenaidah', name: 'Jhenaidah', bnName: 'ঝিনাইদহ', constituencies: [1, 2, 3, 4] },
      { id: 'magura', name: 'Magura', bnName: 'মাগুরা', constituencies: [1, 2] },
      { id: 'narail', name: 'Narail', bnName: 'নড়াইল', constituencies: [1, 2] },
      { id: 'kushtia', name: 'Kushtia', bnName: 'কুষ্টিয়া', constituencies: [1, 2, 3, 4] },
      { id: 'chuadanga', name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', constituencies: [1, 2] },
      { id: 'meherpur', name: 'Meherpur', bnName: 'মেহেরপুর', constituencies: [1, 2] },
    ],
  },
  {
    id: 'barishal',
    name: 'Barishal',
    bnName: 'বরিশাল',
    districts: [
      { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'patuakhali', name: 'Patuakhali', bnName: 'পটুয়াখালী', constituencies: [1, 2, 3, 4] },
      { id: 'bhola', name: 'Bhola', bnName: 'ভোলা', constituencies: [1, 2, 3, 4] },
      { id: 'pirojpur', name: 'Pirojpur', bnName: 'পিরোজপুর', constituencies: [1, 2, 3] },
      { id: 'jhalokathi', name: 'Jhalokathi', bnName: 'ঝালকাঠি', constituencies: [1, 2] },
      { id: 'barguna', name: 'Barguna', bnName: 'বরগুনা', constituencies: [1, 2] },
    ],
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    bnName: 'সিলেট',
    districts: [
      { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'moulvibazar', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', constituencies: [1, 2, 3, 4] },
      { id: 'habiganj', name: 'Habiganj', bnName: 'হবিগঞ্জ', constituencies: [1, 2, 3, 4] },
      { id: 'sunamganj', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', constituencies: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    bnName: 'রংপুর',
    districts: [
      { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'dinajpur', name: 'Dinajpur', bnName: 'দিনাজপুর', constituencies: [1, 2, 3, 4, 5, 6] },
      { id: 'kurigram', name: 'Kurigram', bnName: 'কুড়িগ্রাম', constituencies: [1, 2, 3, 4] },
      { id: 'gaibandha', name: 'Gaibandha', bnName: 'গাইবান্ধা', constituencies: [1, 2, 3, 4, 5] },
      { id: 'nilphamari', name: 'Nilphamari', bnName: 'নীলফামারী', constituencies: [1, 2, 3, 4] },
      { id: 'lalmonirhat', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', constituencies: [1, 2, 3] },
      { id: 'thakurgaon', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', constituencies: [1, 2, 3] },
      { id: 'panchagarh', name: 'Panchagarh', bnName: 'পঞ্চগড়', constituencies: [1, 2] },
    ],
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    districts: [
      { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', constituencies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
      { id: 'jamalpur', name: 'Jamalpur', bnName: 'জামালপুর', constituencies: [1, 2, 3, 4, 5] },
      { id: 'netrokona', name: 'Netrokona', bnName: 'নেত্রকোণা', constituencies: [1, 2, 3, 4, 5] },
      { id: 'sherpur', name: 'Sherpur', bnName: 'শেরপুর', constituencies: [1, 2, 3] },
    ],
  },
];

// Generate unique constituency ID
export function getConstituencyId(districtId: string, number: number): string {
  return `${districtId}-${number}`;
}

// Get constituency name from ID
export function getConstituencyName(districtId: string, number: number): string {
  const district = divisions
    .flatMap(d => d.districts)
    .find(d => d.id === districtId);
  
  if (district) {
    return `${district.name}-${number}`;
  }
  return `Unknown-${number}`;
}

// Total number of constituencies (approximately 300)
export const TOTAL_SEATS = 300;
export const MAJORITY_SEATS = 151;
