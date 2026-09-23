// =======================================================
// SERVER.JS
// Backend API Web GIS Google Earth Engine
// Membaca nilai titik dan tile dari 7 asset GEE
// Aturan FINAL:
// - Random Forest: 0 = Aman, 1 = Sedang, 2 = Tinggi
// - Parameter dasar: 1 = Aman, 2 = Sedang, 3 = Tinggi
// =======================================================

const express = require("express");   // Import library Express untuk membuat server web
const cors = require("cors"); // Import library CORS untuk mengizinkan permintaan dari domain lain
const fs = require("fs"); // Import library File System untuk membaca file
const path = require("path"); // Import library Path untuk mengelola path file
require("dotenv").config(); // Memuat variabel lingkungan dari file .env jika ada

const { // Import fungsi dan objek dari file earthengine.js
  ee,
  initializeEarthEngine,
  evaluateEeObject,
} = require("./earthengine");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SCALE = Number(process.env.GEE_SCALE || 30);

// =======================================================
// 1. KONFIGURASI 7 ASSET GEE
// =======================================================

const LAYER_CONFIG = {
  rain_class: {
    label: "Curah Hujan",
    type: "parameter",
    asset: process.env.GEE_RAIN_CLASS_ASSET, // Asset GEE untuk klasifikasi curah hujan
    band: process.env.GEE_RAIN_CLASS_BAND || "0",
    outputBand: "rain_class",
    classMap: {
      1: "aman",
      2: "sedang",
      3: "rawan",
    },
  },

  slope_class: {
    label: "Kemiringan Lereng",
    type: "parameter",
    asset: process.env.GEE_SLOPE_CLASS_ASSET, // Asset GEE untuk klasifikasi kemiringan lereng
    band: process.env.GEE_SLOPE_CLASS_BAND || "0",
    outputBand: "slope_class",
    classMap: {
      1: "aman",
      2: "sedang",
      3: "rawan",
    },
  },

  landcover_class: {
    label: "Tutupan Lahan",
    type: "parameter",
    asset: process.env.GEE_LANDCOVER_CLASS_ASSET, // Asset GEE untuk klasifikasi tutupan lahan
    band: process.env.GEE_LANDCOVER_CLASS_BAND || "0",
    outputBand: "landcover_class",
    classMap: {
      1: "aman",
      2: "sedang",
      3: "rawan",
    },
  },

  rf_all: {
    label: "Random Forest Semua Parameter",
    type: "rf",
    asset: process.env.GEE_RF_ALL_ASSET, // Asset GEE untuk model Random Forest semua parameter
    band: process.env.GEE_RF_ALL_BAND || "0",
    outputBand: "rf_all",
    classMap: {
      0: "aman",
      1: "sedang",
      2: "rawan",
    },
  },

  rf_slope_rain: {
    label: "Random Forest Slope + Rain",
    type: "rf",
    asset: process.env.GEE_RF_SLOPE_RAIN_ASSET, // Asset GEE untuk model Random Forest Slope + Rain
    band: process.env.GEE_RF_SLOPE_RAIN_BAND || "0",
    outputBand: "rf_slope_rain",
    classMap: {
      0: "aman",
      1: "sedang",
      2: "rawan",
    },
  },

  rf_slope_landcover: {
    label: "Random Forest Slope + Landcover",
    type: "rf",
    asset: process.env.GEE_RF_SLOPE_LANDCOVER_ASSET, // Asset GEE untuk model Random Forest Slope + Landcover
    band: process.env.GEE_RF_SLOPE_LANDCOVER_BAND || "0",
    outputBand: "rf_slope_landcover",
    classMap: {
      0: "aman",
      1: "sedang",
      2: "rawan",
    },
  },

  rf_rain_landcover: {
    label: "Random Forest Rain + Landcover",
    type: "rf",
    asset: process.env.GEE_RF_RAIN_LANDCOVER_ASSET, // Asset GEE untuk model Random Forest Rain + Landcover
    band: process.env.GEE_RF_RAIN_LANDCOVER_BAND || "0",
    outputBand: "rf_rain_landcover",
    classMap: {
      0: "aman",
      1: "sedang",
      2: "rawan",
    },
  },
};

