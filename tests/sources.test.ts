import DBSource from "../src/engine/database/entities/db-source";
import SavedPostSource from "../src/engine/sources/saved-post-source";
import {availableSources, makeSource} from "../src/engine/sources";
import Source from "../src/engine/sources/source";
import DBSubmission from "../src/engine/database/entities/db-submission";
import DBSourceGroup from "../src/engine/database/entities/db-source-group";
import DBFilter from "../src/engine/database/entities/db-filter";
import {makeDB} from "../src/engine/database/db";
import {DBEntity} from "../src/engine/database/entities/db-entity";
import {forGen} from "../src/engine/util/generator-util";
import DBDownload from "../src/engine/database/entities/db-download";

describe("Source Tests", () => {
    beforeEach(async () => {
        const conn = await makeDB();
        await conn.synchronize(true);  // Rerun sync to drop & recreate existing tables.
    });

    it("basic source loading", async () => {
        const dbs = DBSource.build({type: 'saved-posts', dataJSON: `{"getComments":true}`, id: 0, name: ""});
        const src = new SavedPostSource().createFromDB(dbs);
        expect(src instanceof Source).toBeTruthy();
    });

    it("invalid source errors", async () => {
        const dbs = DBSource.build({type: 'fake-source', dataJSON: `{"getComments":true}`, id: 0, name: ""});
        expect(() => makeSource(dbs)).toThrow();
    });

    it("all source types unique", async () => {
        const src = availableSources();
        expect(new Set(src.map(s => s.type)).size).toEqual(src.length);
    });

    it("schema coercion works", async () => {
        const dbs = DBSource.build({type: 'saved-posts', dataJSON: `{"getComments":"true"}`, id: 0, name: ""});
        const src = new SavedPostSource().createFromDB(dbs);
        expect(src instanceof Source).toBeTruthy();
    });

    it("coercion raises errors", async () => {
        const dbs = DBSource.build({type: 'saved-posts', dataJSON: `{"getComments":"blargh"}`, id: 0, name: ""});

        expect(() => new SavedPostSource().createFromDB(dbs)).toThrow();
    });

    it("saved-posts source", async () => {
        const dbs = DBSource.build({type: 'saved-posts', dataJSON: `{"getComments":false}`, id: 0, name: ""});
        const src = makeSource(dbs);

        expect(src).toBeTruthy();

        const gen = src!.find();
        const count = await forGen(gen, post => {
            expect(post instanceof DBSubmission).toBeTruthy();
        });

        expect(count).toEqual(1);
    });

    it("subreddit-posts source", async () => {
        const dataJSON = JSON.stringify({ subreddit: 'news', type: 'top', time: 'all', limit: 10 });
        const dbs = DBSource.build({type: 'subreddit-posts', dataJSON, id: 0, name: ""});
        const src = makeSource(dbs);

        expect(src).toBeTruthy();

        const gen = src!.find();
        const count = await forGen(gen, post => {
            expect(post instanceof DBEntity).toBeTruthy();
        });

        expect(count).toEqual(10);
    });

    it("upvoted-posts source", async () => {
        const dbs = DBSource.build({type: 'upvoted-posts', dataJSON: `{"limit":1}`, id: 0, name: ""});
        const src = makeSource(dbs);

        expect(src).toBeTruthy();

        const gen = src!.find();
        const count = await forGen(gen, post => {
            expect(post instanceof DBSubmission).toBeTruthy();
        });

        expect(count).toEqual(1);
    });

    it("source group loading", async () => {
        const sg = DBSourceGroup.build({color: "", id: 0, name: "test-group"});
        const src = DBSource.build({dataJSON: `{"getComments":true}`, id: 0, name: "test-source", type: 'saved-posts'});
        const fi = DBFilter.build({
            comparator: "re",
            field: "title",
            forSubmissions: true,
            valueJSON: JSON.stringify('test')
        });
        (await sg.sources).push(src);
        (await sg.filters).push(fi);
        await sg.save();

        const loaded = await DBSourceGroup.findOne({id: 0});
        expect(loaded).toBeTruthy();

        let gen = loaded!.getPostGenerator();
        let found = await forGen(gen, async ele => {
            await ele.save();
            expect(ele instanceof DBEntity).toBeTruthy();
        });

        expect(found).toBe(2);
        expect((await DBDownload.find()).length).toEqual(2);
    });
});
