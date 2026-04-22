const fs = require('fs');
const https = require('https');
const path = require('path');
const { spawn } = require('child_process');

let csInterface = new CSInterface();

function log(msg) {
    const logArea = document.getElementById('logArea');
    logArea.textContent += msg + '\n';
    logArea.scrollTop = logArea.scrollHeight;
}

document.getElementById('btnSelectFolder').addEventListener('click', () => {
    const result = window.cep.fs.showOpenDialogEx(false, true, "Select Output Folder", "", []);
    if (result.data && result.data.length > 0) {
        document.getElementById('outputFolder').value = result.data[0];
    }
});

document.getElementById('btnStart').addEventListener('click', async () => {
    let docUrl = document.getElementById('docUrl').value.trim();
    const outputFolder = document.getElementById('outputFolder').value.trim();

    if (!docUrl) {
        alert("Please enter a Google Doc link.");
        return;
    }
    if (!outputFolder) {
        alert("Please select an output folder.");
        return;
    }

    if (docUrl.includes('/edit')) {
        docUrl = docUrl.split('/edit')[0] + '/export?format=txt';
    }

    document.getElementById('btnStart').disabled = true;
    document.getElementById('logArea').textContent = "";
    log("Fetching Google Doc...");

    try {
        const text = await fetchGoogleDoc(docUrl);
        log("Document fetched successfully.");
        
        const urls = extractUrls(text);
        log(`Found ${urls.length} URLs in total.`);
        
        const generalLinks = [];
        const tiktokLinks = [];
        
        urls.forEach((url, index) => {
            const numPrefix = String(index + 1).padStart(3, '0') + '_';
            const item = { url: url, prefix: numPrefix, index: index + 1 };
            
            if (url.includes('tiktok.com')) {
                tiktokLinks.push(item);
            } else {
                generalLinks.push(item);
            }
        });
        
        log(`General links: ${generalLinks.length}`);
        log(`TikTok links: ${tiktokLinks.length}`);

        if (generalLinks.length > 0) {
            log("\n--- Starting General Downloads ---");
            for (let i = 0; i < generalLinks.length; i++) {
                let item = generalLinks[i];
                log(`[${item.index}/${urls.length}] Downloading: ${item.url}`);
                await runYtDlp([item.url, '-S', 'ext:mp4:m4a', '-o', `${item.prefix}%(title)s.%(ext)s`], outputFolder);
            }
            log("General downloads completed.");
        }

        if (tiktokLinks.length > 0) {
            alert("Please turn on your VPN for TikTok links, then click OK to continue downloading.");
            log("\n--- Starting TikTok Downloads ---");
            for (let i = 0; i < tiktokLinks.length; i++) {
                let item = tiktokLinks[i];
                log(`[${item.index}/${urls.length}] Downloading: ${item.url}`);
                await runYtDlp([item.url, '-o', `${item.prefix}%(title)s.%(ext)s`], outputFolder);
            }
            log("TikTok downloads completed.");
        }

        log("\nAll downloads finished! Importing to Premiere sequence...");
        
        const script = `importFilesAndAddToSequence("${outputFolder.replace(/\\/g, '\\\\')}")`;
        csInterface.evalScript(script, (res) => {
            log("Process completed. Premiere response: " + res);
            document.getElementById('btnStart').disabled = false;
        });

    } catch (err) {
        log("ERROR: " + err.message);
        document.getElementById('btnStart').disabled = false;
    }
});

function fetchGoogleDoc(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchGoogleDoc(res.headers.location));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches : [];
}

function runYtDlp(args, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', args, { cwd: cwd });

        proc.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) log("  > " + line.trim());
            });
        });

        proc.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) log("  > [error] " + line.trim());
            });
        });

        proc.on('close', (code) => {
            resolve();
        });
        
        proc.on('error', (err) => {
            resolve();
            log("  > [error] Failed to start yt-dlp. Make sure it is in your PATH.");
        });
    });
}
