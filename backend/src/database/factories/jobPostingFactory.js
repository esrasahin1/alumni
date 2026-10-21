/**
 * Job Posting Factory
 * Generates realistic alumni career opportunities with reproducible seed data.
 */

const SAMPLE_TITLES = [
  'Full Stack Web Geliştirici',
  'Frontend (React) Yazılım Mühendisi',
  'Backend (.NET & Node.js) Geliştirici',
  'DevOps & Bulut Altyapı Uzmanı',
  'Veri Analisti ve İş Zekâsı Uzmanı',
  'Yapay Zekâ & Makine Öğrenimi Mühendisi'
];

const SAMPLE_COMPANIES = [
  'Teknoloji Alumni A.Ş.',
  'InnoSoft Bilişim Çözümleri',
  'FinAlumni Finansal Teknolojiler',
  'Bulut Sistemleri Teknolojileri',
  'MegaData Analitik Grubu'
];

const SAMPLE_LOCATIONS = [
  'İstanbul / Hibrit',
  'Ankara / Uzaktan',
  'İzmir / Yerinde',
  'İstanbul / Maslak',
  'Uzaktan (Remote)'
];

const SAMPLE_DESCRIPTIONS = [
  'Node.js, Express ve modern web teknolojilerinde deneyimli, RESTful API tasarımı ve ilişkisel veri tabanlarına hakim takım arkadaşı arıyoruz.',
  'Kullanıcı dostu responsive web uygulamaları geliştirecek, React ve modern JavaScript ekosistemine hakim yazılım mühendisi aranmaktadır.',
  'Yüksek performanslı backend servisleri ve mikroservis mimarileri geliştirecek, SQL optimizasyonu ve veri modellemede tecrübeli geliştirici aranmaktadır.',
  'Docker, CI/CD süreçleri ve bulut altyapılarının yönetiminden sorumlu olacak, otomasyon araçlarına hakim sistem mühendisi arıyoruz.',
  'Büyük veri setlerini analiz ederek iş zekâsı panelleri oluşturacak, ileri seviye SQL ve Python bilen veri analisti arıyoruz.'
];

let counter = 1;

/**
 * Generates a single job posting object.
 * @param {Object} [overrides={}] Custom attribute overrides
 * @returns {Object} { title, company, location, description, contact_email }
 */
function createOne(overrides = {}) {
  const titleIndex = Math.floor(Math.random() * SAMPLE_TITLES.length);
  const companyIndex = Math.floor(Math.random() * SAMPLE_COMPANIES.length);
  const locationIndex = Math.floor(Math.random() * SAMPLE_LOCATIONS.length);
  const descIndex = Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length);

  const defaultTitle = `${SAMPLE_TITLES[titleIndex]} #${counter++}`;
  const defaultCompany = SAMPLE_COMPANIES[companyIndex];
  const defaultLocation = SAMPLE_LOCATIONS[locationIndex];
  const defaultDescription = SAMPLE_DESCRIPTIONS[descIndex];
  const defaultEmail = `kariyer${counter}@alumnijobs.com`;

  return {
    title: overrides.title !== undefined ? overrides.title : defaultTitle,
    company: overrides.company !== undefined ? overrides.company : defaultCompany,
    location: overrides.location !== undefined ? overrides.location : defaultLocation,
    description: overrides.description !== undefined ? overrides.description : defaultDescription,
    contact_email: overrides.contact_email !== undefined ? overrides.contact_email : (overrides.contactEmail !== undefined ? overrides.contactEmail : defaultEmail)
  };
}

/**
 * Generates multiple job posting objects.
 * @param {number} [count=3] Number of job postings to generate
 * @param {Array<Object>} [overrides=[]] Array of overrides for specific postings
 * @returns {Array<Object>} Array of job posting objects
 */
function createMany(count = 3, overrides = []) {
  const jobPostings = [];
  for (let i = 0; i < count; i++) {
    jobPostings.push(createOne(overrides[i] || {}));
  }
  return jobPostings;
}

/**
 * Returns a fixed, reproducible set of high-quality sample job postings for seeding.
 * @returns {Array<Object>} Predictable seed job postings
 */
function getPredefinedJobPostings() {
  return [
    {
      title: 'Full Stack Web Geliştirici',
      company: 'Teknoloji Alumni A.Ş.',
      location: 'İstanbul / Hibrit',
      description: 'Node.js, Express ve modern frontend kütüphanelerinde en az 2 yıl deneyimli, RESTful API tasarımı ve MySQL veri tabanı mimarilerine hakim Full Stack Web Geliştirici arıyoruz.',
      contact_email: 'kariyer@teknolojialumni.com'
    },
    {
      title: 'Frontend (React) Yazılım Mühendisi',
      company: 'InnoSoft Bilişim Çözümleri',
      location: 'Ankara / Uzaktan',
      description: 'Kullanıcı dostu responsive arayüzler geliştirebilecek, modern JavaScript (ES6+), React ve state yönetim araçlarında tecrübeli Frontend Yazılım Mühendisi takım arkadaşı arıyoruz.',
      contact_email: 'hr@innosoft.com.tr'
    },
    {
      title: 'Backend (.NET & Node.js) Geliştirici',
      company: 'FinAlumni Finansal Teknolojiler',
      location: 'İstanbul / Levent',
      description: 'Yüksek trafikli ödeme ve finans altyapılarında mikroservis mimarileri geliştirecek, ilişkisel veri tabanları ve SQL optimizasyonuna hakim Backend Geliştirici aranmaktadır.',
      contact_email: 'jobs@finalumni.com'
    },
    {
      title: 'DevOps & Bulut Altyapı Uzmanı',
      company: 'Bulut Sistemleri Teknolojileri',
      location: 'İzmir / Hibrit',
      description: 'Docker, Kubernetes, CI/CD süreçleri ve AWS/Azure bulut altyapılarının yönetimi konusunda tecrübeli, ölçeklenebilir sistem mimarileri kurgulayabilecek DevOps Uzmanı arıyoruz.',
      contact_email: 'devops@bulutsistemleri.com'
    },
    {
      title: 'Veri Analisti ve İş Zekâsı Uzmanı',
      company: 'MegaData Analitik Grubu',
      location: 'İstanbul / Hibrit',
      description: 'İş birimlerinin veri analitiği ve raporlama ihtiyaçlarını karşılayacak, ileri düzey SQL ve Python bilgisine sahip, PowerBI ve veri ambarı modellemelerinde deneyimli Veri Analisti aranmaktadır.',
      contact_email: 'analitik@megadata.com.tr'
    }
  ];
}

module.exports = {
  createOne,
  createMany,
  getPredefinedJobPostings
};
