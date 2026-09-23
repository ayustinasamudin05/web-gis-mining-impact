// DASHBOARD.JS
// Sistem Informasi Geografis Area Rawan Dampak Pertambangan
// Kabupaten Konawe Selatan

// 1. ELEMENT HTML

const toggle = document.getElementById("themeToggle");  // Tombol toggle tema gelap/terang
const chkSlope = document.getElementById("chkSlope"); // Checkbox Kemiringan Lereng
const chkRain = document.getElementById("chkRain"); // Checkbox Curah Hujan
const chkLandcover = document.getElementById("chkLandcover");// Checkbox Tutupan Lahan
const chkRF = document.getElementById("chkRF"); // Checkbox Random Forest
const chkCompany = document.getElementById("chkCompany"); // Checkbox Area Perusahaan
const chkBoundaryKab = document.getElementById("chkBoundaryKab"); // Checkbox Batas Kabupaten
const chkBoundaryKec = document.getElementById("chkBoundaryKec"); // Checkbox Batas Kecamatan
const searchInput = document.querySelector(".map-search input") || document.querySelector(".search input"); // Input pencarian desa
const searchBtn = document.getElementById("searchBtn"); // Tombol pencarian desa
const companySelect = document.getElementById("companySelect");// Dropdown perusahaan
const focusMineBtn = document.getElementById("focusMineBtn"); // Tombol fokus ke area perusahaan
const resetMapBtn = document.getElementById("resetMapBtn"); // Tombol reset peta
const mainOpacityRange = document.getElementById("mainOpacityRange");  // Slider opacity layer klasifikasi
const rfOpacityRange = document.getElementById("rfOpacityRange"); // Slider opacity layer Random Forest
const opacityValue = document.getElementById("opacityValue"); // Nilai opacity saat ini
const osmBtn = document.getElementById("osmBtn"); // Tombol peta OpenStreetMap
const satelliteBtn = document.getElementById("satelliteBtn"); // Tombol peta Satelit
const closeInfoBtn = document.getElementById("closeInfoBtn"); // Tombol tutup panel informasi
const zoomLocationBtn = document.getElementById("zoomLocationBtn"); // Tombol zoom ke lokasi terakhir
const accuracyText = document.getElementById("accuracyText"); // Teks akurasi model
const accuracyBadge = document.getElementById("accuracyBadge"); // Badge akurasi model
const statusText = document.getElementById("statusText");   // Teks status kerawanan
const villageText = document.getElementById("villageText"); // Teks nama desa
const factorText = document.getElementById("factorText"); // Teks faktor dominan
const adviceText = document.getElementById("adviceText"); // Teks imbauan
const statusCard = document.getElementById("statusCard"); // Card status kerawanan
const factorCard = document.getElementById("factorCard"); // Card faktor dominan
const adviceCard = document.getElementById("adviceCard"); // Card imbauan
const detailLatLon = document.getElementById("detailLatLon"); // Teks koordinat lokasi
const detailStatus = document.getElementById("detailStatus"); // Teks status kerawanan
const detailSlope = document.getElementById("detailSlope"); // Teks nilai kemiringan lereng
const detailRain = document.getElementById("detailRain"); // Teks nilai curah hujan
const detailLandcover = document.getElementById("detailLandcover"); // Teks nilai tutupan lahan
const detailScore = document.getElementById("detailScore"); // Teks skor kerawanan
const detailDesc = document.getElementById("detailDesc"); // Teks deskripsi kerawanan
const modelAccuracyCircle = document.getElementById("modelAccuracyCircle"); // Lingkaran akurasi model
const modelAccuracyText = document.getElementById("modelAccuracyText"); // Teks nilai akurasi model
const accuracyLine = document.getElementById("accuracyLine"); // Garis akurasi model
const kappaLine = document.getElementById("kappaLine"); //  Garis kappa model
const precisionLine = document.getElementById("precisionLine"); // Garis precision model
const recallLine = document.getElementById("recallLine"); // Garis recall model
const f1Line = document.getElementById("f1Line"); // Garis F1 score model
const accuracyModelLine = document.getElementById("accuracyModelLine"); // Garis akurasi model
const accuracyNoteLine = document.getElementById("accuracyNoteLine"); // Teks catatan akurasi model
const barSlope = document.getElementById("barSlope"); // Bar kemiringan lereng
const barRain = document.getElementById("barRain"); // Bar curah hujan
const barLandcover = document.getElementById("barLandcover"); // Bar tutupan lahan
const barSlopeText = document.getElementById("barSlopeText"); // Teks nilai kemiringan lereng
const barRainText = document.getElementById("barRainText"); // Teks nilai curah hujan
const barLandcoverText = document.getElementById("barLandcoverText"); // Teks nilai tutupan lahan
const riskDonut = document.getElementById("riskDonut"); // Donut chart kerawanan
const statSafe = document.getElementById("statSafe"); // Teks area aman
const statMedium = document.getElementById("statMedium");   // Teks area rawan sedang
const statHigh = document.getElementById("statHigh"); // Teks area rawan tinggi
const statSafeArea = document.getElementById("statSafeArea"); // Teks luas area aman
const statMediumArea = document.getElementById("statMediumArea"); // Teks luas area rawan sedang
const statHighArea = document.getElementById("statHighArea"); // Teks luas area rawan tinggi
const statLow = document.getElementById("statLow"); // Teks area sangat aman
const statVeryHigh = document.getElementById("statVeryHigh"); // Teks area sangat tinggi
const totalAreaText = document.getElementById("totalAreaText"); // Teks total luas area


// 2. TEMA PUTIH

function loadTheme() {  // Fungsi untuk memuat tema dari localStorage
  localStorage.setItem("theme", "light");
  document.body.classList.remove("dark");
  if (toggle) { // Jika tombol toggle ada, setel teksnya ke ikon bulan
    toggle.textContent = "🌙";
  }
}

loadTheme(); // Panggil fungsi loadTheme saat halaman dimuat untuk memastikan tema diterapkan

toggle?.addEventListener("click", () => { // Event listener untuk tombol toggle tema
  localStorage.setItem("theme", "light"); // Setel tema ke "light" saat tombol diklik
  document.body.classList.remove("dark"); // Hapus kelas "dark" dari body untuk menerapkan tema terang
  toggle.textContent = "🌙"; // Ubah teks tombol ke ikon bulan
}); // Event listener untuk tombol toggle tema


// 2. VARIABEL MAP

let map = null; // Variabel global untuk objek peta Leaflet
let osmBaseLayer = null;  // Variabel global untuk layer dasar OpenStreetMap
let satelliteBaseLayer = null; // Variabel global untuk layer dasar Satelit
let lastFocusedLatLng = null; // Variabel global untuk menyimpan koordinat terakhir yang difokuskan
let slopeLayer = null; // Variabel global untuk layer kemiringan lereng
let rainLayer = null; // Variabel global untuk layer curah hujan
let landcoverLayer = null; // Variabel global untuk layer tutupan lahan
let slopeRainLayer = null;  // Variabel global untuk layer gabungan kemiringan lereng dan curah hujan
let slopeLandcoverLayer = null;   // Variabel global untuk layer gabungan kemiringan lereng dan tutupan lahan
let rainLandcoverLayer = null; // Variabel global untuk layer gabungan curah hujan dan tutupan lahan
let rfLayer = null; // Variabel global untuk layer Random Forest
let hotspotLayer = null;  // Variabel global untuk layer hotspot area perusahaan
let villageMarkerLayer = null;  // Variabel global untuk layer marker desa
let boundaryKabLayer = null;  // Variabel global untuk layer batas kabupaten
let boundaryKecLayer = null;  // Variabel global untuk layer batas kecamatan
let boundaryLabelLayer = null;  // Variabel global untuk layer label batas kabupaten

// 3. TITIK TENGAH AREA PENELITIAN

const defaultCenter = [-4.4078, 122.3755]; // Titik tengah area penelitian (Lalowua, Konawe Selatan)
const defaultZoom = 12; // Zoom default saat peta dimuat

// Backend API Node.js untuk membaca nilai titik dari Google Earth Engine.
// Pastikan server.js sudah berjalan dengan perintah: npm start

const GEE_API_BASE_URL = "http://localhost:3000"; // URL dasar untuk API Google Earth Engine

// 4. BATAS AREA PENELITIAN

const hazardBoundsCoords = [  // Koordinat batas area penelitian (Lalowua, Konawe Selatan)
  [-4.4300, 122.3500],
  [-4.3800, 122.4000]
];

// Layer batas dibuat agar checkbox Batas Kabupaten dan Batas Kecamatan aktif.
// Koordinat berikut adalah batas sederhana untuk kebutuhan tampilan Web GIS.
// Jika sudah memiliki data resmi SHP/GeoJSON, ganti koordinat ini dengan data batas administrasi resmi.
const kabupatenBoundaryGeoJson = {  // GeoJSON sederhana untuk batas Kabupaten Konawe Selatan
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Kabupaten Konawe Selatan" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [122.318, -4.430],
          [122.340, -4.382],
          [122.382, -4.350],
          [122.435, -4.360],
          [122.476, -4.392],
          [122.468, -4.444],
          [122.415, -4.472],
          [122.355, -4.462],
          [122.318, -4.430]
        ]]
      }
    }
  ]
};  //

const kecamatanBoundaryGeoJson = {  // GeoJSON sederhana untuk batas Kecamatan di Kabupaten Konawe Selatan
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Barat" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.335, -4.455],
          [122.365, -4.420],
          [122.390, -4.382],
          [122.407, -4.355]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Tengah" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.365, -4.462],
          [122.397, -4.430],
          [122.430, -4.392],
          [122.452, -4.365]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Timur" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.405, -4.470],
          [122.425, -4.438],
          [122.448, -4.405],
          [122.468, -4.383]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Batas Kecamatan Bagian Selatan" },
      geometry: {
        type: "LineString",
        coordinates: [
          [122.332, -4.420],
          [122.375, -4.412],
          [122.425, -4.420],
          [122.465, -4.408]
        ]
      }
    }
  ]
}; // GeoJSON sederhana untuk batas Kecamatan di Kabupaten Konawe Selatan

