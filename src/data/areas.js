// Fixed campus location list for UniFind — used for both the Post form's
// "Area" dropdown and the Feed's Location filter, so location values stay
// consistent (no near-duplicate free-text entries) and the filter list
// never grows unbounded as more items get posted.

export const areaGroups = [
  {
    label: 'Fakulti',
    options: [
      'Fakulti Perubatan (Kampus Cheras)',
      'Fakulti Pergigian',
      'Fakulti Farmasi',
      'Fakulti Sains Kesihatan',
      'Fakulti Kejuruteraan dan Alam Bina (FKAB)',
      'Fakulti Sains dan Teknologi (FST)',
      'Fakulti Teknologi dan Sains Maklumat (FTSM)',
      'Fakulti Ekonomi dan Pengurusan (FEP)',
      'Fakulti Undang-Undang (FUU)',
      'Fakulti Sains Sosial dan Kemanusiaan (FSSK)',
      'Fakulti Pendidikan',
      'Fakulti Pengajian Islam (FPI)',
      'Fakulti Pengajian Sains Citra',
    ],
  },
  {
    label: 'Kolej Kediaman',
    options: [
      "Kolej Dato' Onn",
      'Kolej Aminuddin Baki',
      'Kolej Ungku Omar',
      'Kolej Burhanuddin Helmi',
      'Kolej Ibrahim Yaakub',
      'Kolej Rahim Kajai',
      'Kolej Ibu Zain',
      'Kolej Keris Mas',
      "Kolej Pendeta Za'ba",
      'Kolej Tun Hussein Onn',
      'Kolej Tun Syed Nasir',
      'Kolej Tun Dr. Ismail',
    ],
  },
  {
    label: 'Kemudahan Lain',
    options: [
      'Masjid UKM',
      'Pusanika',
      'Canselori',
      'Stadium UKM',
      'Perpustakaan Tun Sri Lanang (PTSL)',
      'Pusat Kesihatan Universiti (PKU)',
      'Dewan Canselor Tun Abdul Razak (DECTAR)',
      'Panggung Seni',
      'Other',
    ],
  },
]

// Flat list — handy for anything that just needs every value at once
// (e.g. validating a stored location still matches a known area).
export const areas = areaGroups.flatMap((group) => group.options)