// =======================================================
// 2. FUNGSI BANTUAN
// =======================================================

function isAssetConfigured(asset) {
  const value = String(asset || "").trim();

  return (
    value.length > 0 &&
    !value.includes("GANTI_DENGAN") &&
    !value.includes("NAMA_ASSET") &&
    !value.includes("undefined")
  );
}

function selectBandValue(bandConfig) {
  const value = String(bandConfig || "0").trim();

  if (/^\d+$/.test(value)) {
    return [Number(value)];
  }

  return value;
}

function getParameterClassLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "Tidak ada data";
  }

  const nilai = Number(value);

  if (!Number.isFinite(nilai)) {
    return "Tidak ada data";
  }

  if (nilai === 1) return "Aman";
  if (nilai === 2) return "Sedang";
  if (nilai === 3) return "Tinggi";

  return "Tidak ada data";
}

function getRfClassLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "Tidak ada data";
  }

  const nilai = Number(value);

  if (!Number.isFinite(nilai)) {
    return "Tidak ada data";
  }

  if (nilai === 0) return "Aman";
  if (nilai === 1) return "Sedang";
  if (nilai === 2) return "Tinggi";

  return "Tidak ada data";
}

function getOutputBandMap() {
  const outputBandMap = {};

  Object.keys(LAYER_CONFIG).forEach((key) => {
    const config = LAYER_CONFIG[key];
    outputBandMap[config.outputBand] = config;
  });

  return outputBandMap;
}

function getLayerAliases() {
  return {
    slope: "slope_class",
    rain: "rain_class",
    landcover: "landcover_class",
    slope_rain: "rf_slope_rain",
    slope_landcover: "rf_slope_landcover",
    rain_landcover: "rf_rain_landcover",
    all: "rf_all",
    rf: "rf_all",
  };
}

function resolveLayerKey(layerKey) {
  const value = String(layerKey || "").trim();

  if (LAYER_CONFIG[value]) {
    return value;
  }

  const aliases = getLayerAliases();
  return aliases[value] || null;
}

function getClassNameFromConfig(config, value) {
  const nilai = Number(value);

  if (!Number.isFinite(nilai)) {
    return null;
  }

  return config?.classMap?.[nilai] || null;
}

function getReadableClassLabel(className) {
  if (className === "aman") return "Aman";
  if (className === "sedang") return "Sedang";
  if (className === "rawan") return "Rawan";

  return "Tidak ada data";
}

function getKeteranganByClass(className, layerLabel, layerType) { // Fungsi untuk mendapatkan keterangan berdasarkan kelas, label layer, dan tipe layer
  const sumberData =
    layerType === "rf"
      ? "hasil klasifikasi Random Forest"
      : "parameter dasar";

  if (className === "aman") {
    return `Titik ini berada pada kelas Aman berdasarkan ${sumberData} ${layerLabel}. Area ini relatif aman terhadap potensi kerawanan, namun tetap perlu dilakukan pemantauan kondisi wilayah secara berkala.`;
  }

  if (className === "sedang") {
    return `Titik ini berada pada kelas Sedang berdasarkan ${sumberData} ${layerLabel}. Area ini memerlukan perhatian karena memiliki tingkat kerawanan menengah dan perlu dipantau terutama saat terjadi perubahan kondisi lingkungan.`;
  }

  if (className === "rawan") {
    return `Titik ini berada pada kelas Rawan berdasarkan ${sumberData} ${layerLabel}. Area ini perlu mendapat perhatian lebih karena memiliki potensi kerawanan tinggi terhadap dampak aktivitas pertambangan.`;
  }

  return "Tidak ada data pada titik ini. Titik kemungkinan berada di luar cakupan layer atau area studi.";
}



function getImageFromConfig(config) { // Fungsi untuk mendapatkan objek citra (image) dari konfigurasi layer
  if (!isAssetConfigured(config.asset)) {
    throw new Error(
      `Asset untuk ${config.outputBand} belum diisi dengan benar di file .env`
    );
  }

  return ee
    .Image(config.asset)
    .select(selectBandValue(config.band))
    .rename(config.outputBand);
}