// 5. DATA HOTSPOT AREA TAMBANG / PERUSAHAAN
// Popup perusahaan hanya menampilkan:
// 1. Nama perusahaan
// 2. Jenis lokasi
// 3. Titik koordinat
// 4. Luas area perusahaan
// 5. Wilayah/desa sekitar

const hotspotData = [   // Data hotspot area perusahaan tambang
  {
    name: "PT. Macika Mada Madana",
    coords: [-4.4075, 122.3642],

    jenisLokasi: "Area perusahaan tambang",
    luasArea: "± 706.212244 ha",
    wilayahSekitar: "Lalowua, Ululakara, Waturapa",
    slopeValue: "27.4°",
    rainValue: "2.430 mm",
    landcoverValue: "Lahan Terbuka",
    riskScore: "0.78",
    statusKerawanan: "TINGGI",

    markerColor: "#8b5cf6"
  },
  {
    name: "PT. Jagad Rayatama",
    coords: [-4.3989, 122.3803],

    jenisLokasi: "Area perusahaan tambang",
    luasArea: "± 121,71 ha",
    wilayahSekitar: "Lalowua, Koeono, Waturapa",
    slopeValue: "18.6°",
    rainValue: "2.430 mm",
    landcoverValue: "Vegetasi / Lahan Terbuka",
    riskScore: "0.63",
    statusKerawanan: "SEDANG",

    markerColor: "#8b5cf6"
  }
]; // Data hotspot area perusahaan tambang


// 6. DATA DESA UNTUK FITUR SEARCH

const villageData = [   // Data desa untuk fitur pencarian
  {
    name: "Lalowua",
    coords: [-4.4078, 122.3755]
  },
  {
    name: "Ululakara",
    coords: [-4.3975, 122.3638]
  },
  {
    name: "Waturapa",
    coords: [-4.4144, 122.3602]
  },
  {
    name: "Koeono",
    coords: [-4.3859, 122.3617]
  },
];


// 7. DATA INFORMASI CARD DARI GEE
// Data ini dipakai untuk card dashboard, bukan untuk popup perusahaan.

const dashboardInfo = {   // Data informasi card dari GEE
  slope: {
    label: "Kemiringan Lereng",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Kemiringan Lereng",
    imbauan: "Relatif aman, Tetap berhati-hati saat beraktivitas di area miring, terutama saat hujan.",

    totalArea: 8243989.864481583,
    persenAman: 37.341134586585525,
    persenRawanSedang: 37.60979060247438,
    persenRawanTinggi: 25.049074810940414
  },

  rain: {
    label: "Curah Hujan",
    statusWilayah: "Rawan Sedang",
    faktorDominan: "Curah Hujan",
    imbauan: "Waspadai peningkatan curah hujan dan perubahan kondisi cuaca.",

    totalArea: 8243989.864481583,
    luasAmanHa: 0,
    luasRawanSedangHa: 824.3989864481583,
    luasRawanTinggiHa: 0,

    persenAman: 0,
    persenRawanSedang: 100,
    persenRawanTinggi: 0
  },

  landcover: {
    label: "Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi tutupan lahan relatif aman, namun tetap perlu pemantauan berkala.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.73295153876934,
    persenRawanSedang: 9.387760645196797,
    persenRawanTinggi: 14.100553992934028
  },

  slopeRain: {
    label: "Kemiringan Lereng + Curah Hujan",
    statusWilayah: "Rawan Tinggi",
    faktorDominan: "Kemiringan Lereng",
    imbauan: "Hindari aktivitas pada area lereng curam saat intensitas hujan tinggi.",

    totalArea: 824.3989864481587,

    luasAmanHa: 0,
    luasRawanSedangHa: 310.0547325320735,
    luasRawanTinggiHa: 514.3442539160852,

    persenAman: 0,
    persenRawanSedang: 37.60979060247438,
    persenRawanTinggi: 62.390209397525666,

    skorSlope: 1.8770774234309835,
    skorRain: 2,

    akurasiFeatureImportance: 0.48,
    kappaFeatureImportance: 0,

    importanceSlope: 19.959264615915046,
    importanceSlopePercent: 100,

    importanceRain: 0,
    importanceRainPercent: 0
  },

  slopeLandcover: {
    label: "Kemiringan Lereng + Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi relatif aman, namun tetap lakukan pemantauan pada lereng dan tutupan lahan.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.56354231578801,
    persenRawanSedang: 9.36703456592388,
    persenRawanTinggi: 14.069423118288313,

    skorSlope: 1.8770774234309835,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 1,
    kappaFeatureImportance: 1,

    importanceSlope: 0.38614698134602415,
    importanceSlopePercent: 0.5832351532144102,

    importanceLandcover: 65.82162174072685,
    importanceLandcoverPercent: 99.41676484678558
  },

  rainLandcover: {
    label: "Curah Hujan + Tutupan Lahan",
    statusWilayah: "Relatif Aman",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Kondisi relatif aman, namun tetap perhatikan perubahan cuaca dan tutupan lahan.",

    totalArea: 820.9655318453195,

    luasAmanHa: 628.560292372424,
    luasRawanSedangHa: 76.90012514227173,
    luasRawanTinggiHa: 115.50511433062374,

    persenAman: 76.56354231578801,
    persenRawanSedang: 9.36703456592388,
    persenRawanTinggi: 14.069423118288313,

    skorRain: 2,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 0.6468401486988847,
    kappaFeatureImportance: 0.4832780653510191,

    importanceRain: 0,
    importanceRainPercent: 0,

    importanceLandcover: 33.3389192238216,
    importanceLandcoverPercent: 100
  },

  all: {
    label: "Kemiringan Lereng + Curah Hujan + Tutupan Lahan",
    statusWilayah: "Rawan Sedang",
    faktorDominan: "Tutupan Lahan",
    imbauan: "Waspadai perubahan cuaca, kondisi lereng, dan perubahan tutupan lahan di sekitar wilayah penelitian.",

    totalArea: 820.965531845319,

    luasAmanHa: 230.22836199592132,
    luasRawanSedangHa: 527.4267027857392,
    luasRawanTinggiHa: 63.310467063658464,

    persenAman: 28.043608783236934,
    persenRawanSedang: 64.24468291625114,
    persenRawanTinggi: 7.711708300512074,

    skorSlope: 1.8770774234309835,
    skorRain: 2,
    skorLandcover: 1.3757496845609791,

    akurasiFeatureImportance: 1,
    kappaFeatureImportance: 1,

    importanceSlope: 18.043072191127703,
    importanceSlopePercent: 48.384992524038154,

    importanceRain: 0,
    importanceRainPercent: 0,

    importanceLandcover: 19.247565359686675,
    importanceLandcoverPercent: 51.61500747596184
  }
}; // Data informasi card dari GEE


// 8. INISIALISASI MAP

function initMap() {  // Fungsi untuk menginisialisasi peta
  if (typeof L === "undefined") { // Periksa apakah Leaflet sudah dimuat
    alert("Leaflet tidak terbaca. Periksa koneksi internet atau file leaflet.js."); // Jika Leaflet tidak terbaca, tampilkan alert
    return; // Hentikan eksekusi fungsi jika Leaflet tidak terbaca
  }

  const mapElement = document.getElementById("map");  // Ambil elemen HTML dengan id "map" untuk menampilkan peta

  if (!mapElement) {  // Periksa apakah elemen peta ada di halaman
    alert("Elemen #map tidak ditemukan di dashboard.php."); // Jika elemen peta tidak ditemukan, tampilkan alert
    return; // Hentikan eksekusi fungsi jika elemen peta tidak ditemukan
  }

  if (map !== null) { // Periksa apakah peta sudah diinisialisasi sebelumnya
    return; // Jika peta sudah ada, hentikan eksekusi fungsi untuk mencegah duplikasi
  } 

  map = L.map("map", { // Inisialisasi peta Leaflet pada elemen dengan id "map"
    zoomControl: true // Aktifkan kontrol zoom pada peta
  }).setView(defaultCenter, defaultZoom); // Setel tampilan awal peta ke koordinat default dan zoom default

  map.on("moveend zoomend", saveDashboardMapState); // Simpan state peta saat pengguna menggeser atau memperbesar/memperkecil peta

  osmBaseLayer = L.tileLayer( // Inisialisasi layer dasar OpenStreetMap
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  );

  satelliteBaseLayer = L.tileLayer( // Inisialisasi layer dasar Satelit dari Esri
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles © Esri" }
  );

  satelliteBaseLayer.addTo(map); // Tambahkan layer dasar Satelit ke peta saat inisialisasi

  hotspotLayer = L.layerGroup(); // Inisialisasi layer group untuk hotspot area perusahaan
  villageMarkerLayer = L.layerGroup(); // Inisialisasi layer group untuk marker desa

  createLayers(); // Buat layer klasifikasi dari Google Earth Engine
  createBoundaryLayers(); // Buat layer batas administrasi kabupaten dan kecamatan
  createHotspotPopup(); // Buat popup hotspot area perusahaan
  loadAllGeeTileLayersFromBackend(); // Muat semua layer klasifikasi dari backend Node.js

  hotspotLayer.addTo(map); // Tambahkan layer hotspot area perusahaan ke peta
  villageMarkerLayer.addTo(map); // Tambahkan layer marker desa ke peta

  map.on("click", e => { // Event listener untuk klik pada peta
    const selectedLayer = getSelectedAreaStatsLayer();  // Dapatkan layer klasifikasi yang dipilih saat ini

    if (!selectedLayer) { // Jika tidak ada layer yang dipilih, reset panel lokasi dan hentikan eksekusi
      resetLocationPanel(); // Reset panel lokasi saat tidak ada layer yang dipilih
      return; // Hentikan eksekusi jika tidak ada layer yang dipilih
    }

    updateLocationPanel(null, e.latlng); // Perbarui panel lokasi dengan koordinat klik pada peta
    identifyPointFromGee(e.latlng); // Identifikasi titik dari Google Earth Engine berdasarkan koordinat klik pada peta
  });

  setTimeout(() => { // Gunakan setTimeout untuk memastikan peta sudah sepenuhnya dimuat sebelum memanggil invalidateSize
    map.invalidateSize(); // Memperbarui ukuran peta agar sesuai dengan elemen HTML setelah peta dimuat
  }, 300); // Tunggu 300ms sebelum memanggil invalidateSize untuk memastikan peta sudah sepenuhnya dimuat
}


