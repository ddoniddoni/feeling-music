const fs = require('fs');
const { mkdirp } = require('mkdirp');
const {
    loadSpreadsheet,
    localesPath,
    ns,
    lngs,
    sheetId,
    columnKeyToHeader,
    NOT_AVAILABLE_CELL,
} = require('./index');

/**
 * fetch translations from google spread sheet and transform to json
 * @param {GoogleSpreadsheet} doc GoogleSpreadsheet document
 * @returns [object] translation map
 * {
 *   "ko-KR": {
 *     "key": "value"
 *   },
 *   "en-US": {
 *     "key": "value"
 *   },
 *   "ja-JP": {
 *     "key": "value"
 *   },
 *   "zh-CN": {
 *     "key": "value"
 *   },
 * }
 */
async function fetchTranslationsFromSheetToJson(doc) {
    const sheet = doc.sheetsById[sheetId];
    if (!sheet) {
        return {};
    }

    const lngsMap = {};
    const rows = await sheet.getRows();

    rows.forEach((row) => {
        // const key = row[columnKeyToHeader.key];
        const key = row.get(columnKeyToHeader.key);
        lngs.forEach((lng) => {
            const translation = row.get(columnKeyToHeader[lng]);
            // NOT_AVAILABLE_CELL("_N/A") means no related language
            if (translation === NOT_AVAILABLE_CELL) {
                return;
            }

            if (!lngsMap[lng]) {
                lngsMap[lng] = {};
            }

            // console.log('key : ', lng, translation);
            lngsMap[lng][key] = translation || ''; // prevent to remove undefined value like ({"key": undefined})
        });
    });

    return lngsMap;
}

async function checkAndMakeLocaleDir(dirPath, subDirs) {
    try {
        await Promise.all(
            subDirs.map(async (subDir) => {
                const fullPath = `${dirPath}/${subDir}`;
                await mkdirp(fullPath);
            }),
        );
    } catch (error) {
        console.error('디렉토리 생성 중 오류:', error);
        throw error;
    }
}

async function updateJsonFromSheet() {
    const download = '.' + localesPath.replace(`${ns}`, '');
    await checkAndMakeLocaleDir(download, lngs);

    const doc = await loadSpreadsheet();
    const lngsMap = await fetchTranslationsFromSheetToJson(doc);

    // console.log('download : ', download);
    fs.readdir(download, (error, lngs) => {
        if (error) {
            throw error;
        }

        lngs.forEach((lng) => {
            const localeJsonFilePath = `${download}/${lng}/${ns}.json`;
            const jsonString = JSON.stringify(lngsMap[lng], null, 2);
            fs.writeFile(localeJsonFilePath, jsonString, 'utf8', (err) => {
                if (err) {
                    throw err;
                }
            });
        });
    });
}

updateJsonFromSheet();
