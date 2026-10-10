# Mini Paint — Proyek UTS 

Aplikasi menggambar ala Paint menggunakan **JavaScript + p5.js**, HTML, dan CSS.
Tidak perlu Java, Node.js, npm, atau database untuk menjalankannya.

Ide dasarnya sederhana: setiap gambar di kanvas disimpan sebagai **daftar objek yang bisa diedit ulang**.
Pengguna menggambar bentuk, mengimpor gambar, lalu memilih objek lama untuk digeser, diputar,
diperbesar, diubah warnanya, di-undo, dan diunduh sebagai PNG.

## Mulai di Windows

1. Ekstrak ZIP dengan **Extract All / Ekstrak Semua**.
2. Buka folder `p5-paint` hasil ekstraksi.
3. Klik dua kali **index.html**. Buka menggunakan Chrome atau Edge.
4. Pilih alat di sisi kiri, lalu klik dan tarik di kanvas. Untuk Titik, cukup klik.
5. Gunakan **Pilih**, kemudian klik objek untuk memindahkan atau mengubahnya.
HASIL :
<img width="1877" height="865" alt="image" src="https://github.com/user-attachments/assets/8c25e9e5-0ebc-4cc7-936c-9c132891ffb1" />


Library p5.js sudah disertakan di folder `vendor`, sehingga menggambar dan impor file lokal tidak memerlukan internet. Impor dari URL memerlukan internet dan izin CORS dari sumber gambar.

Jika browser membatasi operasi gambar ketika halaman dibuka sebagai file, buka folder ini di VS Code dan jalankan `index.html` melalui Live Server. GitHub Pages juga menjalankannya melalui HTTP/HTTPS.

## Fungsi web ini apa saja?

Tampilan dibagi tiga kolom: **panel alat (kiri)**, **kanvas (tengah)**, **inspector (kanan)**.

### 1. Panel alat — untuk membuat objek baru

Berisi 13 tombol: `Pilih`, `Kuas`, `Titik`, `Garis`, `Persegi pjg.`, `Persegi`, `Elips`,
`Lingkaran`, `Segitiga`, `Segiempat`, `Busur`, `Bézier`, dan `Kurva`.

Cara kerja umumnya sama: pilih alat, lalu klik dan tarik di kanvas untuk menentukan
posisi dan ukuran. Pengecualian:

- `Pilih (V)`: tidak menggambar, tetapi memilih dan menggeser objek yang sudah ada.
- `Titik`: cukup klik sekali, tidak perlu tarik.
- `Kuas`: tarik bebas seperti pensil, setiap gerakan mouse menambah titik.

Sembilan di antaranya adalah **seluruh primitive 2D p5.js**: Point, Line, Rect, Square,
Ellipse, Circle, Triangle, Quad, dan Arc. Tiga sisanya adalah tambahan: kuas bebas,
kurva Bézier (`bezier()`), dan kurva `curve()`.

Istilah "semua shape primitives" di soal diimplementasikan sebagai seluruh primitive **2D**,
sesuai aplikasi Paint. Primitive 3D WEBGL seperti box, sphere, dan torus tidak termasuk
cakupan aplikasi ini.

### 2. Kanvas tengah — tempat menggambar

Kanvas p5.js berukuran tetap **1200 × 800 px**, dengan latar putih. Setiap bentuk yang
dibuat langsung menjadi objek mandiri: bisa diklik lagi, dipindah, dan diubah walaupun
sudah lama dibuat — bukan sekadar coretan piksel yang menempel.

Di atas kanvas ada tombol `↶ Urungkan`, `↷ Ulangi`, dan `Bersihkan`.
Di bawahnya ada statusbar berisi petunjuk konteks dan jumlah objek (`0 objek`, `3 objek`, ...).
Jika kanvas masih kosong, muncul pesan "Mulai dari satu bentuk."

### 3. Inspector kanan — warna dan transformasi

Panel ini punya dua fungsi yang sering tertukar pemula:

- **Warna & garis** mengatur gaya. Ada warna isi, palet cepat (swatch), checkbox
  "Gunakan warna isi", warna garis, dan ketebalan garis (1–24 px).
  Aturannya: kalau ada objek terpilih, yang berubah adalah **objek terpilih** itu.
  Kalau tidak ada yang terpilih (tekan `Esc` atau klik area kosong), yang berubah adalah
  **gaya untuk objek baru berikutnya**. Label di panel ("Objek terpilih" / "Objek baru")
  selalu menunjukkan mode aktif.