function buildAllAssetStack() { // Fungsi untuk membangun tumpukan citra (image stack) dari semua asset GEE yang valid
  let stack = null;
  const skippedLayers = [];

  Object.keys(LAYER_CONFIG).forEach((key) => {
    const config = LAYER_CONFIG[key];

    if (!isAssetConfigured(config.asset)) {
      skippedLayers.push(key);
      return;
    }

    const image = getImageFromConfig(config);

    if (stack === null) {
      stack = image;
    } else {
      stack = stack.addBands(image);
    }
  });

  if (stack === null) {
    throw new Error("Tidak ada asset GEE yang valid. Periksa isi file .env.");
  }

  return {
    stack,
    skippedLayers,
  };
}

function getVisParamsByLayer(layerKey) {  // Fungsi untuk mendapatkan parameter visualisasi (visParams) berdasarkan layer yang dipilih
  const config = LAYER_CONFIG[layerKey];

  if (!config) {
    return null;
  }

  if (config.type === "parameter") {
    return {
      min: 1,
      max: 3,
      palette: [
        "00FF00", // 1 = Aman
        "FFFF00", // 2 = Sedang
        "FF0000", // 3 = Tinggi
      ],
    };
  }

  return {
    min: 0,
    max: 2,
    palette: [
      "00FF00", // 0 = Aman
      "FFFF00", // 1 = Sedang
      "FF0000", // 2 = Tinggi
    ],
  };
}

function getTileUrl(image, visParams) { // Fungsi untuk mendapatkan URL tile dari citra (image) dan parameter visualisasi (visParams)
  return new Promise((resolve, reject) => {
    image.getMapId(visParams, (map, error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(map.urlFormat);
    });
  });
}

function readServiceAccountStatus() { // Fungsi untuk membaca status file service account dan mengembalikan informasi terkait
  const keyFile = process.env.GEE_KEY_FILE || "./service-account-key.json";
  const keyPath = path.resolve(keyFile);

  let keyExists = false;
  let keyIsEmpty = true;
  let keySize = 0;
  let clientEmail = null;
  let jsonValid = false;

  try {
    keyExists = fs.existsSync(keyPath);

    if (keyExists) {
      const fileContent = fs.readFileSync(keyPath, "utf8");
      keySize = Buffer.byteLength(fileContent, "utf8");
      keyIsEmpty = fileContent.trim().length === 0;

      if (!keyIsEmpty) {
        try {
          const json = JSON.parse(fileContent);
          clientEmail = json.client_email || null;
          jsonValid = Boolean(json.client_email && json.private_key);
        } catch (error) {
          clientEmail = "File JSON tidak valid";
          jsonValid = false;
        }
      }
    }
  } catch (error) {
    clientEmail = "Gagal membaca file key";
  }

  return {
    key_path: keyPath,
    key_exists: keyExists,
    key_is_empty: keyIsEmpty,
    key_size_bytes: keySize,
    json_valid: jsonValid,
    client_email: clientEmail,
  };
}

// =======================================================
// 3. ROUTE UTAMA
// =======================================================

app.get("/", (req, res) => {  // Endpoint utama untuk memeriksa status backend API Web GIS Google Earth Engine (penting)
  res.json({
    status: "success",
    message: "Backend API Web GIS Google Earth Engine aktif.",
    endpoints: [
      "/api/status",
      "/api/debug-assets",
      "/api/tile/rf_all",
      "/api/area-stats?layer=rf_all",
      "/api/identify?lat=-4.4078&lng=122.3755&layer=all",
      "/api/identify?lat=-4.4078&lng=122.3755&layer=rf_all",
    ],
  });
});

// =======================================================
// 4. CEK STATUS BACKEND
// =======================================================

