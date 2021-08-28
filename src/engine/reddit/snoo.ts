import snoowrap from 'snoowrap';
import DBSubmission from "../database/entities/db-submission";
import DBComment from "../database/entities/db-comment";
import DBSetting from "../database/entities/db-setting";
import {SubredditSorts, TimeRange} from "../../shared/source-interfaces";


type DBTypeConversion<T> = T extends snoowrap.Submission
    ? DBSubmission
    : DBComment;
type Post = snoowrap.Submission|snoowrap.Comment;

let _r: snoowrap|null = null;
/** Default Listing opts for Snoowrap. */
const defaultOpts = {
    skipReplies: true,
    amount: 50,
    append: false
};

/**
 * Returns a Reddit API wrapper, prepared with the given refresh token.
 * If called more than once, returns the same original wrapper.
 */
async function getAPI() {
    if (!_r) {
        const config: snoowrap.SnoowrapOptions = {
            "userAgent": await DBSetting.get('userAgent'),
            "clientId": "v4XVrdEH_A-ZaA",
            "clientSecret": "",
            "refreshToken": await DBSetting.get('refreshToken')
        };

        if (!config.refreshToken) throw Error('You need to authorize an account in the settings before RMD can scan the API!');

        _r = new snoowrap(config);
    }

    return _r;
}

/**
 * Remove the current Reddit API wrapper. Useful for when the access token is reset, or when users may be switched.
 */
export function disposeRedditAPI() {
    _r = null;
}

/**
 * Get the username of the currently authenticated account, or return null on any error.
 */
export async function getRedditUsername() {
    try {
        const api = await getAPI();
        return await api.getMe().fetch().then(userInfo => {
            return userInfo.name;
        });
    } catch (e) {
        return null;
    }
}

/**
 * Creates a generator which reads every post from the given Listing, requesting more from Reddit until it runs out.
 */
export async function* readListing<T extends snoowrap.Comment|snoowrap.Submission>(listing: snoowrap.Listing<T>, limit = 0) {
    let count = 0;
    do {
        for (const p of listing) {
            yield toDBO(p);
            if (limit && ++count >= limit) return count;
        }
        listing = await listing.fetchMore({
            skipReplies: true,
            amount: 50,
            append: false // Don't append new results, replace them in the new object.
        });
    } while (listing.length);

    return count;
}

/**
 * Get all posts saved by the current user.
 */
export async function* getSavedPosts(limit: number) {
    const api = await getAPI();
    let listing = await api.getMe().getSavedContent(defaultOpts);

    return yield* readListing(listing, limit);
}

/**
 * Get all Submissions upvoted by the current user.
 */
export async function* getUpvoted(limit: number) {
    const api = await getAPI();
    // @ts-ignore
    const listing: snoowrap.Listing<snoowrap.Submission> = await api.getMe().getUpvotedContent(defaultOpts);

    return yield* readListing(listing, limit);
}

/**
 * Get all Submissions upvoted by the current user.
 */
export async function* getSubreddit(subreddit: string, sort: SubredditSorts, time: TimeRange, limit: number) {
    const api = await getAPI();
    const sub = api.getSubreddit(subreddit);
    const opts = { time };

    let listing;
    switch (sort) {
        case 'hot':
            listing = await sub.getHot();
            break;
        case 'new':
            listing = await sub.getNew();
            break;
        case 'top':
            listing = await sub.getTop(opts);
            break;
        case 'rising':
            listing = await sub.getRising();
            break;
    }

    return yield* readListing(listing, limit);
}

export const getSubmission = async (id: string) => {
    const api = await getAPI();
    return toDBO(api.getSubmission(id.replace(/^t._/i, '')));
}

export const getComment = async (id: string) => {
    const api = await getAPI();
    return toDBO(api.getComment(id.replace(/^t._/i, '')));
}

/**
 * Pick the given values into a new Object.
 * If any values are missing initially, the object's `fetch()` method will be awaited before continuing.
 * @param obj
 * @param keys
 */
export async function picker<T extends Post, K extends keyof T>(obj: T, keys: K[]): Promise<{[key in K]: T[key]}> {
    const ret: any = {};
    let waited = 0;
    for (const k of keys) {
        if (!obj.hasOwnProperty(k)) {
            if (waited++) throw Error(`Unable to find the desired property "${k}" in object: ${obj}.`);
            // @ts-ignore
            obj = await obj.fetch();
        }
        ret[k] = await obj[k];
    }
    return ret;
}

/**
 * Convert the given snoo-wrapper object into a fully-resolved Database object, which can be saved and loaded.
 * @param post
 */
export async function toDBO<T extends Post, R extends DBTypeConversion<T>>(post: T): Promise<R> {
    if (isSubmissionID(post.name)) {
        return await DBSubmission.fromRedditSubmission(post as snoowrap.Submission) as R;
    } else {
        return await DBComment.fromRedditComment(post as snoowrap.Comment) as R;
    }
}

/**
 * Check if the given string represents a Submission ID ("name" in reddit API terms).
 * @param id
 */
export function isSubmissionID(id: string) {
    return id.startsWith('t3_');
}
