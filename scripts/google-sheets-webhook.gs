/**
 * Create this as a STANDALONE script (recommended if Extensions → Apps Script fails):
 *   1. Go to https://script.google.com
 *   2. New project
 *   3. Paste this code → Save
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *   5. Authorize when asked (allow Google Sheets access)
 *   6. Copy the Web app URL into .env.local as GOOGLE_SHEETS_WEBAPP_URL
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1nLvc7-Id7cMRXcTQ3ggYbhzD2VF3H9YUCu5q-gWQyGI/edit
 * Headers (row 1): Timestamp | Guess | Suggested Name | Meaning | Submitted By
 */

var SHEET_ID = '1nLvc7-Id7cMRXcTQ3ggYbhzD2VF3H9YUCu5q-gWQyGI'

function doGet(e) {
  try {
    var p = (e && e.parameter) || {}

    if (p.guess && p.suggestedName && p.meaning && p.submittedBy) {
      var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]
      sheet.appendRow([
        new Date(),
        String(p.guess),
        String(p.suggestedName),
        String(p.meaning),
        String(p.submittedBy),
      ])
      return json_({ ok: true })
    }

    return json_({
      ok: true,
      message: 'Baby shower guess webhook is live',
    })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    var data = {}
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents)
    }
    return doGet({
      parameter: {
        guess: data.guess,
        suggestedName: data.suggestedName,
        meaning: data.meaning,
        submittedBy: data.submittedBy,
      },
    })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
