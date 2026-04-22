# Premiere Pro Script Importer (yt-dlp)

This is a custom Premiere Pro extension designed to parse Google Doc scripts, extract all video URLs (general & TikTok), download them using `yt-dlp`, and automatically drop them into your active sequence in perfect script order!

## Prerequisites

1. **yt-dlp**: You must have `yt-dlp` installed and available in your system's PATH. 
2. **ffmpeg**: You must have `ffmpeg` installed and in your system's PATH (required for yt-dlp to mux video and audio).

## Installation

Because this is a custom, unsigned extension, you will need to enable `PlayerDebugMode` in your registry and copy the folder into Adobe's extension directory.

### Step 1: Enable PlayerDebugMode
1. Search for **PowerShell** in your Windows Start Menu, right-click it, and select **Run as Administrator**.
2. Paste the following command and hit Enter:
```powershell
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
```
To enable PlayerDebugMode on Mac run the following command in the Terminal application:
```terminal
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

*(Note: If you are using an older version of Premiere Pro like 2020 or 2021, you may need to run the same command but replace `CSXS.11` with `CSXS.10` or `CSXS.9`)*

### Step 2: Install the Plugin Files
1. Open File Explorer.
2. Type `%APPDATA%\Adobe\CEP\extensions` in the address bar and hit Enter.
3. If the `CEP` or `extensions` folders do not exist, create them.
4. Copy this entire `Premiere_YTDLP_Plugin` folder into that `extensions` folder.

Your final path should look like this:
Windows: `C:\Users\YourName\AppData\Roaming\Adobe\CEP\extensions\Premiere_YTDLP_Plugin`
Mac: `/Users/YourName/Library/Application Support/Adobe/CEP/extensions/Premiere_YTDLP_Plugin`

### Step 3: Restart Premiere Pro
If you had Premiere Pro open, close it completely and reopen it.

---

## How to Use

1. Open a Premiere Pro project and **open or create a sequence** in your timeline.
2. In the top menu bar, click **Window > Extensions > YTDLP Importer**.
3. Paste the share link for your Google Doc script.
4. Click **Browse** and select an empty folder on your drive where you want the clips to be downloaded.
5. Click **Download & Import**.

**Workflow Note:** 
The plugin will download standard videos first. Then, it will pause and spawn a popup window telling you to turn on your VPN. This feature is added because TikTok is banned in some countries. Turn on your VPN, click **OK**, and it will download the TikTok videos. You can skip this step and just click **OK** if TikTok is not banned in your country. Finally, it will automatically place all the clips into your active sequence in the exact order they appeared in the Google Doc!
