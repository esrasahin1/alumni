/**
 * Announcement Factory
 * Generates realistic alumni announcements with reproducible seed data.
 */

const SAMPLE_TITLES = [
  '2026 Güz Dönemi Mezunlar Buluşması',
  'Yazılım ve Teknoloji Kariyer Zirvesi',
  'Mezun-Öğrenci Mentorluk Programı Başvuruları Açıldı',
  'Yapay Zekâ ve Veri Bilimi Çevrim İçi Semineri',
  'Girişimcilik ve İnovasyon Networking Etkinliği',
  'Sektör Liderleriyle Yuvarlak Masa Toplantısı'
];

const SAMPLE_CONTENTS = [
  'Değerli mezunlarımız, geleneksel yıllık mezunlar buluşmamız bu ay sonu ana kampüste gerçekleştirilecektir. Katılım için lütfen formu doldurunuz.',
  'Önde gelen teknoloji firmalarının katılımıyla kariyer fırsatları, staj imkanları ve mülakat simülasyonları içeren etkinliğimize tüm mezun ve öğrencilerimiz davetlidir.',
  'Yeni mezunlarımızın kariyer basamaklarını daha güvenli tırmanmaları için deneyimli mezunlarımızla bir araya geldikleri mentorluk programımız yeni dönem eşleşmelerine başlamıştır.',
  'Akademisyenler ve sektör uzmanları eşliğinde yapay zekâ teknolojilerindeki son gelişmelerin ele alınacağı seminerimiz Zoom üzerinden ücretsiz olarak yayınlanacaktır.',
  'Kendi girişimini kurmuş veya kurmayı planlayan mezunlarımızın fikir alışverişinde bulunacağı networking kokteylimiz teknokent fuaye alanında düzenlenecektir.',
  'Farklı sektörlerde yönetici pozisyonundaki mezunlarımızla deneyim paylaşımı ve kariyer rehberliği temalı sohbet toplantımız gerçekleştirilecektir.'
];

let counter = 1;

/**
 * Generates a single announcement object.
 * @param {Object} [overrides={}] Custom attribute overrides
 * @returns {Object} { title, content }
 */
function createOne(overrides = {}) {
  const index = Math.floor(Math.random() * SAMPLE_TITLES.length);
  const defaultTitle = `${SAMPLE_TITLES[index]} #${counter++}`;
  const defaultContent = SAMPLE_CONTENTS[index];

  return {
    title: overrides.title !== undefined ? overrides.title : defaultTitle,
    content: overrides.content !== undefined ? overrides.content : defaultContent
  };
}

/**
 * Generates multiple announcement objects.
 * @param {number} [count=3] Number of announcements to generate
 * @param {Array<Object>} [overrides=[]] Array of overrides for specific announcements
 * @returns {Array<Object>} Array of announcement objects
 */
function createMany(count = 3, overrides = []) {
  const announcements = [];
  for (let i = 0; i < count; i++) {
    announcements.push(createOne(overrides[i] || {}));
  }
  return announcements;
}

/**
 * Returns a fixed, reproducible set of high-quality sample announcements for seeding.
 * @returns {Array<Object>} Predictable seed announcements
 */
function getPredefinedAnnouncements() {
  return [
    {
      title: '2026 Yıllık Mezunlar Buluşması ve Gala Gecesi',
      content: 'Tüm mezunlarımızı bu yıl 15.sini düzenlediğimiz geleneksel mezunlar buluşması ve plaket törenine davet ediyoruz. Detaylar ve kayıt bağlantısı web sitemizde yayınlanmıştır.'
    },
    {
      title: 'Teknoloji ve Yazılım Sektörü Kariyer Zirvesi',
      content: 'Bilişim sektöründeki öncü şirketlerin katılımıyla gerçekleştirilecek fuarda kariyer fırsatları, staj olanakları ve teknik sunumlar yer alacaktır.'
    },
    {
      title: 'Alumni Mezun-Öğrenci Mentorluk Programı',
      content: 'Kariyer yolculuğunun başındaki son sınıf öğrencilerine rehberlik edecek gönüllü mezun mentorlar aranmaktadır. Başvurular 30 Ekim tarihine kadar devam edecektir.'
    },
    {
      title: 'Yapay Zekâ ve Büyük Veri Webinarı',
      content: 'Yurtdışında ve ulusal şirketlerde çalışan mezunlarımızın konuşmacı olarak katılacağı büyük dil modelleri ve veri analitiği konulu panelimiz çevrim içi ortamda yapılacaktır.'
    }
  ];
}

module.exports = {
  createOne,
  createMany,
  getPredefinedAnnouncements
};
