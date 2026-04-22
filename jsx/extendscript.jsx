function importFilesAndAddToSequence(folderPath) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return "Failed: Please open an active sequence in the timeline before running this script.";
        }

        var folder = new Folder(folderPath);
        if (!folder.exists) {
            return "Folder not found: " + folderPath;
        }

        var files = folder.getFiles(function(file) {
            return file instanceof File && (file.name.match(/\.(mp4|mov|mkv|webm)$/i));
        });

        if (files.length === 0) {
            return "No video files found to import.";
        }

        var filePaths = [];
        for (var i = 0; i < files.length; i++) {
            filePaths.push(files[i].fsName);
        }

        // Import the files into the insertion bin
        app.project.importFiles(filePaths, true, app.project.getInsertionBin(), false);

        // Allow Premiere a brief moment to register the files in the project
        $.sleep(1000);

        var insertionBin = app.project.getInsertionBin();
        var importedItems = [];
        
        for (var i = 0; i < insertionBin.children.numItems; i++) {
            var item = insertionBin.children[i];
            // Match our prefix logic (e.g., "001_", "002_")
            if (item.name.match(/^\d{3}_/)) {
                importedItems.push(item);
            }
        }

        if (importedItems.length === 0) {
            return "Files were imported, but could not be located in the bin for timeline insertion.";
        }

        // Sort items numerically/alphabetically
        importedItems.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        // Insert into the active sequence
        var videoTrack = seq.videoTracks[0];
        var insertedCount = 0;
        
        for (var i = 0; i < importedItems.length; i++) {
            var clipItem = importedItems[i];
            if (clipItem.type === ProjectItemType.CLIP) {
                videoTrack.insertClip(clipItem, seq.end);
                insertedCount++;
            }
        }

        return "Successfully imported and added " + insertedCount + " clips sequentially to the timeline.";
    } catch (e) {
        return "Error: " + e.toString();
    }
}