app.get("/api/status", (req, res) => {  // Endpoint untuk memeriksa status backend API, termasuk port, skala GEE, konfigurasi layer, dan status service account
  res.json({
    status: "success",
    message: "Backend API aktif.",
    port: PORT,
    gee_scale: SCALE,
    mapping: {
      parameter: {
        1: "Aman",
        2: "Sedang",
        3: "Tinggi",
      },
      random_forest: {
        0: "Aman",
        1: "Sedang",
        2: "Tinggi",
      },
    },
    service_account: readServiceAccountStatus(),  // Informasi terkait service account GEE, termasuk path file, keberadaan file, ukuran file, validitas JSON, dan email client
    layers: Object.keys(LAYER_CONFIG).map((key) => ({
      key,
      label: LAYER_CONFIG[key].label,
      type: LAYER_CONFIG[key].type,
      asset: LAYER_CONFIG[key].asset || null,
      asset_configured: isAssetConfigured(LAYER_CONFIG[key].asset),
      band: LAYER_CONFIG[key].band,
      outputBand: LAYER_CONFIG[key].outputBand,
    })),
  });
});

// =======================================================
// 5. DEBUG SEMUA ASSET GEE
// =======================================================

app.get("/api/debug-assets", async (req, res) => {  // Endpoint untuk memeriksa semua asset GEE yang dikonfigurasi, termasuk status keberadaan asset, nama band, dan informasi terkait
  try {
    await initializeEarthEngine();

    const results = {};

    for (const key of Object.keys(LAYER_CONFIG)) {
      const config = LAYER_CONFIG[key];

      if (!isAssetConfigured(config.asset)) {
        results[key] = {
          status: "error",
          label: config.label,
          message: "Asset belum diisi dengan benar di file .env",
          asset: config.asset || null,
        };
        continue;
      }

      try {
        const image = ee.Image(config.asset);
        const bandNames = await evaluateEeObject(image.bandNames());

        results[key] = {
          status: "success",
          label: config.label,
          type: config.type,
          asset: config.asset,
          band_setting: config.band,
          output_band: config.outputBand,
          band_names: bandNames,
        };
      } catch (error) {
        results[key] = {
          status: "error",
          label: config.label,
          type: config.type,
          asset: config.asset,
          detail: error.message,
        };
      }
    }

    res.json({
      status: "success",
      message: "Hasil pengecekan asset GEE.",
      results,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengecek asset GEE.",
      detail: error.message,
      service_account: readServiceAccountStatus(),
    });
  }
});

// =======================================================
// 6. TILE URL DARI ASSET GEE
// =======================================================
// Endpoint ini membuat tile peta dari asset yang sama dengan identify.
// Tujuannya agar warna peta dan nilai popup selalu sinkron.
// Contoh: /api/tile/rf_all

app.get("/api/tile/:layer", async (req, res) => { // Endpoint untuk membuat tile peta dari asset GEE berdasarkan layer yang dipilih, sehingga warna peta dan nilai popup selalu sinkron
  try {
    await initializeEarthEngine();

    const layerKey = req.params.layer;
    const config = LAYER_CONFIG[layerKey];

    if (!config) {
      return res.status(400).json({
        status: "error",
        message: "Layer tidak dikenali.",
        layer_yang_dikirim: layerKey,
        layer_tersedia: Object.keys(LAYER_CONFIG),
      });
    }

    const image = getImageFromConfig(config);
    const visParams = getVisParamsByLayer(layerKey);
    const tileUrl = await getTileUrl(image, visParams);

    res.json({
      status: "success",
      layer: layerKey,
      label: config.label,
      type: config.type,
      asset: config.asset,
      band: config.band,
      visParams,
      tile_url: tileUrl,
      catatan:
        config.type === "rf"
          ? "Tile RF memakai mapping 0=Aman, 1=Sedang, 2=Tinggi."
          : "Tile parameter memakai mapping 1=Aman, 2=Sedang, 3=Tinggi.",
    });
  } catch (error) {
    console.error("Error /api/tile:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal membuat tile URL dari Google Earth Engine.",
      detail: error.message,
      solusi: [
        "Pastikan service-account-key.json ada dan valid.",
        "Pastikan asset GEE sudah di-share ke service account sebagai Reader.",
        "Pastikan asset di file .env sudah benar.",
      ],
    });
  }
});


// =======================================================
// 7. STATISTIK LUAS AREA BERDASARKAN KELAS
// =======================================================
// Contoh:
// /api/area-stats?layer=slope_class
// /api/area-stats?layer=rf_all
// Mapping parameter dasar: 1=Aman, 2=Sedang, 3=Rawan
// Mapping Random Forest: 0=Aman, 1=Sedang, 2=Rawan

