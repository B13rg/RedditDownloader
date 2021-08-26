import snoowrap from 'snoowrap';
import {Entity, Column, PrimaryColumn, OneToMany} from 'typeorm';
import {picker} from "../../reddit/snoo";
import DBComment from "./db-comment";
import DBDownload from "./db-download";
import {DBEntity} from "./db-entity";
import {PsSubmission} from "../../reddit/pushshift";
import {SubmissionInterface} from "../../../shared/submission-interface";


@Entity({ name: 'submissions' })
export default class DBSubmission extends DBEntity implements SubmissionInterface {
    @PrimaryColumn()
    id!: string;

    @Column({ type: "text" })
    title!: string;

    @Column()
    author!: string;  // Maybe split this into an "Authors" table?

    @Column()
    subreddit!: string;

    @Column({ type: "text", nullable: false })
    selfText!: string;

    @Column()
    score!: number;

    @Column()
    isSelf!: boolean;

    @Column()
    createdUTC!: number;

    @Column()
    firstFoundUTC!: number;

    @Column()
    nsfw!: boolean;

    @Column({ type: "text", nullable: true })
    flairText!: string|null;

    @Column({ default: false })
    processed!: boolean;

    /**
     * If false, this Submission was loaded simply for its metadata (to attach to a comment).
     * If false, avoid processing. Defaults true.
     */
    @Column({ default: true })
    shouldProcess!: boolean;

    @Column({ default: false })
    fromPushshift!: boolean;

    @OneToMany(() => DBComment, comm => comm.parentSubmission, {cascade: true})
    children!: Promise<DBComment[]>;

    @OneToMany(() => DBDownload, dl => dl.parentSubmission, {cascade: true})
    downloads!: Promise<DBDownload[]>;

    loadedData?: snoowrap.Submission|PsSubmission;

    static async fromRedditSubmission(submission: snoowrap.Submission): Promise<DBSubmission> {
        return picker(submission, ['name', 'title', 'subreddit_name_prefixed', 'selftext', 'score', 'is_self', 'created_utc', 'over_18', 'author', 'link_flair_text']).then(sub => {
            return DBSubmission.build({
                id: sub.name,
                title: sub.title,
                author: sub.author.name,
                createdUTC: sub.created_utc*1000,
                firstFoundUTC: Date.now(),
                isSelf: sub.is_self,
                nsfw: sub.over_18,
                flairText: sub.link_flair_text,
                processed: false,
                shouldProcess: true,
                score: sub.score,
                selfText: sub.selftext || '',
                subreddit: sub.subreddit_name_prefixed.replace(/^\/?r\//, ''),
                loadedData: submission,
                fromPushshift: false
            })
        })
    }

    static fromPushShiftSubmission(sub: PsSubmission): DBSubmission {
        return DBSubmission.build({
            id: sub.id,
            title: sub.title,
            author: sub.author,
            createdUTC: sub.created_utc*1000,
            firstFoundUTC: Date.now(),
            isSelf: sub.is_self,
            nsfw: sub.over_18,
            flairText: sub.link_flair_text ? sub.link_flair_text.trim() : null,
            processed: false,
            shouldProcess: true,
            score: sub.score,
            selfText: sub.selftext || '',
            subreddit: sub.subreddit,
            loadedData: sub,
            fromPushshift: true
        })
    }

    /**
     * Simple wrapper to simplify building a test DBSubmission object without needing to fetch real data.
     */
    static buildTest(opts?: Partial<DBSubmission>) {
        return DBSubmission.build({
            author: "test-author",
            createdUTC: Date.now(),
            firstFoundUTC: 0,
            flairText: '',
            id: `t3_${Math.round(Math.random()*1000000)}`,
            isSelf: false,
            nsfw: false,
            processed: false,
            score: 0,
            selfText: "",
            shouldProcess: false,
            subreddit: "test_sub",
            title: "test title",
            fromPushshift: false,
            ...opts
        });
    }
}