- **Transformasi** hanya aktif kalau ada objek terpilih. Isinya posisi X/Y (angka),
  slider Rotasi (-180° sampai 180°), slider Skala (10% sampai 400%), tombol
  `Reset rotasi & skala`, dan tombol `Hapus objek`.

### 4. Impor gambar dan ekspor PNG

- Tombol header `＋ Impor gambar` membuka dialog. Bisa pilih file dari perangkat
  (PNG/JPG/WebP/GIF, maks 10 MB) atau menempel URL langsung gambar.
  Gambar masuk ke tengah kanvas sebagai objek biasa: bisa digeser, diputar, dan diskala
  seperti segitiga atau lingkaran. Warna isi/garis tidak mewarnai ulang foto.
  Gambar besar otomatis diperkecil agar hemat memori. GIF diperlakukan sebagai gambar diam.
- Tombol header `↓ Simpan PNG` mengunduh hasil kanvas 1200 × 800 tanpa kotak seleksi.
  Catatan penting: gambar hanya hidup di memori tab, **unduh PNG sebelum menutup halaman**.
  PNG menyimpan hasil akhir, bukan daftar objek yang bisa diedit lagi.

## Cara memakai

### Menggambar dan mengatur warna

Klik salah satu alat, misalnya Persegi panjang. Klik dan tahan di kanvas, tarik sampai
ukuran sesuai, lalu lepas. Persegi dan Lingkaran selalu menjaga rasio 1:1.
Garis boleh ditarik ke arah mana pun.

Untuk menyiapkan warna objek baru tanpa mengubah objek lama, tekan **Esc** dulu
(atau klik area kosong dengan alat Pilih), lalu atur warna. Alat baru akan memakai
pengaturan warna yang terlihat.

### Mengubah objek yang sudah dibuat

1. Klik **Pilih** atau tekan **V**.
2. Klik objek; kotak putus-putus menunjukkan objek terpilih. Untuk bentuk tanpa isi, klik garis tepinya.
3. Tarik objek untuk translasi atau ubah angka posisi X/Y.
4. Ubah slider Rotasi dan Skala di panel kanan.
5. **Reset rotasi & skala** mengembalikan rotasi ke 0° dan skala ke 100%; posisi tidak diubah.

Kotak seleksi hanya penanda. Ukuran dan rotasi diubah memakai panel, bukan dengan
menarik sudut kotak.

### Mengimpor gambar

Klik **Impor gambar**, pilih file (maksimal 10 MB), lalu **Tambahkan ke kanvas**.
Alternatifnya, masukkan alamat langsung suatu gambar. URL yang tidak mendukung CORS
akan ditolak browser; gunakan file lokal sebagai alternatif. Untuk demo ke dosen,
**pakai file lokal** supaya tidak bergantung pada izin server orang lain.

### Shortcut

| Tombol | Fungsi |
| --- | --- |
| V | Pilih dan geser |
| Esc | Batalkan seleksi |
| Delete / Backspace | Hapus objek terpilih |
| Ctrl+Z / Cmd+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Tombol panah | Geser objek 1 piksel |
| Shift + panah | Geser objek 10 piksel |

Shortcut dinonaktifkan ketika mengetik di input atau membuka dialog.

## Kesesuaian dengan soal

| Persyaratan | Implementasi | Lokasi kode |
| --- | --- | --- |
| Load image from source | FileReader/URL diteruskan ke `p5.loadImage()` | `importImage()` di sketch.js |
| Shape primitives | point, line, rect, square, ellipse, circle, triangle, quad, arc | `drawObject()` di sketch.js |
| Flat color | `fill()`, `stroke()`, `strokeWeight()` | `drawObject()` dan kontrol warna |
| Transformasi objek | `translate()`, `rotate()`, `scale()`, dibatasi `push()`/`pop()` | `drawObject()` |
| Deploy ke *.github.io | Proyek statis dengan jalur relatif | Langkah deployment di bawah |

**Status deployment:** paket ini siap diunggah, tetapi belum dipublikasikan ke akun GitHub. URL github.io belum dibuat.

## Publikasi ke GitHub Pages

1. Masuk ke akun GitHub, buat repository **public** bernama `p5-paint`.
2. Pilih **Add file → Upload files**.
3. Unggah **isi folder** `p5-paint`, termasuk `vendor`. Pastikan `index.html` berada langsung di root repository, bukan di dalam folder tambahan.
4. Klik **Commit changes**.
5. Buka **Settings → Pages**.
6. Pada **Source**, pilih **Deploy from a branch**.
7. Pilih branch **main**, folder **/(root)**, lalu **Save**.
8. Tunggu deployment selesai. Salin URL yang ditampilkan GitHub Pages; format umumnya `https://USERNAME.github.io/p5-paint/`.
9. Buka URL tersebut, uji menggambar, impor gambar, transformasi, dan ekspor PNG sebelum mengumpulkan link.