app.get("/api/area-stats", async (req, res) => {  // Endpoint untuk menghitung statistik luas area berdasarkan kelas dari asset GEE yang dipilih, dengan parameter layer yang dikirim melalui query string
  try {
    await initializeEarthEngine();

    const requestedLayer = req.query.layer || "rf_all";
    const layerKey = resolveLayerKey(requestedLayer);
    const config = layerKey ? LAYER_CONFIG[layerKey] : null;

    if (!config) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Layer tidak dikenali.",
        layer_yang_dikirim: requestedLayer,
        layer_tersedia: Object.keys(LAYER_CONFIG),
        alias_tersedia: Object.keys(getLayerAliases()),
      });
    }

    if (!isAssetConfigured(config.asset)) {
      return res.status(500).json({
        status: "error",
        success: false,
        message: `Asset untuk ${layerKey} belum diisi dengan benar di file .env`,
      });
    }

    const classImage = getImageFromConfig(config).toInt();
    let geometry = classImage.geometry();

    const areaAsset = process.env.GEE_AREA_STUDI_ASSET || process.env.GEE_AREA_STUDI;

    if (isAssetConfigured(areaAsset)) {
      geometry = ee.FeatureCollection(areaAsset).geometry();
    }

    const areaImage = ee.Image.pixelArea()
      .rename("area_m2")
      .updateMask(classImage.mask())
      .addBands(classImage.rename("kelas"));

    const groupedArea = areaImage.reduceRegion({
      reducer: ee.Reducer.sum().group({
        groupField: 1,
        groupName: "kelas",
      }),
      geometry,
      scale: SCALE,
      maxPixels: 1e13,
      bestEffort: true,
      tileScale: 4,
    });

    const data = await evaluateEeObject(groupedArea);
    const groups = Array.isArray(data?.groups) ? data.groups : [];

    const luas = {
      aman: 0,
      sedang: 0,
      rawan: 0,
    };

    const rawGroups = groups.map((item) => {
      const kodeKelas = Number(item.kelas);
      const luasM2 = Number(item.sum || 0);
      const className = getClassNameFromConfig(config, kodeKelas);

      if (className && Object.prototype.hasOwnProperty.call(luas, className)) {
        luas[className] += luasM2;
      }

      return {
        kode_kelas: kodeKelas,
        kelas_terbaca: getReadableClassLabel(className),
        luas_m2: luasM2,
        luas_ha: luasM2 / 10000,
      };
    });

    const totalM2 = luas.aman + luas.sedang + luas.rawan;
    const toHa = (value) => value / 10000;
    const toPercent = (value) => {
      if (!totalM2 || totalM2 <= 0) return 0;
      return (value / totalM2) * 100;
    };

    res.json({
      status: "success",
      success: true,
      layer: layerKey,
      requested_layer: requestedLayer,
      label: config.label,
      type: config.type,
      mapping:
        config.type === "rf"
          ? "RF: 0=Aman, 1=Sedang, 2=Rawan"
          : "Parameter dasar: 1=Aman, 2=Sedang, 3=Rawan",
      kelas: {
        aman: {
          label: "Aman",
          luas_m2: luas.aman,
          luas_ha: toHa(luas.aman),
          persen: toPercent(luas.aman),
        },
        sedang: {
          label: "Sedang",
          luas_m2: luas.sedang,
          luas_ha: toHa(luas.sedang),
          persen: toPercent(luas.sedang),
        },
        rawan: {
          label: "Rawan",
          luas_m2: luas.rawan,
          luas_ha: toHa(luas.rawan),
          persen: toPercent(luas.rawan),
        },
      },
      total: {
        luas_m2: totalM2,
        luas_ha: toHa(totalM2),
      },
      raw_groups: rawGroups,
      scale: SCALE,
      area_asset: isAssetConfigured(areaAsset) ? areaAsset : null,
      catatan:
        "Luas dihitung dari pixelArea Google Earth Engine, lalu dikelompokkan berdasarkan mapping kelas masing-masing layer.",
    });
  } catch (error) {
    console.error("Error /api/area-stats:", error);

    res.status(500).json({
      status: "error",
      success: false,
      message: "Gagal menghitung statistik luas area dari Google Earth Engine.",
      detail: error.message,
      solusi: [
        "Pastikan backend Node.js berjalan.",
        "Pastikan service-account-key.json valid.",
        "Pastikan asset GEE sudah di-share ke service account sebagai Reader.",
        "Pastikan GEE_AREA_STUDI_ASSET di .env benar, atau kosongkan agar memakai geometri asset layer.",
      ],
    });
  }
});

