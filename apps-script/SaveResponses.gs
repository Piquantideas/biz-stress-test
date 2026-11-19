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
 *
 * Email alerts: every saved submission is emailed to the account that owns this script (no address is
 * stored in this file, because the repo is public). The first time, run sendTestAlert once from the
 * editor and allow the new "send email as you" permission, then redeploy a new version.
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
    // The alert must never stop a submission from being saved.
    try { notify_(d, sheet, sheet.getLastRow()); } catch (mailErr) { console.error('Alert email failed: ' + mailErr); }
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, reason: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Emails the script owner a summary of one saved submission, with a link to its row.
function notify_(d, sheet, rowNumber) {
  var to = Session.getEffectiveUser().getEmail();
  if (!to) return;
  var f = d.feedback || {}, c = d.contact || {};
  var wantsContact = d.consentContact && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email || '');
  var rowUrl = sheet.getParent().getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + rowNumber;
  var line = function (label, value) { return value === undefined || value === null || value === '' ? '' : label + ': ' + value + '\n'; };
  var subject = (wantsContact ? 'Review request' : 'Scorecard response') + ': ' +
    (d.industry || d.category || 'Unknown industry') + ', PRI ' + Math.round(Number(d.pri) || 0) + ' (' + (d.band || '?') + ')' +
    (c.business ? ' – ' + c.business : '');
  var body =
    (wantsContact ? 'This person asked for a free 30-minute Resilience Review. The page told them: "We\'ll be in touch within two working days."\n\n' : '') +
    'CONTACT\n' +
    line('Name', c.name) + line('Business', c.business) + line('Email', c.email) + line('Phone', c.phone) +
    line('OK to contact', d.consentContact ? 'Yes' : 'No') +
    '\nRESULT\n' +
    line('Industry', (d.category || '') + (d.industry && d.industry !== d.category ? ' / ' + d.industry : '')) +
    line('Respondent', d.respondentType) +
    line('PRI', Math.round(Number(d.pri) || 0) + ' (likely ' + d.rangeLow + ' to ' + d.rangeHigh + '), ' + d.band) +
    line('Monthly profit today (S$)', d.monthlyProfit) + line('Monthly profit if risks hit (S$)', d.monthlyProfitIfHit) +
    line('Moves shown', (d.plays || []).join(', ')) +
    line('Link tag', [d.source, d.hook].filter(Boolean).join('.')) +
    '\nFEEDBACK\n' +
    line('Result felt', f.resultFelt) + line('Most worried about', f.mostWorried) +
    line('Biggest change ahead', f.biggestChange) + line('Other factors', f.otherFactors) + line('Unclear or missing', f.unclear) +
    '\nRow ' + rowNumber + ' in Responses: ' + rowUrl + '\n';
  MailApp.sendEmail({ to: to, subject: subject.slice(0, 200), body: body, name: 'Piquant Scorecard',
    replyTo: wantsContact ? c.email : to });
}

// Run once from the editor to grant the email permission and see what an alert looks like. Saves nothing.
function sendTestAlert() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  notify_({ category: 'Food & Beverage', industry: 'Test only', respondentType: 'Owner', pri: 50, rangeLow: 37, rangeHigh: 63,
    band: 'Exposed', plays: ['Lock and buffer'], feedback: { resultFelt: 'About right' },
    contact: { name: 'Test', business: 'Test alert (nothing was saved)' }, consentContact: false }, sheet, sheet.getLastRow());
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