Jika 404, periksa posisi `index.html`, branch yang dipilih, dan status deployment. Link repository berbeda dari link website; yang dikumpulkan sesuai soal adalah link website GitHub Pages.

## Penjelasan kodingan

Bagian ini menjelaskan cara kerja kode untuk yang membaca tanpa menjalankan dulu.

### Arsitektur: DOM untuk panel, p5.js untuk gambar

- `index.html`: kerangka panel, toolbar, kanvas, dialog impor, dan statusbar. Tidak ada logika gambar di sini.
- `style.css`: hanya tampilan desktop dan mobile.
- `geometry.js`: matematika murni tanpa p5.js. Isinya tiga fungsi: `makeShape()` (membuat data bentuk dari titik mulai–selesai), `centerBrush()` (merapikan goresan kuas), dan `cloneScene()` (menyalin daftar objek untuk undo/redo). Dipisah supaya gampang dibaca dan diuji.
- `sketch.js`: seluruh logika aplikasi — rendering p5, seleksi, drag pointer, impor/ekspor, dan riwayat.
- `vendor/p5.min.js`: p5.js v1.11.11 tanpa modifikasi, dipakai offline.

Prinsipnya: HTML mengurus tombol dan input, p5.js mengurus semua yang terlihat di kanvas.

### Model data: satu objek = satu gambar

Semua yang di kanvas disimpan di array `objects` (`sketch.js`). Contoh satu objek persegi:

```js
{
  id: 3, type: 'rect',
  x: 600, y: 400,        // posisi pusat di kanvas
  w: 200, h: 120,        // ukuran awal sebelum skala
  rotation: 0, scale: 1, // transformasi
  fill: '#e85d3b', stroke: '#24262b',
  weight: 3, filled: true,
  points: [{x:-100,y:-60},{x:100,y:60}] // dipakai line/bezier/brush
}
```

Gambar impor bentuknya sama, hanya tambah properti `image` berisi hasil `loadImage()`.
Karena datanya tersimpan, objek lama tetap bisa dipilih dan diubah — aplikasi menggambar
ulang seluruh array setiap kali ada perubahan, bukan menumpuk cat permanen.

### Rendering: `drawObject()` adalah jantungnya

Fungsi `drawObject(g, o)` di `sketch.js` menggambar satu objek di konteks p5 mana pun
(kanvas utama, kanvas seleksi, maupun kanvas ekspor). Isinya tiga langkah:

```js
g.push();
g.translate(o.x, o.y);              // 1. pindah ke pusat objek (translasi)
g.rotate(o.rotation * Math.PI/180); // 2. putar terhadap pusat (rotasi)
g.scale(o.scale);                   // 3. perbesar/kecilkan (skala)
// ... lalu gambar bentuk dalam koordinat lokal, misal rect(-w/2,-h/2,w,h)
g.pop(); // kembalikan transformasi supaya objek lain tidak ikut terpengaruh
```

Urutan `translate → rotate → scale` membuat rotasi dan skala selalu terhadap pusat objek,
bukan terhadap pojok kanvas. `push()`/`pop()` mengisolasi tiap objek.

Di dalam blok itu, gaya flat color diterapkan:

```js
g.stroke(o.stroke); g.strokeWeight(o.weight);
if (o.filled) g.fill(o.fill); else g.noFill();
```

Lalu `switch (o.type)` memanggil primitif p5 yang sesuai: `point()`, `line()`,
`rect()`, `square()`, `ellipse()`, `circle()`, `triangle()`, `quad()`, `arc()`,
plus `bezier()`, `curve()`, `beginShape()/vertex()` untuk kuas, dan `image()` untuk foto.
Inilah bukti "semua shape primitives" dan "warna flat" benar-benar memakai API p5.js,
bukan digambar manual dengan canvas mentah.

Aplikasi memakai `p.noLoop()` — kanvas hanya digambar ulang saat `refresh()` dipanggil
(setelah menggambar, menggeser, atau mengubah warna), bukan 60 frame per detik.
Ini lebih hemat dan cocok untuk paint.

### Interaksi: menggambar vs menggeser

