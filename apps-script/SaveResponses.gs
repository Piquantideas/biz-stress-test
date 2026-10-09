/**
 * Piquant Resilience Scorecard: saves each submission to the "Responses" tab.
 *
 * Setup (once):
 * 1. Open the PRI Scoring Workbook in Google Sheets.
 * 2. Extensions > Apps Script. Delete any code there and paste this whole file. Save.
 * 3. Deploy > New deployment > Select type: Web app.
 *    Execute as: Me. Who has access: Anyone. Deploy, and allow the permissions it asks for.
 * 4. Copy the Web app URL (it ends in /exec) and send it to Claude.
 *
 * After any change to this code: Deploy > Manage deployments > Edit > Version: New version > Deploy.
 * The URL stays the same.
 */

var SHEET_NAME = 'Responses';
var MAX_TEXT = 2000;
var DIMENSIONS = ['Customer', 'Proposition & Brand', 'Channels & Reach', 'Revenue Model',
  'Cost, Margin & Cash', 'Operations & Supply', 'People & Leadership', 'Technology & Capability'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || d.consentResearch !== true) return reply_({ ok: false, reason: 'no research consent' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return reply_({ ok: false, reason: 'Responses tab not found' });

    var h = d.dimensionHealth || {}, f = d.feedback || {}, c = d.contact || {};
    var row = [
      new Date(), d.submittedAt, d.libraryVersion, d.respondentType, d.category, d.industry, d.sectorPack,
      d.source, d.hook, num_(d.pri), num_(d.rangeLow), num_(d.rangeHigh), d.band,
      num_(d.readiness), num_(d.profitBuffer), num_(d.monthlyRevenue), num_(d.monthlyProfit),
      num_(d.monthlyProfitIfHit), num_(d.monthlyExpectedLoss)
    ];
    DIMENSIONS.forEach(function (name) { row.push(num_(h[name])); });
    row.push(
      (d.plays || []).join(', '), f.resultFelt, f.mostWorried, f.biggestChange, f.otherFactors, f.unclear,
      c.name, c.business, c.email, c.phone,
      d.consentResearch ? 'Yes' : 'No', d.consentContact ? 'Yes' : 'No',
      d.consentContact && c.email ? 'Contact given' : 'Completed',
      JSON.stringify(d.answers || [])
    );
    sheet.appendRow(row.map(clean_));
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, reason: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you check the deployment is live by opening the URL in a browser.
function doGet() {
  return reply_({ ok: true, message: 'Piquant scorecard endpoint is running.' });
}

function num_(v) {
  var n = Number(v);
  return (v === null || v === undefined || v === '' || isNaN(n)) ? '' : n;
}

// Stops text answers from being read as spreadsheet formulas, and caps their length.
function clean_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') {
    v = v.slice(0, MAX_TEXT);
    if (/^[=+\-@]/.test(v)) v = "'" + v;
  }
  return v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
