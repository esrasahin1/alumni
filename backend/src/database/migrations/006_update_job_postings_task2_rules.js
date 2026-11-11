/**
 * Migration: 006_update_job_postings_task2_rules
 * Enforces title maximum 120 characters and makes description optional (NULL).
 */

module.exports = {
  name: '006_update_job_postings_task2_rules',
  async up(connection) {
    const sql = `
      ALTER TABLE job_postings
        MODIFY COLUMN title VARCHAR(120) NOT NULL,
        MODIFY COLUMN description TEXT NULL;
    `;
    await connection.query(sql);
  },
  async down(connection) {
    /**
     * DİKKAT / VERİ DEĞİŞİKLİĞİ UYARISI:
     * Migration uygulandıktan sonra sisteme description = NULL olan iş ilanları girilmiş olabilir.
     * MySQL strict modunda 'MODIFY COLUMN description TEXT NOT NULL' komutu, tabloda NULL değer
     * varsa 'ERROR 1138 (22004): Invalid use of NULL value' hatasıyla başarısız olur ve rollback'i durdurur.
     * Bu hatayı önlemek ve tablonun eski NOT NULL şemasına güvenle dönebilmesini sağlamak için,
     * description değeri NULL olan mevcut kayıtlara 'Açıklama belirtilmedi (Rollback)' varsayılan metni atanır.
     * Bu işlem, NULL olan satırlarda veri değişikliği (data mutation) oluşturur.
     */
    await connection.query(`
      UPDATE job_postings
        SET description = 'Açıklama belirtilmedi (Rollback)'
        WHERE description IS NULL
    `);

    const sql = `
      ALTER TABLE job_postings
        MODIFY COLUMN title VARCHAR(255) NOT NULL,
        MODIFY COLUMN description TEXT NOT NULL;
    `;
    await connection.query(sql);
  }
};
