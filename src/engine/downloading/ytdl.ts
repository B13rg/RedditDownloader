import {sharedPath, mkParents} from "../core/paths";
import {downloadBinary, getRaw} from "../util/http";
import * as fs from "fs";
import path from 'path';
import crypto from 'crypto';
import {ChildProcess} from "child_process";
import {DownloadProgress} from "../core/state";
import {GracefulStopError} from "./downloader-wrappers/download-wrapper";
import {checkFFMPEGDownload, ffmpegPath} from "../file-processing/ffmpeg";
import * as os from "os";
const YoutubeDlWrap = require("youtube-dl-wrap");

async function getChecksum(path: string): Promise<string> {
    if (!fs.existsSync(path)) throw Error('YTDL executable is missing.');

    return new Promise(function (resolve, reject) {
        const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(path);

        input.on('error', reject);

        input.on('data', function (chunk) {
            hash.update(chunk);
        });

        input.on('close', function () {
            resolve(hash.digest('hex'));
        });
    });
}

const arch = os.arch() === 'x86' ? '_x86' : '';
const isWin = process.platform === 'win32' || process.env.NODE_PLATFORM === 'windows';
const ext = isWin ? '.exe':'';
const fileName = `yt-dlp${arch}${ext}`;
const updateURL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/`;

export const exePath = sharedPath('bin', `yt-dlp${ext}`);

const ytdl = new YoutubeDlWrap(exePath);


export async function getLocalVersion(): Promise<string> {
   try{
       return await getChecksum(exePath);
   } catch (err) {
       return '';
   }
}

export async function getLatestVersion() {
    const res: string = await getRaw(`${updateURL}SHA2-256SUMS`);
    const lines = res.split('\n');

    for (const l of lines) {
        const [ver, hash] = l.split(':');
        if (ver.trim() === fileName) {
            return hash.trim();
        }
    }

    console.warn(`Cannot locate latest appropriate YT-DLP download. ${fileName}`);
    return null;
}

/**
 * Check the latest local YTDL version, if any, and update if the latest published version doesn't match.
 * Also updates FFMPEG binaries, since they are a requirement for YTDL.
 */
export async function autoUpdate() {
    const loc = await getLocalVersion();
    const rem = await getLatestVersion();

    await checkFFMPEGDownload();

    if (!loc || rem && (rem !== loc)) {
        await downloadBinary(`${updateURL}${fileName}`, exePath);
        fs.chmodSync(exePath, '755');
        return true;
    }

    return false;
}


function makeArgs(url: string, opts: Record<string, string>) {
    const args = [];

    if(url) args.push(url);

    const all = Object.assign({}, defaultYTOptions, opts);

    for (const k of Object.keys(all)) {
        const v = all[k];

        args.push(k.length === 1 ? `-${k}` : `--${k.replace(/_/gm, '-')}`);
        if (v) args.push(v);
    }

    return args
}


const defaultYTOptions = {
    // https://github.com/ytdl-org/youtube-dl/blob/master/README.md#format-selection
    format: '(bestvideo+bestaudio/best)[protocol^=http]',  // combine best video and audio, and limit to protocol ID starting with "http".
    prefer_ffmpeg: '',
    ffmpeg_location: ffmpegPath(),
    add_metadata: '',
    no_playlist: ''
};


/**
 * Downloads a URL using youtube-dl. Returns the full file name, if the download works.
 */
export async function download(url: string, filePath: string, progress?: DownloadProgress): Promise<string> {
    await mkParents(filePath);
    const parDir = path.dirname(filePath);
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 20);
    const tmpPath = path.join(parDir, hash);

    return new Promise(async (res, rej) => {
        // YTDL just randomly ignores extensions, so just let it choose then find it again.
        const download = await ytdl.exec(makeArgs(url,{
            output: tmpPath + '.%(ext)s',
        })).on("progress", (prog: any) => {
            if (progress?.shouldStop) {
                child.kill();
                return rej(new GracefulStopError('YTDL Terminated Child'))
            }
            if (progress) {
                progress.status = 'Downloading with YTDL...';
                progress.percent = prog.percent/100;
                progress.knowsPercent = !!prog.percent;
            }
        }).on("error", rej);

        const child: ChildProcess = download.youtubeDlProcess;
        child.on('exit', async function() {
            if (progress?.shouldStop) rej(new GracefulStopError('YTDL Child exit'));
            fs.readdir(parDir, async (err, files) => {
                if(err) rej(err);

                const file = files.find(f => f.includes(hash));
                if (file) {
                    const final = filePath + `${path.extname(file)}`;
                    fs.rename(path.join(parDir, file), final, err => {
                        if (err) rej(err);
                        res(final)
                    });
                } else {
                    rej('No file found matching hash.');
                }
            });
        });
    });
}
