import {MigrationInterface, QueryRunner} from "typeorm";

export class addSourceCascade1629767914963 implements MigrationInterface {
    name = 'addSourceCascade1629767914963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_f7b0aefc1003477ea326af1ac5"`);
        await queryRunner.query(`CREATE TABLE "temporary_sources" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar(15) NOT NULL, "name" varchar(36) NOT NULL, "dataJSON" text NOT NULL DEFAULT (''), "sourceGroupId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_sources"("id", "type", "name", "dataJSON", "sourceGroupId") SELECT "id", "type", "name", "dataJSON", "sourceGroupId" FROM "sources"`);
        await queryRunner.query(`DROP TABLE "sources"`);
        await queryRunner.query(`ALTER TABLE "temporary_sources" RENAME TO "sources"`);
        await queryRunner.query(`CREATE INDEX "IDX_f7b0aefc1003477ea326af1ac5" ON "sources" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_a1110777a20270c18440d32c4c"`);
        await queryRunner.query(`CREATE TABLE "temporary_filters" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "forSubmissions" boolean NOT NULL, "field" varchar(20) NOT NULL, "comparator" varchar(2) NOT NULL, "valueJSON" text NOT NULL, "sourceGroupId" integer, "negativeMatch" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_filters"("id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch") SELECT "id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch" FROM "filters"`);
        await queryRunner.query(`DROP TABLE "filters"`);
        await queryRunner.query(`ALTER TABLE "temporary_filters" RENAME TO "filters"`);
        await queryRunner.query(`CREATE INDEX "IDX_a1110777a20270c18440d32c4c" ON "filters" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_792ca9643eaf7971a9dd1112a5"`);
        await queryRunner.query(`DROP INDEX "IDX_b911a51a0637a4e27e0dd1ce23"`);
        await queryRunner.query(`CREATE TABLE "temporary_urls" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "address" varchar NOT NULL, "handler" varchar NOT NULL, "processed" boolean NOT NULL DEFAULT (0), "failed" boolean NOT NULL DEFAULT (0), "failureReason" text, "completedUTC" integer NOT NULL DEFAULT (0), "fileId" integer, CONSTRAINT "FK_b911a51a0637a4e27e0dd1ce23a" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_urls"("id", "address", "handler", "processed", "failed", "failureReason", "completedUTC", "fileId") SELECT "id", "address", "handler", "processed", "failed", "failureReason", "completedUTC", "fileId" FROM "urls"`);
        await queryRunner.query(`DROP TABLE "urls"`);
        await queryRunner.query(`ALTER TABLE "temporary_urls" RENAME TO "urls"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_792ca9643eaf7971a9dd1112a5" ON "urls" ("address") `);
        await queryRunner.query(`CREATE INDEX "IDX_b911a51a0637a4e27e0dd1ce23" ON "urls" ("fileId") `);
        await queryRunner.query(`DROP INDEX "IDX_96db2e076ee5f721b37fd2ad5f"`);
        await queryRunner.query(`DROP INDEX "IDX_5d63d7c074e60a34a228f9855d"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6849e986a0678a61d97504bc"`);
        await queryRunner.query(`DROP INDEX "IDX_337604abe2c3c9ab698cc9d294"`);
        await queryRunner.query(`CREATE TABLE "temporary_downloads" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "albumID" text, "isAlbumParent" boolean NOT NULL DEFAULT (0), "parentSubmissionId" varchar, "parentCommentId" varchar, "urlId" integer, "albumPaddedIndex" varchar, CONSTRAINT "FK_96db2e076ee5f721b37fd2ad5f8" FOREIGN KEY ("urlId") REFERENCES "urls" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_5d63d7c074e60a34a228f9855de" FOREIGN KEY ("parentCommentId") REFERENCES "comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_eb6849e986a0678a61d97504bcd" FOREIGN KEY ("parentSubmissionId") REFERENCES "submissions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_downloads"("id", "albumID", "isAlbumParent", "parentSubmissionId", "parentCommentId", "urlId", "albumPaddedIndex") SELECT "id", "albumID", "isAlbumParent", "parentSubmissionId", "parentCommentId", "urlId", "albumPaddedIndex" FROM "downloads"`);
        await queryRunner.query(`DROP TABLE "downloads"`);
        await queryRunner.query(`ALTER TABLE "temporary_downloads" RENAME TO "downloads"`);
        await queryRunner.query(`CREATE INDEX "IDX_96db2e076ee5f721b37fd2ad5f" ON "downloads" ("urlId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d63d7c074e60a34a228f9855d" ON "downloads" ("parentCommentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6849e986a0678a61d97504bc" ON "downloads" ("parentSubmissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_337604abe2c3c9ab698cc9d294" ON "downloads" ("albumID") `);
        await queryRunner.query(`DROP INDEX "IDX_f7b0aefc1003477ea326af1ac5"`);
        await queryRunner.query(`CREATE TABLE "temporary_sources" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar(15) NOT NULL, "name" varchar(36) NOT NULL, "dataJSON" text NOT NULL DEFAULT (''), "sourceGroupId" integer NOT NULL, CONSTRAINT "FK_f7b0aefc1003477ea326af1ac54" FOREIGN KEY ("sourceGroupId") REFERENCES "source_groups" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_sources"("id", "type", "name", "dataJSON", "sourceGroupId") SELECT "id", "type", "name", "dataJSON", "sourceGroupId" FROM "sources"`);
        await queryRunner.query(`DROP TABLE "sources"`);
        await queryRunner.query(`ALTER TABLE "temporary_sources" RENAME TO "sources"`);
        await queryRunner.query(`CREATE INDEX "IDX_f7b0aefc1003477ea326af1ac5" ON "sources" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_a1110777a20270c18440d32c4c"`);
        await queryRunner.query(`CREATE TABLE "temporary_filters" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "forSubmissions" boolean NOT NULL, "field" varchar(20) NOT NULL, "comparator" varchar(2) NOT NULL, "valueJSON" text NOT NULL, "sourceGroupId" integer, "negativeMatch" boolean NOT NULL DEFAULT (0), CONSTRAINT "FK_a1110777a20270c18440d32c4c3" FOREIGN KEY ("sourceGroupId") REFERENCES "source_groups" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_filters"("id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch") SELECT "id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch" FROM "filters"`);
        await queryRunner.query(`DROP TABLE "filters"`);
        await queryRunner.query(`ALTER TABLE "temporary_filters" RENAME TO "filters"`);
        await queryRunner.query(`CREATE INDEX "IDX_a1110777a20270c18440d32c4c" ON "filters" ("sourceGroupId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_a1110777a20270c18440d32c4c"`);
        await queryRunner.query(`ALTER TABLE "filters" RENAME TO "temporary_filters"`);
        await queryRunner.query(`CREATE TABLE "filters" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "forSubmissions" boolean NOT NULL, "field" varchar(20) NOT NULL, "comparator" varchar(2) NOT NULL, "valueJSON" text NOT NULL, "sourceGroupId" integer, "negativeMatch" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "filters"("id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch") SELECT "id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch" FROM "temporary_filters"`);
        await queryRunner.query(`DROP TABLE "temporary_filters"`);
        await queryRunner.query(`CREATE INDEX "IDX_a1110777a20270c18440d32c4c" ON "filters" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_f7b0aefc1003477ea326af1ac5"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME TO "temporary_sources"`);
        await queryRunner.query(`CREATE TABLE "sources" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar(15) NOT NULL, "name" varchar(36) NOT NULL, "dataJSON" text NOT NULL DEFAULT (''), "sourceGroupId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "sources"("id", "type", "name", "dataJSON", "sourceGroupId") SELECT "id", "type", "name", "dataJSON", "sourceGroupId" FROM "temporary_sources"`);
        await queryRunner.query(`DROP TABLE "temporary_sources"`);
        await queryRunner.query(`CREATE INDEX "IDX_f7b0aefc1003477ea326af1ac5" ON "sources" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_337604abe2c3c9ab698cc9d294"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6849e986a0678a61d97504bc"`);
        await queryRunner.query(`DROP INDEX "IDX_5d63d7c074e60a34a228f9855d"`);
        await queryRunner.query(`DROP INDEX "IDX_96db2e076ee5f721b37fd2ad5f"`);
        await queryRunner.query(`ALTER TABLE "downloads" RENAME TO "temporary_downloads"`);
        await queryRunner.query(`CREATE TABLE "downloads" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "albumID" text, "isAlbumParent" boolean NOT NULL DEFAULT (0), "parentSubmissionId" varchar, "parentCommentId" varchar, "urlId" integer, "albumPaddedIndex" varchar, CONSTRAINT "FK_96db2e076ee5f721b37fd2ad5f8" FOREIGN KEY ("urlId") REFERENCES "urls" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_5d63d7c074e60a34a228f9855de" FOREIGN KEY ("parentCommentId") REFERENCES "comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_eb6849e986a0678a61d97504bcd" FOREIGN KEY ("parentSubmissionId") REFERENCES "submissions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "downloads"("id", "albumID", "isAlbumParent", "parentSubmissionId", "parentCommentId", "urlId", "albumPaddedIndex") SELECT "id", "albumID", "isAlbumParent", "parentSubmissionId", "parentCommentId", "urlId", "albumPaddedIndex" FROM "temporary_downloads"`);
        await queryRunner.query(`DROP TABLE "temporary_downloads"`);
        await queryRunner.query(`CREATE INDEX "IDX_337604abe2c3c9ab698cc9d294" ON "downloads" ("albumID") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6849e986a0678a61d97504bc" ON "downloads" ("parentSubmissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d63d7c074e60a34a228f9855d" ON "downloads" ("parentCommentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_96db2e076ee5f721b37fd2ad5f" ON "downloads" ("urlId") `);
        await queryRunner.query(`DROP INDEX "IDX_b911a51a0637a4e27e0dd1ce23"`);
        await queryRunner.query(`DROP INDEX "IDX_792ca9643eaf7971a9dd1112a5"`);
        await queryRunner.query(`ALTER TABLE "urls" RENAME TO "temporary_urls"`);
        await queryRunner.query(`CREATE TABLE "urls" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "address" varchar NOT NULL, "handler" varchar NOT NULL, "processed" boolean NOT NULL DEFAULT (0), "failed" boolean NOT NULL DEFAULT (0), "failureReason" text, "completedUTC" integer NOT NULL DEFAULT (0), "fileId" integer, CONSTRAINT "FK_b911a51a0637a4e27e0dd1ce23a" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "urls"("id", "address", "handler", "processed", "failed", "failureReason", "completedUTC", "fileId") SELECT "id", "address", "handler", "processed", "failed", "failureReason", "completedUTC", "fileId" FROM "temporary_urls"`);
        await queryRunner.query(`DROP TABLE "temporary_urls"`);
        await queryRunner.query(`CREATE INDEX "IDX_b911a51a0637a4e27e0dd1ce23" ON "urls" ("fileId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_792ca9643eaf7971a9dd1112a5" ON "urls" ("address") `);
        await queryRunner.query(`DROP INDEX "IDX_a1110777a20270c18440d32c4c"`);
        await queryRunner.query(`ALTER TABLE "filters" RENAME TO "temporary_filters"`);
        await queryRunner.query(`CREATE TABLE "filters" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "forSubmissions" boolean NOT NULL, "field" varchar(20) NOT NULL, "comparator" varchar(2) NOT NULL, "valueJSON" text NOT NULL, "sourceGroupId" integer, "negativeMatch" boolean NOT NULL DEFAULT (0), CONSTRAINT "FK_a1110777a20270c18440d32c4c3" FOREIGN KEY ("sourceGroupId") REFERENCES "source_groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "filters"("id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch") SELECT "id", "forSubmissions", "field", "comparator", "valueJSON", "sourceGroupId", "negativeMatch" FROM "temporary_filters"`);
        await queryRunner.query(`DROP TABLE "temporary_filters"`);
        await queryRunner.query(`CREATE INDEX "IDX_a1110777a20270c18440d32c4c" ON "filters" ("sourceGroupId") `);
        await queryRunner.query(`DROP INDEX "IDX_f7b0aefc1003477ea326af1ac5"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME TO "temporary_sources"`);
        await queryRunner.query(`CREATE TABLE "sources" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar(15) NOT NULL, "name" varchar(36) NOT NULL, "dataJSON" text NOT NULL DEFAULT (''), "sourceGroupId" integer NOT NULL, CONSTRAINT "FK_f7b0aefc1003477ea326af1ac54" FOREIGN KEY ("sourceGroupId") REFERENCES "source_groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "sources"("id", "type", "name", "dataJSON", "sourceGroupId") SELECT "id", "type", "name", "dataJSON", "sourceGroupId" FROM "temporary_sources"`);
        await queryRunner.query(`DROP TABLE "temporary_sources"`);
        await queryRunner.query(`CREATE INDEX "IDX_f7b0aefc1003477ea326af1ac5" ON "sources" ("sourceGroupId") `);
    }

}
