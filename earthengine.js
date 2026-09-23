const ee = require("@google/earthengine"); // Pastikan Anda telah menginstal paket @google/earthengine
const fs = require("fs"); // Modul file system untuk membaca file JSON service account
const path = require("path"); // Modul path untuk menangani jalur file
require("dotenv").config({ quiet: true }); // Memuat variabel lingkungan dari file .env jika ada

let isInitialized = false;  // Menandai apakah Earth Engine telah diinisialisasi
let initializingPromise = null; // Menyimpan promise inisialisasi untuk mencegah inisialisasi ganda
let cachedServiceAccountEmail = null; // Menyimpan email service account yang dibaca dari file JSON

function resolveKeyPath() { // Fungsi untuk menentukan jalur file service account JSON
  const keyFile = process.env.GEE_KEY_FILE || "./service-account-key.json"; // Gunakan variabel lingkungan GEE_KEY_FILE jika tersedia, jika tidak gunakan default
  return path.isAbsolute(keyFile) ? keyFile : path.join(__dirname, keyFile); // Jika jalur relatif, gabungkan dengan direktori saat ini
} // Fungsi untuk membaca dan memvalidasi file service account JSON

function readPrivateKey() {   // Fungsi untuk membaca dan memvalidasi file service account JSON
  const keyPath = resolveKeyPath(); // Dapatkan jalur file service account JSON

  if (!fs.existsSync(keyPath)) { // Periksa apakah file service account ada
    throw new Error(    // Jika file tidak ada, lempar error dengan pesan yang jelas
      `File service account tidak ditemukan: ${keyPath}. ` + // Pesan error yang jelas jika file service account tidak ditemukan
      `Buat/download key JSON dari Google Cloud, lalu simpan dengan nama service-account-key.json di folder project.`  // Pesan error yang jelas jika file service account tidak ditemukan
    );
  } // Periksa apakah file service account ada

  const stat = fs.statSync(keyPath);  // Dapatkan informasi file untuk memeriksa ukuran file
  if (stat.size === 0) {
    throw new Error(
      `File service account ditemukan tetapi masih kosong: ${keyPath}. ` +
      `Isi file harus berupa JSON asli dari Google Cloud Service Account, bukan file kosong.`
    );
  }

  let privateKey;
  try {
    privateKey = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } catch (error) {
    throw new Error(
      `File service account bukan JSON valid: ${keyPath}. ` +
      `Download ulang key JSON dari Google Cloud Service Account. Detail: ${error.message}`
    );
  }

  if (!privateKey.client_email || !privateKey.private_key) {
    throw new Error(
      `File service account tidak lengkap. Pastikan file JSON memiliki client_email dan private_key.`
    );
  }

  cachedServiceAccountEmail = privateKey.client_email;
  return privateKey;
}

function initializeEarthEngine() {  // Fungsi untuk menginisialisasi Google Earth Engine dengan service account
  if (isInitialized) {
    return Promise.resolve();
  }

  if (initializingPromise) {
    return initializingPromise;
  }

  initializingPromise = new Promise((resolve, reject) => {
    try {
      const privateKey = readPrivateKey();

      ee.data.authenticateViaPrivateKey(
        privateKey,
        () => {
          ee.initialize(
            null,
            null,
            () => {
              isInitialized = true;
              console.log("Google Earth Engine berhasil terhubung.");
              resolve();
            },
            (error) => {
              initializingPromise = null;
              reject(new Error(`Gagal initialize Google Earth Engine: ${error.message || error}`));
            },
            null,
            process.env.GEE_PROJECT_ID || null
          );
        },
        (error) => {
          initializingPromise = null;
          reject(new Error(`Gagal autentikasi service account GEE: ${error.message || error}`));
        }
      );
    } catch (error) {
      initializingPromise = null;
      reject(error);
    }
  });

  return initializingPromise;
}

function evaluateEeObject(eeObject) { // Fungsi untuk mengevaluasi objek Earth Engine dan mengembalikan hasilnya sebagai Promise
  return new Promise((resolve, reject) => {
    eeObject.evaluate((result, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getConfigStatus() {  // Fungsi untuk mendapatkan status konfigurasi service account dan GEE
  const keyPath = resolveKeyPath();
  const keyExists = fs.existsSync(keyPath);
  const keySize = keyExists ? fs.statSync(keyPath).size : 0;

  return {
    key_path: keyPath,
    key_exists: keyExists,
    key_size_bytes: keySize,
    key_is_empty: keyExists && keySize === 0,
    service_account_email: cachedServiceAccountEmail,
    gee_asset: process.env.GEE_RF_ASSET || null,
    gee_band: process.env.GEE_RF_BAND || "0",
    gee_scale: Number(process.env.GEE_SCALE || 30),
    gee_project_id: process.env.GEE_PROJECT_ID || null,
    initialized: isInitialized,
  };
}

module.exports = {
  ee,
  initializeEarthEngine,
  evaluateEeObject,
  getConfigStatus,
};
