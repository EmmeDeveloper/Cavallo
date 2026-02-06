/*
 * ==========================================
 * U CAVADDU RUNNER - Leaderboard Backend
 * Google Apps Script (Web App)
 * ==========================================
 *
 * SETUP:
 * 1. Crea un nuovo Google Sheet
 * 2. Nella prima riga scrivi:  Nickname | Score | Date
 * 3. Vai su Extensions > Apps Script
 * 4. Cancella il codice di default e incolla tutto questo file
 * 5. Deploy > New deployment
 *    - Tipo: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copia l'URL del deployment
 * 7. Incollalo in index.src.html nella variabile LEADERBOARD_URL
 *
 * ENDPOINTS (tutto via GET):
 *   ?action=get                         -> ritorna top 5 JSON
 *   ?action=submit&nickname=xxx&score=123 -> aggiunge riga + ritorna top 5
 */

function doGet(e) {
  var action = e.parameter.action || 'get';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (action === 'submit') {
    var nickname = (e.parameter.nickname || '').substring(0, 12);
    var score = parseInt(e.parameter.score) || 0;

    if (nickname && score > 0) {
      sheet.appendRow([nickname, score, new Date().toISOString()]);
    }
  }

  // Get top 5
  var data = sheet.getDataRange().getValues();
  // Skip header row
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      rows.push({ nickname: String(data[i][0]), score: Number(data[i][1]) });
    }
  }

  // Sort by score descending
  rows.sort(function(a, b) { return b.score - a.score; });

  // Top 5
  var top5 = rows.slice(0, 5);

  return ContentService
    .createTextOutput(JSON.stringify(top5))
    .setMimeType(ContentService.MimeType.JSON);
}