// 9. MEMBUAT LAYER BATAS ADMINISTRASI

function createBoundaryLayers() {   // Fungsi untuk membuat layer batas administrasi kabupaten dan kecamatan
  if (typeof L === "undefined") return; // Periksa apakah Leaflet sudah dimuat sebelum membuat layer batas

  boundaryKabLayer = L.geoJSON(kabupatenBoundaryGeoJson, { // Buat layer batas kabupaten dari GeoJSON
    style: {
      color: "#ffffff",
      weight: 2.4,
      opacity: 1,
      fillOpacity: 0,
      dashArray: "7 5"
    },
    interactive: false
  });

  boundaryKecLayer = L.geoJSON(kecamatanBoundaryGeoJson, { // Buat layer batas kecamatan dari GeoJSON
    style: {
      color: "#93c5fd",
      weight: 1.7,
      opacity: 0.95,
      fillOpacity: 0,
      dashArray: "4 6"
    },
    interactive: false
  });

  boundaryLabelLayer = L.layerGroup([ // Buat layer label batas kabupaten
    L.marker([-4.407, 122.392], {
      interactive: false,
      icon: L.divIcon({
        className: "boundary-label",
        html: "KONAWE SELATAN",
        iconSize: [118, 24],
        iconAnchor: [59, 12]
      })
    })
  ]);
}

function updateBoundaryLayers() { // Fungsi untuk memperbarui visibilitas layer batas administrasi berdasarkan checkbox
  if (!map) return; // Periksa apakah peta sudah diinisialisasi sebelum memperbarui layer batas

  if (chkBoundaryKab && boundaryKabLayer) { // Periksa apakah checkbox batas kabupaten dan layer batas kabupaten ada
    if (chkBoundaryKab.checked) { // Jika checkbox batas kabupaten dicentang, tambahkan layer batas kabupaten ke peta
      if (!map.hasLayer(boundaryKabLayer)) boundaryKabLayer.addTo(map); // Tambahkan layer batas kabupaten ke peta jika belum ada
      if (boundaryLabelLayer && !map.hasLayer(boundaryLabelLayer)) boundaryLabelLayer.addTo(map); // Tambahkan layer label batas kabupaten ke peta jika belum ada
      boundaryKabLayer.bringToFront?.(); // 
    } else { // Jika checkbox batas kabupaten tidak dicentang, hapus layer batas kabupaten dari peta
      if (map.hasLayer(boundaryKabLayer)) map.removeLayer(boundaryKabLayer); // Hapus layer batas kabupaten dari peta jika ada
      if (boundaryLabelLayer && map.hasLayer(boundaryLabelLayer)) map.removeLayer(boundaryLabelLayer); // Hapus layer label batas kabupaten dari peta jika ada
    }
  }

  if (chkBoundaryKec && boundaryKecLayer) { // Periksa apakah checkbox batas kecamatan dan layer batas kecamatan ada
    if (chkBoundaryKec.checked) { // Jika checkbox batas kecamatan dicentang, tambahkan layer batas kecamatan ke peta
      if (!map.hasLayer(boundaryKecLayer)) boundaryKecLayer.addTo(map); // Tambahkan layer batas kecamatan ke peta jika belum ada
      boundaryKecLayer.bringToFront?.(); // Bawa layer batas kecamatan ke depan agar terlihat di atas layer lain
    } else if (map.hasLayer(boundaryKecLayer)) { // Jika checkbox batas kecamatan tidak dicentang dan layer batas kecamatan ada di peta, hapus layer tersebut
      map.removeLayer(boundaryKecLayer); // Hapus layer batas kecamatan dari peta
    }
  }
}



// 10. MEMBUAT LAYER PETA DARI GOOGLE EARTH ENGINE

// Layer klasifikasi sekarang dimuat dari backend Node.js agar tile peta
// dan popup identify membaca asset GEE yang sama dari file .env.
// Mapping:
// - Parameter dasar: 1=Aman, 2=Sedang, 3=Tinggi
// - Random Forest: 0=Aman, 1=Sedang, 2=Tinggi

function createLayers() { // Fungsi untuk membuat layer klasifikasi dari Google Earth Engine
  slopeLayer = null; // Inisialisasi layer kemiringan lereng
  rainLayer = null; // Inisialisasi layer curah hujan
  landcoverLayer = null; // Inisialisasi layer tutupan lahan
  slopeRainLayer = null; // Inisialisasi layer kemiringan lereng dan curah hujan
  slopeLandcoverLayer = null; // Inisialisasi layer kemiringan lereng dan tutupan lahan
  rainLandcoverLayer = null; // Inisialisasi layer curah hujan dan tutupan lahan
  rfLayer = null; // Inisialisasi layer Random Forest
}

async function fetchGeeTileLayer(layerKey) { // Fungsi untuk mengambil tile layer dari backend Node.js (penting)
  const response = await fetch(`${GEE_API_BASE_URL}/api/tile/${layerKey}`); // Panggil endpoint backend untuk mendapatkan URL tile layer dari GEE
  const result = await response.json(); // Parse hasil response menjadi JSON

  if (!response.ok || result.status !== "success") { // Jika response tidak OK atau status bukan "success", lempar error
    throw new Error(result.detail || result.message || `Gagal memuat tile ${layerKey}`); // Lempar error dengan detail dari response atau pesan default
  }

  const opacity = Number(mainOpacityRange?.value || rfOpacityRange?.value || 70) / 100; // Ambil nilai opacity dari slider, default 70% jika tidak ada

  return L.tileLayer(result.tile_url, { // Buat layer tile dengan URL yang diperoleh
    opacity,
    transparent: true,
  });
}

async function loadAllGeeTileLayersFromBackend() { // Fungsi untuk memuat semua layer klasifikasi dari backend Node.js(penting)
  const layerJobs = [ // Array berisi pasangan layerKey dan fungsi untuk menyimpan layer yang dimuat
    ["slope_class", layer => { slopeLayer = layer; }], // Fungsi untuk menyimpan layer kemiringan lereng
    ["rain_class", layer => { rainLayer = layer; }], // Fungsi untuk menyimpan layer curah hujan
    ["landcover_class", layer => { landcoverLayer = layer; }], // Fungsi untuk menyimpan layer tutupan lahan
    ["rf_slope_rain", layer => { slopeRainLayer = layer; }], // Fungsi untuk menyimpan layer kemiringan lereng dan curah hujan
    ["rf_slope_landcover", layer => { slopeLandcoverLayer = layer; }], // Fungsi untuk menyimpan layer kemiringan lereng dan tutupan lahan
    ["rf_rain_landcover", layer => { rainLandcoverLayer = layer; }], // Fungsi untuk menyimpan layer curah hujan dan tutupan lahan
    ["rf_all", layer => { rfLayer = layer; }], // Fungsi untuk menyimpan layer Random Forest
  ];

  for (const [layerKey, setLayer] of layerJobs) { // Loop melalui setiap pasangan layerKey dan fungsi setLayer
    try { // Coba untuk memuat layer dari backend
      const layer = await fetchGeeTileLayer(layerKey); // Panggil fungsi untuk mengambil tile layer dari backend
      setLayer(layer); // Simpan layer yang dimuat ke variabel global yang sesuai
      console.log(`Tile ${layerKey} berhasil dimuat dari backend.`); // Log keberhasilan memuat layer ke console
    } catch (error) { // Jika terjadi error saat memuat layer, tangkap error dan log peringatan ke console
      console.warn(`Tile ${layerKey} belum bisa dimuat:`, error.message); // Log peringatan ke console jika tile layer belum bisa dimuat dari backend
    }
  }

  applyLayerOpacity(); // Terapkan opacity ke semua layer yang dimuat
  updateLayer(); // Perbarui layer yang ditampilkan di peta berdasarkan pilihan pengguna
}

// 11. HOTSPOT POPUP AREA TAMBANG / PERUSAHAAN