- **Menggambar** (`pointerDown/Move/Up` mode `draw`): titik awal dan posisi mouse saat ini
  dikirim ke `makeShape()` setiap gerakan, hasilnya disimpan sebagai `preview` dan
  ditampilkan. Saat mouse dilepas, `preview` yang ukurannya valid dimasukkan ke `objects`.
  Bentuk terlalu kecil (< 3 px, kecuali titik/kuas) ditolak dengan pesan
  "Klik dan tarik untuk menentukan ukuran bentuk."
- **Menggeser** (mode `move` dengan alat Pilih): posisi objek = posisi awal + selisih mouse.
  Karena koordinat mouse dikonversi dari piksel layar ke 1200 × 800 (`coordinates()`),
  drag tetap akurat walau kanvas ditampilkan kecil di layar.
- Perubahan warna/rotasi/skala lewat panel memakai pola `pendingStyle`: perubahan
  ditampung, lalu dicatat sebagai satu langkah undo saat selesai (`change`/`flushStyle()`),
  supaya menggeser slider tidak membanjiri riwayat.

### Seleksi: kanvas tak terlihat (`hitBuffer`)

Untuk tahu objek mana yang diklik, aplikasi membuat kanvas p5 kedua yang disembunyikan.
Setiap objek digambar di sana dengan warna unik berdasarkan indeksnya
(`[n%256, ...]`). Warna piksel di posisi klik dibaca balik menjadi indeks objek
(`hitAt()`). Trik ini membuat seleksi akurat untuk bentuk miring dan bertumpuk tanpa
matematika tabrakan manual. Garis di kanvas seleksi sengaja dipertebal
(`Math.max(o.weight, 10/o.scale)`) supaya garis tipis gampang diklik.
Konsekuensinya: bentuk tanpa isi harus diklik garis tepinya, bukan bagian tengahnya.

### Impor gambar: `loadImage()` dari dua sumber

Fungsi `importImage()` menerima dua sumber, lalu menyatukannya menjadi satu URL gambar:

- File lokal dibaca dengan `FileReader` menjadi dataURL.
- URL ditempel langsung setelah dicek protokolnya `http/https`.

Keduanya diteruskan ke `app.loadImage(source, sukses, gagal)` dengan timeout 20 detik.
Jika berhasil, gambar ditaruh di tengah kanvas, diperkecil bila melebihi 70% kanvas,
lalu didorong ke `objects` seperti bentuk biasa. Jika gagal (link mati, bukan gambar,
atau diblokir CORS), muncul pesan "gunakan file dari perangkat".

### Undo/redo dan ekspor

- **Riwayat:** sebelum setiap perubahan, salinan `objects` disimpan via `cloneScene()`
  (maksimal 40 langkah). Undo/redo tinggal menukar array aktif dengan tumpukan.
  Referensi gambar p5 tidak disalin per piksel, jadi hemat memori.
- **Ekspor:** membuat kanvas p5 sementara (`createGraphics(1200,800)`), mengisi latar
  putih, menggambar ulang semua objek dengan `drawObject()` yang sama, lalu mengunduhnya
  via `toBlob('image/png')`. Kotak seleksi tidak ikut karena seleksi digambar terpisah
  (`drawSelection()` hanya di kanvas utama). Jika gambar impor berasal dari URL yang
  mengotori kanvas (tainted), ekspor gagal dengan pesan yang menjelaskan penyebabnya.

### Alur data ringkas

`klik/tarik → makeShape/pointerMove → preview → objects[] → refresh() → p.draw() → drawObject() per objek (+ drawSelection untuk yang terpilih)`

### Urutan demonstrasi untuk dosen

1. Tampilkan 9 primitive 2D dengan beberapa warna flat.
2. Impor satu gambar lokal.
3. Pilih segitiga, geser, rotasi, dan ubah skalanya.
4. Lakukan transformasi pada gambar impor.
5. Tunjukkan undo/redo dan ekspor PNG.
6. Buka `drawObject()` untuk menjelaskan API p5.js yang dipakai.
7. Tampilkan aplikasi dari URL GitHub Pages milikmu.

## Referensi

- p5.js reference: https://p5js.org/reference/
- p5.js 1.x reference: https://v1.p5js.org/reference/
- p5.js shape primitives: https://p5js.org/examples/Shapes-And-Color-Shape-Primitives/
- GitHub Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Source p5.js: https://github.com/processing/p5.js/tree/v1.11.11

## Pemeriksaan

Sintaks JavaScript, konsistensi referensi file/ID kontrol, geometri bentuk, jalur rendering primitive, dan transisi state inti diperiksa saat pembuatan. Pengujian visual dan interaksi di browser belum dilakukan di lingkungan pembuat. Ikuti urutan demonstrasi di atas untuk pemeriksaan akhir sebelum pengumpulan.