// =======================================================
// 8. IDENTIFY NILAI TITIK DARI GEE
// =======================================================
// Contoh:
// /api/identify?lat=-4.4078&lng=122.3755&layer=all
// /api/identify?lat=-4.4078&lng=122.3755&layer=rf_all

app.get("/api/identify", async (req, res) => { // Endpoint untuk membaca nilai titik dari asset GEE berdasarkan koordinat lat dan lng yang dikirim melalui query string, serta layer yang dipilih
  try {
    await initializeEarthEngine();

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const selectedLayer = req.query.layer || "all";

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        status: "error",
        message: "Parameter lat dan lng wajib diisi dengan angka.",
      });
    }

    const point = ee.Geometry.Point([lng, lat]);

    let imageToRead;
    let mode;
    let skippedLayers = [];

    if (selectedLayer === "all") {
      const builtStack = buildAllAssetStack();
      imageToRead = builtStack.stack;
      skippedLayers = builtStack.skippedLayers;
      mode = "all_layers";
    } else {
      const config = LAYER_CONFIG[selectedLayer];

      if (!config) {
        return res.status(400).json({
          status: "error",
          message: "Layer tidak dikenali.",
          layer_yang_dikirim: selectedLayer,
          layer_tersedia: Object.keys(LAYER_CONFIG),
        });
      }

      imageToRead = getImageFromConfig(config);
      mode = selectedLayer;
    }

    const nilaiTitik = imageToRead.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: SCALE,
      maxPixels: 1e13,
      bestEffort: true,
    });

    const result = await evaluateEeObject(nilaiTitik);

    const outputBandMap = getOutputBandMap();
    const responseData = {};

    Object.keys(result || {}).forEach((bandName) => {
  const config = outputBandMap[bandName];
  const nilai = result[bandName];

  let kelas = "Tidak ada data";

  if (config?.type === "rf") {
    kelas = getRfClassLabel(nilai);
  } else if (config?.type === "parameter") {
    kelas = getParameterClassLabel(nilai);
  }

  const className = getClassNameFromConfig(config, nilai);

  responseData[bandName] = {
    label: config?.label ?? bandName,
    tipe: config?.type ?? "unknown",
    nilai: nilai,
    kelas: kelas,
    class_name: className,
    keterangan: getKeteranganByClass(
      className,
      config?.label ?? bandName,
      config?.type ?? "unknown"
    ),
  };
});

    res.json({
      status: "success",
      mode,
      koordinat: {
        lat,
        lng,
      },
      data: responseData,
      raw: result,
      skipped_layers: skippedLayers,
      scale: SCALE,
      catatan:
        "Mapping RF: 0=Aman, 1=Sedang, 2=Tinggi. Mapping parameter dasar: 1=Aman, 2=Sedang, 3=Tinggi.",
    });
  } catch (error) {
    console.error("Error /api/identify:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal membaca nilai titik dari Google Earth Engine.",
      detail: error.message,
      solusi: [
        "Pastikan service-account-key.json ada dan bukan file kosong.",
        "Pastikan semua asset GEE sudah di-share ke email client_email sebagai Reader.",
        "Pastikan semua asset di file .env sudah benar.",
        "Pastikan nama band asset benar. Jika ragu, cek melalui /api/debug-assets.",
      ],
    });
  }
});

// =======================================================
// 8. JALANKAN SERVER
// =======================================================

app.listen(PORT, () => {  // Jalankan server pada port yang ditentukan, dan tampilkan informasi status di console
  console.log(`Server berjalan di http://localhost:${PORT}`); // Informasi URL server di console
  console.log(`Cek konfigurasi di http://localhost:${PORT}/api/status`);  // Informasi URL untuk memeriksa status backend API di console
});
