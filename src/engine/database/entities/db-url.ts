import {
    Entity,
    Column,
    ManyToOne,
    Index,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm';
import {DBEntity} from "./db-entity";
import DBFile from "./db-file";
import DBDownload from "./db-download";

@Entity({ name: 'urls' })
export default class DBUrl extends DBEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Index({ unique: true })
    address!: string;

    @Column()
    handler!: string;

    @Column({ default: false })
    processed!: boolean;

    @Column({ default: false })
    failed!: boolean;

    @Column({ type: 'text', default: null, nullable: true })
    failureReason!: string|null;

    @Column({ default: 0 })
    completedUTC!: number;

    @ManyToOne(() => DBFile, comm => comm.urls, { nullable: true, cascade: true, onDelete: 'CASCADE'})
    @Index()
    file!: Promise<DBFile|null>;

    @OneToMany(() => DBDownload, dl => dl.url)
    downloads!: Promise<DBDownload[]>;

    /**
     * Find or build a DBUrl object for the given URL string.
     */
    static async dedupeURL(address: string) {
        return (await DBUrl.findOne({where: {address}, relations: ['file']})) || DBUrl.build({
            completedUTC: 0,
            failed: false,
            failureReason: null,
            handler: "",
            processed: false,
            address
        });
    }

    /**
     * Sets the failure status for this URL, and saves the URL.
     * @param reason
     * @param handler
     */
    public async setFailed(reason: string, handler?: string) {
        this.processed = true;
        this.failed = true;
        this.failureReason = reason;
        this.handler = handler || 'none';
        return this.save();
    }
}