function createHotspotPopup() { // Fungsi untuk membuat popup hotspot area perusahaan tambang
  if (!hotspotLayer) return; // Periksa apakah hotspotLayer sudah diinisialisasi sebelum membuat popup
  hotspotLayer.clearLayers(); // Hapus semua marker sebelumnya dari hotspotLayer sebelum menambahkan marker baru
  hotspotData.forEach(data => { // Loop melalui setiap data hotspot untuk membuat marker dan popup
    const marker = L.marker(data.coords, { // Buat marker untuk setiap hotspot area perusahaan
      icon: L.divIcon({
        className: "mine-div-icon",
        html: `<span class="mine-pin">●</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    });

    marker.bindTooltip(data.name, { // Tambahkan tooltip untuk menampilkan nama perusahaan saat hover
      permanent: true,
      direction: "right",
      offset: [10, 0],
      className: "mine-label"
    });

    marker.bindPopup(getHotspotPopupContent(data));

    marker.on("click", function () {
      lastFocusedLatLng = L.latLng(data.coords[0], data.coords[1]);
      updateLocationPanel(data, lastFocusedLatLng);
      this.openPopup();
    });

    hotspotLayer.addLayer(marker);
  });
}


function getHotspotPopupContent(data) { // Fungsi untuk membuat konten popup hotspot area perusahaan tambang
  return `
    <div style="
      min-width:260px;
      max-width:300px;
      font-family:Arial, sans-serif;
      color:#2d3436;
    ">
      <h3 style="
        margin:0 0 6px 0;
        color:#d63031;
        font-size:18px;
        font-weight:700;
      ">
        ${data.name}
      </h3>

      <p style="
        margin:0 0 10px 0;
        color:#636e72;
        font-size:13px;
      ">
        Informasi umum lokasi perusahaan
      </p>

      <hr style="
        border:none;
        border-top:1px solid #ddd;
        margin:10px 0;
      ">

      <p style="margin:7px 0;">
        <b>Jenis Lokasi:</b><br>
        ${data.jenisLokasi || "-"}
      </p>

      <p style="margin:7px 0;">
        <b>Luas Area Perusahaan:</b><br>
        ${data.luasArea || "-"}
      </p>

      <p style="margin:7px 0;">
        <b>Wilayah/Desa Sekitar:</b><br>
        ${data.wilayahSekitar || "-"}
      </p>

      <p style="
        margin:7px 0;
        padding:8px;
        background:#f8f9fa;
        border-left:4px solid #2f5d8c;
        border-radius:6px;
        line-height:1.4;
      ">
        <b>Titik Koordinat:</b><br>
        Latitude: ${data.coords[0]}<br>
        Longitude: ${data.coords[1]}
      </p>
    </div>
  `;
}


// 12. RESET SEMUA LAYER KLASIFIKASI

function resetLayers() {   // Fungsi untuk menghapus semua layer klasifikasi dari peta
  if (!map) return;

  const layers = [
    slopeLayer,
    rainLayer,
    landcoverLayer,
    slopeRainLayer,
    slopeLandcoverLayer,
    rainLandcoverLayer,
    rfLayer
  ];

  layers.forEach(layer => {
    if (layer && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}

// 13. ZOOM KE AREA PENELITIAN
function zoomToHazard() { // Fungsi untuk memperbesar tampilan peta ke area penelitian
  if (!map || typeof L === "undefined") return;
  const hazardBounds = L.latLngBounds(hazardBoundsCoords);
  map.fitBounds(hazardBounds);
}

// 14. KEMBALI KE TAMPILAN DEFAULT
function backToDefaultView() { // Fungsi untuk mengembalikan tampilan peta ke posisi default
  if (!map) return;
  map.setView(defaultCenter, defaultZoom);
} 

//15. DATA AKURASI MODEL RANDOM FOREST BERDASARKAN PARAMETER
const modelAccuracyData = { // Data akurasi model Random Forest berdasarkan kombinasi parameter
  slope: {
    available: false,
    model: "Parameter Kemiringan Lereng",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },
  rain: {
    available: false,
    model: "Parameter Curah Hujan",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },
  landcover: {
    available: false,
    model: "Parameter Tutupan Lahan",
    note: "Parameter tunggal tidak dievaluasi sebagai model Random Forest."
  },
  slope_rain: {
    available: true,
    model: "Random Forest Kemiringan Lereng + Curah Hujan",
    accuracy: 0.58,
    kappa: 0.4253,
    precision: 0.4644,
    recall: 0.66,
    f1: 0.5215,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng dan curah hujan."
  },

  slope_landcover: {
    available: true,
    model: "Random Forest Kemiringan Lereng + Tutupan Lahan",
    accuracy: 0.95,
    kappa: 0.92,
    precision: 0.9493,
    recall: 0.94886,
    f1: 0.9489,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng dan tutupan lahan."
  },
  rain_landcover: {
    available: true,
    model: "Random Forest Curah Hujan + Tutupan Lahan",
    accuracy: 0.94,
    kappa: 0.90999,
    precision: 0.94100,
    recall: 0.94,
    f1: 0.93,
    note: "Evaluasi model berdasarkan kombinasi parameter curah hujan dan tutupan lahan."
  },

  rf_all: {
    available: true,
    model: "Random Forest Semua Parameter",
    accuracy: 0.84,
    kappa: 0.7695,
    precision: 0.8728,
    recall: 0.84493,
    f1: 0.841260,
    note: "Evaluasi model berdasarkan kombinasi parameter kemiringan lereng, curah hujan, dan tutupan lahan."
  }
}; 

// 16. FORMAT ANGKA DESIMAL UNTUK EVALUASI MODEL
function formatEvaluationDecimal(value, digit = 2) { // Fungsi untuk memformat angka desimal dengan jumlah digit tertentu
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return "-";
  }
  return numberValue.toFixed(digit);
}

// 17. FORMAT ANGKA UNTUK EVALUASI MODEL
function formatEvaluationNumber(value) { // Fungsi untuk memformat angka dengan jumlah digit tertentu
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return "-";
  }
  return numberValue.toFixed(4);
}

// 18. DAPATKAN KUNCI MODEL AKURASI YANG DIPILIH
function getSelectedAccuracyModelKey() { // Fungsi untuk mendapatkan kunci model akurasi yang dipilih berdasarkan checkbox
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf || (slope && rain && land)) { // Jika checkbox Random Forest dicentang atau semua parameter dicentang, kembalikan kunci "rf_all"
    return "rf_all";
  }

  if (slope && rain && !land) { // Jika checkbox kemiringan lereng dan curah hujan dicentang, tetapi tutupan lahan tidak dicentang, kembalikan kunci "slope_rain"
    return "slope_rain";
  }

  if (slope && !rain && land) { // Jika checkbox kemiringan lereng dan tutupan lahan dicentang, tetapi curah hujan tidak dicentang, kembalikan kunci "slope_landcover"
    return "slope_landcover";
  }

  if (!slope && rain && land) { // Jika checkbox curah hujan dan tutupan lahan dicentang, tetapi kemiringan lereng tidak dicentang, kembalikan kunci "rain_landcover"
    return "rain_landcover";
  }

  if (slope && !rain && !land) { // Jika hanya checkbox kemiringan lereng dicentang, kembalikan kunci "slope"
    return "slope";
  }

  if (!slope && rain && !land) { // Jika hanya checkbox curah hujan dicentang, kembalikan kunci "rain"
    return "rain";
  }

  if (!slope && !rain && land) { // Jika hanya checkbox tutupan lahan dicentang, kembalikan kunci "landcover"
    return "landcover";
  }

  return null; // Jika tidak ada kombinasi checkbox yang valid, kembalikan null
}

// 18. UPDATE AKURASI BERDASARKAN CHECKBOX
function updateAccuracy() {     // Fungsi untuk memperbarui informasi akurasi model berdasarkan checkbox yang dipilih
  const selectedKey = getSelectedAccuracyModelKey(); // Dapatkan kunci model akurasi yang dipilih berdasarkan checkbox
  if (!selectedKey) { // Jika tidak ada kunci yang valid, perbarui card metrik model dengan null dan hentikan eksekusi
    updateModelMetricCard(null); // Perbarui card metrik model dengan null jika tidak ada kunci yang valid
    return;// Hentikan eksekusi fungsi jika tidak ada kunci yang valid
  }
  const data = modelAccuracyData[selectedKey] || null; // Ambil data akurasi model berdasarkan kunci yang dipilih
  updateModelMetricCard(data); // Perbarui card metrik model dengan data akurasi model yang diperoleh
}


// 19. FUNGSI CARD DINAMIS BERDASARKAN CHECKBOX
// Fungsi untuk mendapatkan informasi dashboard berdasarkan checkbox yang dipilih
function getDashboardInfoByCheckbox() { 
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf) {
    return dashboardInfo.all;
  }
  if (!slope && !rain && !land) {
    return null;
  }
  if (slope && !rain && !land) {
    return dashboardInfo.slope;
  }
  if (!slope && rain && !land) {
    return dashboardInfo.rain;
  }
  if (!slope && !rain && land) {
    return dashboardInfo.landcover;
  }
  if (slope && rain && !land) {
    return dashboardInfo.slopeRain;
  }
  if (slope && !rain && land) {
    return dashboardInfo.slopeLandcover;
  }
  if (!slope && rain && land) {
    return dashboardInfo.rainLandcover;
  }
  if (slope && rain && land) {
    return dashboardInfo.all;
  }
  return null;
}

// 20. FUNGSI LAYER DINAMIS BERDASARKAN CHECKBOX
function getSelectedAreaStatsLayer() { // Fungsi untuk mendapatkan layer klasifikasi yang dipilih berdasarkan checkbox
  const slope = chkSlope?.checked;
  const rain = chkRain?.checked;
  const land = chkLandcover?.checked;
  const rf = chkRF?.checked;

  if (rf || (slope && rain && land)) {
    return "rf_all";
  }
  if (slope && rain && !land) {
    return "rf_slope_rain";
  }
  if (slope && !rain && land) {
    return "rf_slope_landcover";
  }
  if (!slope && rain && land) {
    return "rf_rain_landcover";
  }
  if (slope && !rain && !land) {
    return "slope_class";
  }
  if (!slope && rain && !land) {
    return "rain_class";
  }
  if (!slope && !rain && land) {
    return "landcover_class";
  }
  return null;
}

// 21. SIMPAN STATE PETA DASHBOARD KE LOCAL STORAGE
function saveDashboardMapState() {
  if (!map) return;
  const selectedLayer = getSelectedAreaStatsLayer(); // Dapatkan layer klasifikasi yang dipilih saat ini berdasarkan checkbox
  const center = map.getCenter(); // Dapatkan koordinat pusat peta saat ini
  const mapState = { // Buat objek state peta untuk disimpan ke localStorage
    layer: selectedLayer || "rf_all", // Simpan layer yang dipilih, default ke "rf_all" jika tidak ada
    center: {
      lat: center.lat,
      lng: center.lng
    },
    zoom: map.getZoom()
  };
  localStorage.setItem("dashboardMapState", JSON.stringify(mapState)); // Simpan state peta ke localStorage dalam format JSON
}

// 22. PERIKSA APAKAH INFORMASI DASHBOARD TERISI
function isDashboardInfoFilled(info) {
  if (!info) {
    return false;
  }

  return Boolean(
    info.statusWilayah &&
    info.faktorDominan &&
    info.imbauan
  );
}

// 23. MENDAPATKAN KELAS STATUS DARI LABEL
function getStatusClassFromLabel(statusLabel) {
  if (statusLabel === "Rawan Tinggi" || statusLabel === "Sangat Rawan") {
    return 3;
  }

  if (statusLabel === "Rawan Sedang" || statusLabel === "Sedang") {
    return 2;
  }

  if (statusLabel === "Relatif Aman" || statusLabel === "Aman") {
    return 1;
  }

  return 0;
}

// 24. MENDAPATKAN NILAI ITEM DARI DATA GEE
// FITUR IDENTIFY POINT GEE - MEMBACA 7 ASSET
function getGeeItemValue(data, key) { // Fungsi untuk mendapatkan nilai item dari data GEE berdasarkan kunci tertentu
  if (!data || data[key] === null || data[key] === undefined) {
    return "-";
  }

  const item = data[key];

  if (typeof item === "object" && item !== null) {
    return item.nilai ?? "-";
  }

  return item ?? "-";
}

function getGeeItemClass(data, key) { // Fungsi untuk mendapatkan kelas item dari data GEE berdasarkan kunci tertentu
  if (!data || data[key] === null || data[key] === undefined) {
    return "-";
  }

  const item = data[key];

  if (typeof item === "object" && item !== null) {
    const nilai = item.nilai;
    const kelas = item.kelas;

    if (kelas && kelas !== "Tidak ada data") {
      return kelas;
    }

    if (key.startsWith("rf_")) {
      if (Number(nilai) === 0) return "Aman";
      if (Number(nilai) === 1) return "Sedang";
      if (Number(nilai) === 2) return "Rawan";
    }

    return kelas ?? nilai ?? "-";
  }

  if (key.startsWith("rf_")) {
    if (Number(item) === 0) return "Aman";
    if (Number(item) === 1) return "Sedang";
    if (Number(item) === 2) return "Rawan";
  }

  return item ?? "-";
}


function normalizeRiskDisplayLabel(label) { // Fungsi untuk menormalkan label risiko agar lebih mudah dibaca dan konsisten
  const text = String(label ?? "-").trim();

  if (!text || text === "-" || text.toLowerCase() === "tidak ada data") {
    return "Tidak ada data";
  }

  if (text.toLowerCase().includes("tinggi") || text.toLowerCase().includes("rawan")) {
    return "Rawan";
  }

  if (text.toLowerCase().includes("sedang")) {
    return "Sedang";
  }

  if (text.toLowerCase().includes("aman")) {
    return "Aman";
  }

  return text;
}

function getBaseParameterClassLabel(value) { // Fungsi untuk mendapatkan label kelas parameter dasar berdasarkan nilai tertentu
  if (value === null || value === undefined || value === "" || value === "-") {
    return "-";
  }

  const nilai = Number(value);

  if (!Number.isFinite(nilai)) {
    return "-";
  }

  if (nilai === 0 || nilai === 1) return "aman";
  if (nilai === 2) return "sedang";
  if (nilai === 3) return "rawan";

  return "-";
}

function formatBaseParameterValue(value) { // Fungsi untuk memformat nilai parameter dasar agar lebih mudah dibaca dan konsisten
  if (value === null || value === undefined || value === "" || value === "-") {
    return "-";
  }

  const label = getBaseParameterClassLabel(value);
  return label === "-" ? `${value}` : `${value} (${label})`;
}

function getBadgeClassFromLabel(label) { // Fungsi untuk mendapatkan kelas badge berdasarkan label risiko
  const text = String(label || "").toLowerCase();

  if (text.includes("rawan") || text.includes("tinggi")) return "danger";
  if (text.includes("sedang")) return "warning";
  if (text.includes("aman")) return "safe";

  return "neutral";
}

function getRiskBadgeStyle(kelas) { // Fungsi untuk mendapatkan gaya badge risiko berdasarkan kelas risiko
  const text = String(kelas || "").toLowerCase();

  if (text.includes("tinggi") || text.includes("rawan")) {
    return `
      background:#fee2e2;
      color:#991b1b;
      border:1px solid #fecaca;
    `;
  }

  if (text.includes("sedang")) {
    return `
      background:#fef3c7;
      color:#92400e;
      border:1px solid #fde68a;
    `;
  }

  if (text.includes("aman")) {
    return `
      background:#dcfce7;
      color:#166534;
      border:1px solid #bbf7d0;
    `;
  }

  return `
    background:#f1f5f9;
    color:#334155;
    border:1px solid #cbd5e1;
  `;
}

const RISK_LAYER_LABELS = {
  rf_all: "Random Forest Semua Parameter",
  rf_slope_rain: "Random Forest Curah Hujan + Kemiringan Lereng",
  rf_slope_landcover: "Random Forest Kemiringan Lereng + Tutupan Lahan",
  rf_rain_landcover: "Random Forest Curah Hujan + Tutupan Lahan",
  rain_class: "Single Parameter Curah Hujan",
  slope_class: "Single Parameter Kemiringan Lereng",
  landcover_class: "Single Parameter Tutupan Lahan"
};

function formatAngkaDenganSatuan(value, satuan) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return "-";
  }

  const angka = Number(value);

  if (Number.isFinite(angka)) {
    const hasil = Number.isInteger(angka)
      ? String(angka)
      : angka.toFixed(2).replace(/\.?0+$/, "");

    return `${hasil} ${satuan}`;
  }

  return `${value} ${satuan}`;
}

function getRiskResult(data, layerKey) {
  const nilai = getGeeItemValue(data, layerKey);
  let kelas = normalizeRiskDisplayLabel(getGeeItemClass(data, layerKey));

  if (kelas === "Tidak ada data" || kelas === "-") {
    if (layerKey.startsWith("rf_")) {
      if (Number(nilai) === 0) kelas = "Aman";
      else if (Number(nilai) === 1) kelas = "Sedang";
      else if (Number(nilai) === 2) kelas = "Rawan";
    } else {
      if (Number(nilai) === 1) kelas = "Aman";
      else if (Number(nilai) === 2) kelas = "Sedang";
      else if (Number(nilai) === 3) kelas = "Rawan";
    }
  }

  return {
    nilai,
    kelas,
    label: RISK_LAYER_LABELS[layerKey] || layerKey
  };
}

function getCurahHujanDisplay(data) {
  const rawValue = getGeeItemValue(data, "rain_value");

  if (rawValue !== "-") {
    return formatAngkaDenganSatuan(rawValue, "mm/tahun");
  }

  const kelas = normalizeRiskDisplayLabel(getGeeItemClass(data, "rain_class"));
  const nilai = getGeeItemValue(data, "rain_class");

  return `${kelas} (${nilai})`;
}

function getKemiringanDisplay(data) {
  const rawValue = getGeeItemValue(data, "slope_value");

  if (rawValue !== "-") {
    return formatAngkaDenganSatuan(rawValue, "derajat");
  }

  const kelas = normalizeRiskDisplayLabel(getGeeItemClass(data, "slope_class"));
  const nilai = getGeeItemValue(data, "slope_class");

  return `${kelas} (${nilai})`;
}

function getTutupanLahanDisplay(data) {
  const item = data?.landcover_value;

  if (item && typeof item === "object") {
    if (item.nama) return item.nama;
    if (item.kelas && item.kelas !== "Tidak ada data") return item.kelas;
  }

  const rawValue = getGeeItemValue(data, "landcover_value");

  const LANDCOVER_MAP = {
    1: "vegetasi",
    2: "lahan terbuka",
    3: "permukiman",
    4: "badan air",
    5: "area tambang"
  };

  if (rawValue !== "-" && LANDCOVER_MAP[Number(rawValue)]) {
    return LANDCOVER_MAP[Number(rawValue)];
  }

  const kelas = normalizeRiskDisplayLabel(getGeeItemClass(data, "landcover_class"));
  const nilai = getGeeItemValue(data, "landcover_class");

  return `${kelas} (${nilai})`;
}

function getIdentifyPopupContent(latlng, data, note = "") {
  const selectedLayer = getSelectedAreaStatsLayer() || "rf_all";
  const selectedRisk = getRiskResult(data, selectedLayer);

  const rfAll = getRiskResult(data, "rf_all");
  const rfSlopeRain = getRiskResult(data, "rf_slope_rain");
  const rfSlopeLandcover = getRiskResult(data, "rf_slope_landcover");
  const rfRainLandcover = getRiskResult(data, "rf_rain_landcover");

  const rainSingle = getRiskResult(data, "rain_class");
  const slopeSingle = getRiskResult(data, "slope_class");
  const landcoverSingle = getRiskResult(data, "landcover_class");

  const curahHujan = getCurahHujanDisplay(data);
  const kemiringanLereng = getKemiringanDisplay(data);
  const tutupanLahan = getTutupanLahanDisplay(data);

  const badgeClass = getBadgeClassFromLabel(selectedRisk.kelas);

  return `
    <div class="identify-popup-card">
      <div class="identify-popup-header">
        <div>
          <span class="identify-popup-eyebrow">Informasi Detail Kerawanan</span>
          <h3>Hasil Klik Peta</h3>
        </div>
        <span class="identify-status-badge ${badgeClass}">
          ${selectedRisk.kelas}
        </span>
      </div>

      <div class="identify-popup-section coordinate-section">
        <span class="section-label">Koordinat</span>
        <strong>${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</strong>
      </div>

      <div class="identify-popup-section">
        <span class="section-label">Informasi Utama</span>

        <div class="identify-row main-result">
          <span>Tingkat Kerawanan</span>
          <strong>${selectedRisk.kelas}</strong>
        </div>

        <div class="identify-row">
          <span>Layer yang Dibaca</span>
          <strong>${selectedRisk.label}</strong>
        </div>

        <div class="identify-row">
          <span>Nilai Kelas</span>
          <strong>${selectedRisk.nilai}</strong>
        </div>
      </div>

      <div class="identify-popup-section">
        <span class="section-label">Parameter Lingkungan</span>

        <div class="identify-row">
          <span>Curah Hujan</span>
          <strong>${curahHujan}</strong>
        </div>

        <div class="identify-row">
          <span>Kemiringan Lereng</span>
          <strong>${kemiringanLereng}</strong>
        </div>

        <div class="identify-row">
          <span>Tutupan Lahan</span>
          <strong>${tutupanLahan}</strong>
        </div>
      </div>

      <div class="identify-popup-section">
        <span class="section-label">Hasil Random Forest</span>

        <div class="identify-row main-result">
          <span>Semua Parameter</span>
          <strong>${rfAll.kelas} (${rfAll.nilai})</strong>
        </div>

        <div class="identify-row">
          <span>Curah Hujan + Kemiringan Lereng</span>
          <strong>${rfSlopeRain.kelas} (${rfSlopeRain.nilai})</strong>
        </div>

        <div class="identify-row">
          <span>Kemiringan Lereng + Tutupan Lahan</span>
          <strong>${rfSlopeLandcover.kelas} (${rfSlopeLandcover.nilai})</strong>
        </div>

        <div class="identify-row">
          <span>Curah Hujan + Tutupan Lahan</span>
          <strong>${rfRainLandcover.kelas} (${rfRainLandcover.nilai})</strong>
        </div>
      </div>

      <div class="identify-popup-section">
        <span class="section-label">Single Parameter</span>

        <div class="identify-row">
          <span>Curah Hujan</span>
          <strong>${rainSingle.kelas} (${rainSingle.nilai})</strong>
        </div>

        <div class="identify-row">
          <span>Kemiringan Lereng</span>
          <strong>${slopeSingle.kelas} (${slopeSingle.nilai})</strong>
        </div>

        <div class="identify-row">
          <span>Tutupan Lahan</span>
          <strong>${landcoverSingle.kelas} (${landcoverSingle.nilai})</strong>
        </div>
      </div>

      ${note ? `
        <div class="identify-note">
          ${note}
        </div>
      ` : ""}
    </div>
  `;
}

// 25. UPDATE PANEL LOKASI BERDASARKAN DATA GEE
function updateLocationPanelFromGee(latlng, data) { // Fungsi untuk memperbarui panel lokasi berdasarkan data GEE yang diperoleh dari backend
  const selectedLayer = getSelectedAreaStatsLayer();

  if (!selectedLayer) {
    resetLocationPanel(); // Jika tidak ada layer yang dipilih, reset panel lokasi ke nilai default
    return;
  }

  lastFocusedLatLng = latlng;

  const rainValue = getGeeItemValue(data, "rain_class");
  const slopeValue = getGeeItemValue(data, "slope_class");
  const landcoverValue = getGeeItemValue(data, "landcover_class");

  const selectedValue = getGeeItemValue(data, selectedLayer);
  let selectedClass = getGeeItemClass(data, selectedLayer);

  if (
    selectedClass === "Tidak ada data" ||
    selectedClass === "-" ||
    selectedClass === undefined ||
    selectedClass === null
  ) {
    selectedClass = "Tidak ada data";
  }

  if (detailLatLon) {
    detailLatLon.textContent = `Lat: ${latlng.lat.toFixed(5)} , Lon: ${latlng.lng.toFixed(5)}`;
  }

  if (detailStatus) {
    detailStatus.textContent = normalizeRiskDisplayLabel(selectedClass).toUpperCase();
  }

  if (detailSlope) detailSlope.textContent = formatBaseParameterValue(slopeValue);
  if (detailRain) detailRain.textContent = formatBaseParameterValue(rainValue);
  if (detailLandcover) detailLandcover.textContent = formatBaseParameterValue(landcoverValue);
  if (detailScore) detailScore.textContent = selectedValue;

  if (detailDesc) {
  detailDesc.textContent =
    data?.[selectedLayer]?.keterangan ||
    "Keterangan belum tersedia dari backend API.";
}
}

async function identifyPointFromGee(latlng) { // Fungsi untuk mengidentifikasi titik dari backend GEE berdasarkan koordinat yang diberikan (penting)
  if (!map || !latlng) return;

  const loadingPopup = L.popup({
    maxWidth: 340,
    minWidth: 310,
    className: "small-gee-popup",
    autoPan: true,
    keepInView: true,
  })
    .setLatLng(latlng)
    .setContent(`
      <div style="font-family:Arial, sans-serif; min-width:220px;">
        <b>Membaca nilai titik...</b><br>
        <small>Menghubungi backend API Google Earth Engine.</small>
      </div>
    `)
    .openOn(map);

  try {
    const url = `${GEE_API_BASE_URL}/api/identify?lat=${encodeURIComponent(latlng.lat)}&lng=${encodeURIComponent(latlng.lng)}&layer=all`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      const detail = result.detail || result.message || "Backend API belum siap.";

      loadingPopup.setContent(`
        <div style="font-family:Arial, sans-serif; min-width:250px; color:#991b1b; line-height:1.4;">
          <b>Gagal membaca nilai titik</b><br>
          <small>${detail}</small><br><br>
          <small>
            Pastikan backend Node.js berjalan, service-account-key.json valid,
            dan semua asset GEE sudah di-share ke service account.
          </small>
        </div>
      `);
      return;
    }

    updateLocationPanelFromGee(latlng, result.data); // Perbarui panel lokasi dengan data GEE yang diperoleh
    loadingPopup.setContent(getIdentifyPopupContent(latlng, result.data, result.catatan));
  } catch (error) {
    console.error("Gagal membaca nilai titik dari backend GEE:", error);

    loadingPopup.setContent(`
      <div style="font-family:Arial, sans-serif; min-width:240px; color:#991b1b;">
        <b>Backend API tidak terhubung</b><br>
        <small>Jalankan dulu server Node.js dengan perintah <b>npm start</b> atau <b>node server.js</b>.</small>
      </div>
    `);
  }
}

// 26. UPDATE STYLE CARD BERDASARKAN STATUS
function updateCardStyle(statusClass) { // Fungsi untuk memperbarui gaya card dashboard berdasarkan kelas status yang diberikan
  if (!statusCard || !factorCard || !adviceCard) return;

  statusCard.classList.remove("safe", "warning", "danger");
  factorCard.classList.remove("safe", "warning", "danger");
  adviceCard.classList.remove("safe", "warning", "danger");

  let className = "";

  if (statusClass === 3) {
    className = "danger";
  }

  else if (statusClass === 2) {
    className = "warning";
  }

  else if (statusClass === 1) {
    className = "safe";
  }

  if (className !== "") {
    statusCard.classList.add(className);
    factorCard.classList.add(className);
    adviceCard.classList.add(className);
  }
}

// 27. UPDATE CARD DASHBOARD BERDASARKAN CHECKBOX
function updateDashboardCards() { // Fungsi untuk memperbarui informasi pada card dashboard berdasarkan checkbox yang dipilih
  const info = getDashboardInfoByCheckbox();

  if (villageText) {
    villageText.textContent = villageData.length + " Desa";
  }

  if (!info) {
    if (statusText) {
      statusText.textContent = "-";
    }

    if (factorText) {
      factorText.textContent = "-";
    }

    if (adviceText) {
      adviceText.textContent = "Pilih parameter analisis terlebih dahulu";
    }

    updateCardStyle(0); // Reset style card ke default jika tidak ada informasi yang valid
    updateLocationPanel(null, lastFocusedLatLng); // Reset panel lokasi ke nilai default jika tidak ada informasi yang valid
    updateFeatureImportanceCard(null); // Reset card feature importance ke nilai default jika tidak ada informasi yang valid
    updateRiskStatisticCard(null); // Reset card risk statistic ke nilai default jika tidak ada informasi yang valid
    return;
  }

  if (!isDashboardInfoFilled(info)) { // Jika informasi dashboard tidak lengkap, tampilkan pesan bahwa data GEE belum ditambahkan
    if (statusText) {
      statusText.textContent = "-";
    }

    if (factorText) {
      factorText.textContent = "-";
    }

    if (adviceText) {
      adviceText.textContent = "Data GEE untuk kombinasi ini belum ditambahkan";
    }

    updateCardStyle(0);
    return;
  }

  if (statusText) {
    statusText.textContent = info.statusWilayah;
  }

  if (factorText) {
    factorText.textContent = info.faktorDominan;
  }

  if (adviceText) {
    adviceText.textContent = info.imbauan;
  }

  const statusClass = getStatusClassFromLabel(info.statusWilayah);
  updateCardStyle(statusClass);

  updateLocationPanel(null, lastFocusedLatLng);
  updateFeatureImportanceCard(info);
  updateRiskStatisticCard(info);
}



// 27. UPDATE LAYER BERDASARKAN CHECKBOX
// Fungsi untuk memperbarui layer klasifikasi pada peta berdasarkan checkbox yang dipilih
function updateLayer() {  
  if (!map) return;

  resetLayers();  // Hapus semua layer klasifikasi dari peta sebelum menambahkan layer baru
  updateAccuracy(); // Perbarui informasi akurasi model berdasarkan checkbox yang dipilih
  updateDashboardCards(); // Perbarui informasi pada card dashboard berdasarkan checkbox yang dipilih
  fetchAreaStatsFromBackend();  // Ambil data statistik area dari backend berdasarkan layer yang dipilih
  applyLayerOpacity(); // Terapkan opacity layer sesuai dengan pengaturan slider opacity

  const slope = chkSlope?.checked; // Periksa apakah checkbox kemiringan lereng dicentang
  const rain = chkRain?.checked; // Periksa apakah checkbox curah hujan dicentang
  const land = chkLandcover?.checked; // Periksa apakah checkbox tutupan lahan dicentang
  const rf = chkRF?.checked;  // Periksa apakah checkbox Random Forest dicentang

  saveDashboardMapState(); // Simpan state peta dashboard ke localStorage setiap kali layer diperbarui

  if (chkCompany && hotspotLayer) { // Periksa apakah checkbox perusahaan dicentang dan layer hotspot tersedia
    if (chkCompany.checked) {
      if (!map.hasLayer(hotspotLayer)) hotspotLayer.addTo(map);
    } else {
      if (map.hasLayer(hotspotLayer)) map.removeLayer(hotspotLayer);
    }
  }

  if (rf) { // Jika checkbox Random Forest dicentang, tambahkan layer Random Forest ke peta
    if (rfLayer) rfLayer.addTo(map);
    updateBoundaryLayers();
    zoomToHazard();
    return;
  }

  if (!slope && !rain && !land) { // Jika tidak ada checkbox parameter dasar yang dicentang, hapus semua layer klasifikasi dari peta
    updateBoundaryLayers();
    backToDefaultView();
    return;
  }

  if (slope && !rain && !land) { // Jika hanya checkbox kemiringan lereng dicentang, tambahkan layer kemiringan lereng ke peta
    if (slopeLayer) slopeLayer.addTo(map);
  }

  else if (!slope && rain && !land) { // Jika hanya checkbox curah hujan dicentang, tambahkan layer curah hujan ke peta
    if (rainLayer) rainLayer.addTo(map);
  }

  else if (!slope && !rain && land) { // Jika hanya checkbox tutupan lahan dicentang, tambahkan layer tutupan lahan ke peta
    if (landcoverLayer) landcoverLayer.addTo(map);
  }

  else if (slope && rain && !land) { // Jika checkbox kemiringan lereng dan curah hujan dicentang, tambahkan layer kombinasi kemiringan lereng dan curah hujan ke peta
    if (slopeRainLayer) slopeRainLayer.addTo(map);
  }

  else if (slope && !rain && land) { // Jika checkbox kemiringan lereng dan tutupan lahan dicentang, tambahkan layer kombinasi kemiringan lereng dan tutupan lahan ke peta
    if (slopeLandcoverLayer) slopeLandcoverLayer.addTo(map);
  }

  else if (!slope && rain && land) { // Jika checkbox curah hujan dan tutupan lahan dicentang, tambahkan layer kombinasi curah hujan dan tutupan lahan ke peta
    if (rainLandcoverLayer) rainLandcoverLayer.addTo(map);
  }

  else if (slope && rain && land) { // Jika semua checkbox parameter dasar dicentang, tambahkan layer Random Forest ke peta
    if (rfLayer) rfLayer.addTo(map);
  }

  updateBoundaryLayers(); // Perbarui layer batas wilayah kabupaten dan kecamatan berdasarkan checkbox yang dipilih
  zoomToHazard(); // Zoom ke area rawan jika ada layer rawan yang ditampilkan
}


// 21. EVENT CHECKBOX

chkSlope?.addEventListener("change", updateLayer); // Tambahkan event listener untuk checkbox kemiringan lereng, ketika berubah, panggil fungsi updateLayer
chkRain?.addEventListener("change", updateLayer); // Tambahkan event listener untuk checkbox curah hujan, ketika berubah, panggil fungsi updateLayer
chkLandcover?.addEventListener("change", updateLayer); // Tambahkan event listener untuk checkbox tutupan lahan, ketika berubah, panggil fungsi updateLayer
chkRF?.addEventListener("change", updateLayer); // Tambahkan event listener untuk checkbox Random Forest, ketika berubah, panggil fungsi updateLayer
chkCompany?.addEventListener("change", updateLayer); // Tambahkan event listener untuk checkbox perusahaan, ketika berubah, panggil fungsi updateLayer
chkBoundaryKab?.addEventListener("change", updateBoundaryLayers); // Tambahkan event listener untuk checkbox batas kabupaten, ketika berubah, panggil fungsi updateBoundaryLayers
chkBoundaryKec?.addEventListener("change", updateBoundaryLayers); // Tambahkan event listener untuk checkbox batas kecamatan, ketika berubah, panggil fungsi updateBoundaryLayers


// 22. FITUR SEARCH DESA
// Fungsi untuk menormalkan teks agar lebih mudah dicari dan konsisten
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

 // Fungsi untuk membuat konten popup desa berdasarkan data desa dan informasi dashboard
function getVillagePopupContent(village) {
  const info = getDashboardInfoByCheckbox();

  let statusPopup = "-";
  let faktorPopup = "-";
  let imbauanPopup = "Pilih parameter analisis terlebih dahulu.";

  if (info && isDashboardInfoFilled(info)) { // Jika informasi dashboard tersedia dan lengkap, gunakan data tersebut untuk popup
    statusPopup = info.statusWilayah;
    faktorPopup = info.faktorDominan;
    imbauanPopup = info.imbauan;
  } else if (info && !isDashboardInfoFilled(info)) { // Jika informasi dashboard tersedia tetapi tidak lengkap, tampilkan pesan bahwa data GEE belum ditambahkan
    imbauanPopup = "Data GEE untuk kombinasi ini belum ditambahkan.";
  }

  return `
    <div style="font-family: Arial, sans-serif; min-width:230px;">
      <h3 style="margin-bottom: 8px;">
        Desa ${village.name}
      </h3>

      <hr>

      <p><b>Status Wilayah:</b> ${statusPopup}</p>
      <p><b>Faktor Dominan:</b> ${faktorPopup}</p>
      <p><b>Imbauan:</b> ${imbauanPopup}</p>

      <hr>

      <p>
        <b>Koordinat:</b><br>
        ${village.coords[0]}, ${village.coords[1]}
      </p>
    </div>
  `;
}


function searchVillage(keyword) { // Fungsi untuk mencari desa berdasarkan kata kunci yang diberikan
  if (!map || !villageMarkerLayer) return;

  const cleanKeyword = normalizeText(keyword);

  if (cleanKeyword === "") {
  villageMarkerLayer.clearLayers();
  updateDashboardCards();

  L.popup()
    .setLatLng(map.getCenter())
    .setContent(`
      <b>Nama desa harus di isi</b><br>
      Silakan masukkan nama desa terlebih dahulu.
    `)
    .openOn(map);

  searchInput?.focus();

  return;
}

  const foundVillage = villageData.find(village => {
    return normalizeText(village.name).includes(cleanKeyword);
  });

  if (!foundVillage) {
    villageMarkerLayer.clearLayers();

    L.popup()
      .setLatLng(defaultCenter)
      .setContent(`
        <b>Desa tidak ditemukan</b><br>
        Silakan cari desa di area penelitian.
      `)
      .openOn(map);

    return;
  }

  villageMarkerLayer.clearLayers();

  const marker = L.marker(foundVillage.coords)
    .bindPopup(getVillagePopupContent(foundVillage));

  villageMarkerLayer.addLayer(marker);

  map.setView(foundVillage.coords, 15);

  marker.openPopup();

  updateDashboardCards();
}


// Search saat menekan Enter
searchInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchVillage(searchInput.value);
  }
});

searchBtn?.addEventListener("click", () => {
  searchVillage(searchInput?.value || "");
});


// Search otomatis setelah minimal 3 huruf
searchInput?.addEventListener("input", () => {
  const keyword = searchInput.value.trim();

  if (keyword.length >= 3) {
    const foundVillage = villageData.find(village => {
      return normalizeText(village.name).includes(normalizeText(keyword));
    });

    if (foundVillage) {
      searchVillage(keyword);
    }
  }

  if (keyword.length === 0) {
    if (villageMarkerLayer) {
      villageMarkerLayer.clearLayers();
    }

    updateDashboardCards();
  }
});




// 23. FUNGSI TAMBAHAN UNTUK DESAIN BARU

function selectedCompanyData() {  // Fungsi untuk mendapatkan data perusahaan yang dipilih dari dropdown
  const selectedName = companySelect?.value;
  return hotspotData.find(item => item.name === selectedName) || hotspotData[0] || null;
}

function formatPercent(value) { // Fungsi untuk memformat nilai persentase agar lebih mudah dibaca dan konsisten
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(1)}%`;
}

function formatHa(value) { // Fungsi untuk memformat nilai hektar agar lebih mudah dibaca dan konsisten
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return `${numberValue.toLocaleString("id-ID", { // Format angka dengan 2 desimal
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ha`;
}


function setWidth(element, value) {   // Fungsi untuk mengatur lebar elemen berdasarkan nilai persentase yang diberikan
  if (!element) return;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  element.style.width = safeValue + "%";
}

function updateModelMetricCard(data) {  // Fungsi untuk memperbarui informasi metrik model pada card dashboard berdasarkan data yang diberikan
  if (!data || !data.available) {
    if (modelAccuracyCircle) {
      modelAccuracyCircle.style.background = `conic-gradient(#1f73d6 0 0%, #e9eef7 0% 100%)`;
    }

    if (modelAccuracyText) modelAccuracyText.textContent = "-";
    if (accuracyLine) accuracyLine.textContent = "-";
    if (kappaLine) kappaLine.textContent = "-";
    if (precisionLine) precisionLine.textContent = "-";
    if (recallLine) recallLine.textContent = "-";
    if (f1Line) f1Line.textContent = "-";

    if (accuracyModelLine) {
      accuracyModelLine.textContent = data?.model ? `Model: ${data.model}` : "Model: -";
    }

    if (accuracyNoteLine) {
      accuracyNoteLine.textContent = data?.note || "Pilih kombinasi parameter untuk melihat evaluasi model.";
    }

    return;
  }

  const accuracyPercent = data.accuracy * 100;

  if (modelAccuracyCircle) {
    modelAccuracyCircle.style.background = `conic-gradient(#1f73d6 0 ${accuracyPercent}%, #e9eef7 ${accuracyPercent}% 100%)`;
  }

  if (modelAccuracyText) {
    modelAccuracyText.textContent = formatEvaluationDecimal(data.accuracy, 2);
  }

  if (accuracyLine) {
    accuracyLine.textContent = formatEvaluationDecimal(data.accuracy, 2);
  }

  if (kappaLine) {
    kappaLine.textContent = formatEvaluationDecimal(data.kappa, 2);
  }

  if (precisionLine) {
    precisionLine.textContent = formatEvaluationDecimal(data.precision, 2);
  }

  if (recallLine) {
    recallLine.textContent = formatEvaluationDecimal(data.recall, 2);
  }

  if (f1Line) {
    f1Line.textContent = formatEvaluationDecimal(data.f1, 2);
  }

  if (accuracyModelLine) {
    accuracyModelLine.textContent = `Model: ${data.model}`;
  }

  if (accuracyNoteLine) {
    accuracyNoteLine.textContent = data.note || "-";
  }
}

function updateFeatureImportanceCard(info) {
  if (!info) {
    setWidth(barSlope, 0);
    setWidth(barRain, 0);
    setWidth(barLandcover, 0);
    if (barSlopeText) barSlopeText.textContent = "-";
    if (barRainText) barRainText.textContent = "-";
    if (barLandcoverText) barLandcoverText.textContent = "-";
    return;
  }

  const slopeVal = info.importanceSlopePercent ?? (chkSlope?.checked ? 100 : 0);
  const rainVal = info.importanceRainPercent ?? (chkRain?.checked ? 100 : 0);
  const landVal = info.importanceLandcoverPercent ?? (chkLandcover?.checked ? 100 : 0);

  setWidth(barSlope, slopeVal);
  setWidth(barRain, rainVal);
  setWidth(barLandcover, landVal);

  if (barSlopeText) barSlopeText.textContent = formatPercent(slopeVal);
  if (barRainText) barRainText.textContent = formatPercent(rainVal);
  if (barLandcoverText) barLandcoverText.textContent = formatPercent(landVal);
}

function resetRiskStatisticCard() { // Fungsi untuk mereset informasi statistik risiko pada card dashboard ke nilai default
  if (statSafe) statSafe.textContent = "-";
  if (statMedium) statMedium.textContent = "-";
  if (statHigh) statHigh.textContent = "-";

  if (statSafeArea) statSafeArea.textContent = "-";
  if (statMediumArea) statMediumArea.textContent = "-";
  if (statHighArea) statHighArea.textContent = "-";

  if (statLow) statLow.textContent = "-";
  if (statVeryHigh) statVeryHigh.textContent = "-";
  if (totalAreaText) totalAreaText.textContent = "-";

  if (riskDonut) {
    riskDonut.style.background = "#e5e7eb";
  }
}

function setRiskDonut(aman, sedang, rawan) {  // Fungsi untuk memperbarui tampilan donut chart risiko berdasarkan persentase aman, sedang, dan rawan
  const batasAman = aman;
  const batasSedang = aman + sedang;

  if (riskDonut) {
    riskDonut.style.background = `conic-gradient(
      var(--safe) 0 ${batasAman}%,
      var(--medium) ${batasAman}% ${batasSedang}%,
      var(--danger) ${batasSedang}% 100%
    )`;
  }
}

function updateRiskStatisticCard(info) {  // Fungsi untuk memperbarui informasi statistik risiko pada card dashboard berdasarkan data yang diberikan
  if (!info) {
    resetRiskStatisticCard();
    return;
  }

  const aman = Number(info.persenAman || 0);
  const sedang = Number(info.persenRawanSedang || 0);
  const rawan = Number(info.persenRawanTinggi || 0);

  setRiskDonut(aman, sedang, rawan);

  if (statSafe) statSafe.textContent = formatPercent(aman);
  if (statMedium) statMedium.textContent = formatPercent(sedang);
  if (statHigh) statHigh.textContent = formatPercent(rawan);

  if (statSafeArea) statSafeArea.textContent = "Menghitung...";
  if (statMediumArea) statMediumArea.textContent = "Menghitung...";
  if (statHighArea) statHighArea.textContent = "Menghitung...";

  if (statLow) statLow.textContent = "";
  if (statVeryHigh) statVeryHigh.textContent = "";
  if (totalAreaText) totalAreaText.textContent = "Menghitung...";
}

function updateRiskStatisticCardFromApi(data) { // Fungsi untuk memperbarui informasi statistik risiko pada card dashboard berdasarkan data yang diperoleh dari backend API
  if (!data || !data.kelas) {
    resetRiskStatisticCard();
    return;
  }

  const aman = data.kelas.aman || {};
  const sedang = data.kelas.sedang || {};
  const rawan = data.kelas.rawan || {};

  const persenAman = Number(aman.persen || 0);
  const persenSedang = Number(sedang.persen || 0);
  const persenRawan = Number(rawan.persen || 0);

  setRiskDonut(persenAman, persenSedang, persenRawan);

  if (statSafe) statSafe.textContent = formatPercent(persenAman);
  if (statMedium) statMedium.textContent = formatPercent(persenSedang);
  if (statHigh) statHigh.textContent = formatPercent(persenRawan);

  if (statSafeArea) statSafeArea.textContent = formatHa(aman.luas_ha);
  if (statMediumArea) statMediumArea.textContent = formatHa(sedang.luas_ha);
  if (statHighArea) statHighArea.textContent = formatHa(rawan.luas_ha);

  if (statLow) statLow.textContent = "";
  if (statVeryHigh) statVeryHigh.textContent = "";

  if (totalAreaText) {
    totalAreaText.textContent = formatHa(data.total?.luas_ha);
  }
}

async function fetchAreaStatsFromBackend() {  // Fungsi untuk mengambil data statistik area dari backend API berdasarkan layer yang dipilih (penting)
  const selectedLayer = getSelectedAreaStatsLayer();

  if (!selectedLayer) {
    resetRiskStatisticCard();
    return;
  }

  try {
    const url = `${GEE_API_BASE_URL}/api/area-stats?layer=${encodeURIComponent(selectedLayer)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      console.error("Gagal mengambil statistik luas:", result.message || result.detail || result);
      resetRiskStatisticCard();
      return;
    }

    updateRiskStatisticCardFromApi(result);
  } catch (error) {
    console.error("Error fetch statistik luas dari backend:", error);
    resetRiskStatisticCard();
  }
}

function resetLocationPanel() {
  if (detailLatLon) detailLatLon.textContent = "Lat: - , Lon: -";
  if (detailStatus) detailStatus.textContent = "-";
  if (detailSlope) detailSlope.textContent = "-";
  if (detailRain) detailRain.textContent = "-";
  if (detailLandcover) detailLandcover.textContent = "-";
  if (detailScore) detailScore.textContent = "-";

  if (detailDesc) {
    detailDesc.textContent = "Pilih parameter analisis terlebih dahulu.";
  }
}

function updateLocationPanel(sourceData = null, latlng = null) {
  const selectedLayer = getSelectedAreaStatsLayer();
  const info = getDashboardInfoByCheckbox();

  if (!selectedLayer || !info || !isDashboardInfoFilled(info)) {
    resetLocationPanel();
    return;
  }

  const company = sourceData || null;
  const targetLatLng = latlng || (company ? L.latLng(company.coords[0], company.coords[1]) : null);

  if (targetLatLng) {
    lastFocusedLatLng = targetLatLng;
    if (detailLatLon) {
      detailLatLon.textContent = `Lat: ${targetLatLng.lat.toFixed(5)} , Lon: ${targetLatLng.lng.toFixed(5)}`;
    }
  }

  const status = info?.statusWilayah || "-";
  if (detailStatus) detailStatus.textContent = String(status).toUpperCase();
  if (detailSlope) detailSlope.textContent = info?.skorSlope ? Number(info.skorSlope).toFixed(2) : "-";
  if (detailRain) detailRain.textContent = info?.skorRain ? Number(info.skorRain).toFixed(2) : "-";
  if (detailLandcover) detailLandcover.textContent = info?.skorLandcover ? Number(info.skorLandcover).toFixed(2) : "-";
  if (detailScore) detailScore.textContent = "-";
  if (detailDesc) {
    detailDesc.textContent = info?.imbauan || "Pilih layer atau klik lokasi pada peta untuk melihat ringkasan informasi.";
  }
}

function applyLayerOpacity() {
  const value = Number(mainOpacityRange?.value || rfOpacityRange?.value || 70) / 100;
  const label = Math.round(value * 100) + "%";

  if (opacityValue) opacityValue.textContent = label;

  [
    slopeLayer,
    rainLayer,
    landcoverLayer,
    slopeRainLayer,
    slopeLandcoverLayer,
    rainLandcoverLayer,
    rfLayer
  ].forEach(layer => {
    if (layer && typeof layer.setOpacity === "function") {
      layer.setOpacity(value);
    }
  });
}

function setBasemap(type) {
  if (!map || !osmBaseLayer || !satelliteBaseLayer) return;

  if (map.hasLayer(osmBaseLayer)) map.removeLayer(osmBaseLayer);
  if (map.hasLayer(satelliteBaseLayer)) map.removeLayer(satelliteBaseLayer);

  if (type === "osm") {
    osmBaseLayer.addTo(map);
    osmBtn?.classList.add("active");
    satelliteBtn?.classList.remove("active");
  } else {
    satelliteBaseLayer.addTo(map);
    satelliteBtn?.classList.add("active");
    osmBtn?.classList.remove("active");
  }
}

function focusSelectedCompany() {
  const company = selectedCompanyData();
  if (!map || !company) return;

  const latlng = L.latLng(company.coords[0], company.coords[1]);
  lastFocusedLatLng = latlng;
  map.setView(latlng, 15);
  updateLocationPanel(company, latlng);
}

function initRedesignControls() {
  updateLocationPanel(null);
  updateFeatureImportanceCard(getDashboardInfoByCheckbox());
  updateRiskStatisticCard(getDashboardInfoByCheckbox());
  fetchAreaStatsFromBackend();
  applyLayerOpacity();
}

companySelect?.addEventListener("change", focusSelectedCompany);
focusMineBtn?.addEventListener("click", focusSelectedCompany);
resetMapBtn?.addEventListener("click", () => {
  backToDefaultView();
  if (villageMarkerLayer) villageMarkerLayer.clearLayers();
  updateLocationPanel(null);
});

mainOpacityRange?.addEventListener("input", () => {
  if (rfOpacityRange) rfOpacityRange.value = mainOpacityRange.value;
  applyLayerOpacity();
});

rfOpacityRange?.addEventListener("input", () => {
  if (mainOpacityRange) mainOpacityRange.value = rfOpacityRange.value;
  applyLayerOpacity();
});

osmBtn?.addEventListener("click", () => setBasemap("osm"));
satelliteBtn?.addEventListener("click", () => setBasemap("satellite"));
closeInfoBtn?.addEventListener("click", () => {
  document.querySelector(".location-card")?.classList.toggle("is-hidden");
});
zoomLocationBtn?.addEventListener("click", () => {
  if (map && lastFocusedLatLng) map.setView(lastFocusedLatLng, 15);
});


// =======================================================
// 23. JALANKAN MAP SAAT DASHBOARD DIBUKA
// =======================================================

window.addEventListener("load", () => {
  initMap();

  if (chkSlope) chkSlope.checked = false;
  if (chkRain) chkRain.checked = false;
  if (chkLandcover) chkLandcover.checked = false;
  if (chkRF) chkRF.checked = false;
  if (chkBoundaryKab) chkBoundaryKab.checked = true;
  if (chkBoundaryKec) chkBoundaryKec.checked = true;

  resetLayers();
  updateLayer();
  updateAccuracy();
  updateDashboardCards();
  initRedesignControls();
});