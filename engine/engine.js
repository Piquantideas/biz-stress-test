var LIBRARY_VERSION = "v1.1";

var LIB = {
  dims: [
    { id: "D1", name: "Customer" }, { id: "D2", name: "Proposition & Brand" }, { id: "D3", name: "Channels & Reach" },
    { id: "D4", name: "Revenue Model" }, { id: "D5", name: "Cost, Margin & Cash" }, { id: "D6", name: "Operations & Supply" },
    { id: "D7", name: "People & Leadership" }, { id: "D8", name: "Technology & Capability" }
  ],
  packs: {
    "Default":  { weights: [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5], floor: 0,     target: 0.15 },
    "F&B":      { weights: [15, 10, 10, 10, 20, 20, 10, 5],                 floor: -0.05, target: 0.12 },
    "Services": { weights: [15, 20, 10, 15, 10, 5, 15, 10],                 floor: 0,     target: 0.20 },
    "Wellness": { weights: [15, 15, 10, 15, 15, 10, 15, 5],                 floor: 0,     target: 0.15 },
    "E-commerce": { weights: [15, 15, 20, 10, 15, 15, 5, 5],                floor: -0.05, target: 0.12 }
  },
  params: { freeConfidence: 0.35, rangeFactor: 20, bandActNow: 40, bandPrepared: 65, selfReportConfidence: 0.4, wellnessContribution: 0.85 },
  shockConfidence: { High: 0.75, Medium: 0.6, Low: 0.4 },
  timing: { 5: 1, 4: 1, 3: 0.7, 2: 0.4, 1: 0.2 },
  shocks: {
    S01: { name: "El Niño food-cost wave", confidence: "Medium", urgency: 4, moderate: 0.20, severe: 0.35 },
    S02: { name: "RTS Link opens (Feb 2027)", confidence: "Low", urgency: 5 }
  },
  plays: {
    P01: { pattern: "Risk swap", moves: "Payment shifts to after results",
      ex: { "F&B": "Supply corporate pantries or partner outlets on consignment, paid as items sell.", "Services": "Charge a lower base fee plus a success fee tied to an agreed result.", "Wellness": "A first session clients pay for in full only if they see the agreed result.", "E-commerce": "Try-before-you-buy, or pay-on-delivery for first orders; place stock with retailers on consignment.", "Default": "Let new customers pay part of the price after they see results." },
      gain: "Lower entry cost and less risk" },
    P02: { pattern: "Supply model", moves: "Revenue comes from supplying, not fees",
      ex: { "F&B": "Mixue earns over 90% of its revenue selling ingredients and supplies to franchisees, not from fees. Supply your sauces, premixes and frozen items to every outlet or partner kitchen.", "Services": "Supply your tools, templates or data to partner firms that serve your clients.", "Wellness": "Supply your signature products to other salons, clinics and gyms.", "E-commerce": "Wholesale your products to other shops and marketplace sellers.", "Default": "Sell the inputs, parts or consumables your customers keep needing, not just the one-off job." },
      gain: "Low prices from scale buying" },
    P03: { pattern: "Productise", moves: "A service or dish becomes a product",
      ex: { "F&B": "Have an OEM manufacturer make your signature items to heat and serve in store, and sell them as packs for retail and export.", "Services": "Turn your most common job into a fixed-price, fixed-scope package clients can say yes to quickly.", "Wellness": "Turn your signature treatment into home-care kits and retail products.", "E-commerce": "Build your own-brand range or bundles instead of reselling what anyone can list.", "Default": "Package what you do most into a fixed-price product with a clear name and scope." },
      gain: "Consistent quality, available beyond the shop or the hours" },
    P04: { pattern: "Lock and buffer", moves: "Cost is fixed before it rises",
      ex: { "F&B": "Buy forward and freeze 3 to 6 months of your most exposed ingredients, and agree fixed-price contracts with key suppliers.", "Services": "Agree multi-year rates with key suppliers and software, and lock rent early.", "Wellness": "Lock your lease and product supplier prices early, and hold buffer stock of key consumables.", "E-commerce": "Lock supplier prices and shipping rates, and hold buffer stock of best-sellers.", "Default": "Lock prices with key suppliers now and hold buffer stock of critical inputs." },
      gain: "Stable prices while competitors raise theirs" },
    P05: { pattern: "Prepay", moves: "Cash comes before delivery",
      ex: { "F&B": "Sell prepaid meal credits or a monthly membership to regulars, and use the cash to buy stock at today's prices.", "Services": "Move one-off projects onto retainers or subscriptions billed in advance.", "Wellness": "Sell packages and memberships that reward regular visits.", "E-commerce": "Subscriptions and pre-orders that fund stock before you buy it.", "Default": "Offer prepaid packages or memberships at a small discount." },
      gain: "Better value for loyal customers" },
    P06: { pattern: "Network, not headcount", moves: "Capacity grows without fixed cost",
      ex: { "F&B": "Centralise prep in one kitchen, or a Johor production hub, so outlets run with fewer staff.", "Services": "Keep a small core team and a vetted bench of freelancers or a regional delivery hub.", "Wellness": "Use a bench of freelance practitioners for peak hours instead of more full-time staff.", "E-commerce": "Use a 3PL fulfilment partner or a Johor warehouse instead of more space and staff in Singapore.", "Default": "Use partners and a regional hub for capacity instead of adding fixed headcount in Singapore." },
      gain: "Faster service as demand grows" },
    P07: { pattern: "License the method", moves: "IP earns without the founder's hours",
      ex: { "F&B": "Document recipes and SOPs so partners can franchise or license your concept.", "Services": "Document your method so partner firms can deliver it under licence.", "Wellness": "Train and certify other practitioners in your method, and license the brand.", "E-commerce": "License your brand to distributors in other markets.", "Default": "Write down how you do it so the team, or licensed partners, can deliver without you." },
      gain: "The same standard from more providers" },
    P08: { pattern: "Sell the outcome", moves: "Price follows the result, not the effort",
      ex: { "F&B": "Price corporate catering per head served or per event, with service included.", "Services": "Price per lead, booking or approval instead of per hour or deliverable.", "Wellness": "Price programmes on the result, such as an 8-week plan, not per session.", "E-commerce": "Bundle setup, refills or support with the product, priced on what the customer gets.", "Default": "Price on the result the customer gets, not the hours or materials." },
      gain: "Pays for results, not effort" },
    P09: { pattern: "Concept reset", moves: "The model is rebuilt around what customers come for",
      ex: { "F&B": "Keep the dishes customers come for and redesign around them: a smaller menu, a kiosk format or a delivery-first kitchen.", "Services": "Become the coach, not the doer: sell the playbook and reviews while clients execute with AI.", "Wellness": "Focus on your best-selling treatments in an express format with a smaller footprint.", "E-commerce": "Cut the range to your best-sellers and focus on the one channel you own.", "Default": "Cut the offer back to what customers value most, and rebuild cost and format around it." },
      gain: "A faster, cheaper version of what they actually want" },
    P10: { pattern: "Cross the border", moves: "Johor and ASEAN become a market or a cost base",
      ex: { "F&B": "From February 2027 the RTS carries up to 10,000 people an hour each way through Woodlands. Position for Johor visitors, or open in Johor with Johor costs and a Singapore brand.", "Services": "Serve Johor and ASEAN clients, or build delivery capacity there.", "Wellness": "From February 2027 the RTS brings Johor shoppers into Woodlands in five minutes. Position for them, or open in Johor with Johor costs and a Singapore brand.", "E-commerce": "Sell into Malaysian and ASEAN marketplaces, and fulfil from Johor to cut shipping and storage costs.", "Default": "Sell into Johor and ASEAN, or move part of production or back office there." },
      gain: "The same brand at a price that holds, on both sides of the border" }
  }
};

// ---------- industries ----------
var INDUSTRIES = [
  { label: "Food & Beverage", pack: "F&B", hint: "Hawker stalls, kiosks, restaurants", sub: ["Hawker stall", "Kiosk", "Restaurant", "Other F&B"] },
  { label: "Professional services", pack: "Services", hint: "Agencies, consultancies, accounting, legal, IT, training",
    sub: ["Marketing or creative agency", "Consultancy or advisory", "Accounting, legal or corporate services", "IT or tech services", "Training or HR services", "Other professional services"] },
  { label: "Beauty, health or wellness", pack: "Wellness", hint: "Salons, spas, clinics, TCM, fitness, aesthetics",
    sub: ["Hair or beauty salon", "Spa or massage", "Aesthetics or medical clinic", "TCM or allied health", "Fitness or wellness studio", "Other beauty or wellness"] },
  { label: "E-commerce", pack: "E-commerce", hint: "Online shops, marketplace sellers, D2C brands",
    sub: ["Own online store or D2C brand", "Marketplace seller (Shopee, Lazada, Amazon, TikTok Shop)", "Both our own store and marketplaces", "Social commerce or live selling", "Other e-commerce"] },
  { label: "Others", pack: "Default", hint: "Tell us your industry" }
];
function packFor(category) { for (var i = 0; i < INDUSTRIES.length; i++) if (INDUSTRIES[i].label === category) return INDUSTRIES[i].pack; return "Default"; }

// ---------- questions ----------
// kind "ready": options [text, score 0-3, playId?]; scored into dim.
// kind "num": options [text, value]; used by the stress test.
var Q = {
  REV:  { kind: "num", group: "Your numbers", text: "Roughly, what are your monthly sales or revenue?",
    options: [["Under S$30,000", 20000], ["S$30,000 to 80,000", 55000], ["S$80,000 to 200,000", 140000], ["S$200,000 to 500,000", 350000], ["Over S$500,000", 700000]] },
  MARGIN: { kind: "num", group: "Your numbers", text: "What is your net profit margin today, after rent, staff and all costs?",
    options: [["Breaking even or losing money", 0], ["1% to 5%", 0.03], ["5% to 10%", 0.075], ["10% to 15%", 0.125], ["Over 15%", 0.18]] },
  PASS: { kind: "num", group: "Your numbers", text: "If you raised prices 10% tomorrow, what would your customers do?",
    options: [["Many would stop buying", 0.1], ["Some would leave", 0.3], ["Most would stay", 0.5], ["They'd barely notice", 0.7]] },
  // F&B stress inputs
  LOC: { kind: "num", group: "Where you trade", text: "Where is your outlet, or where are most of your outlets?",
    options: [["In the north of Singapore (Woodlands, Marsiling, Admiralty, Sembawang, Yishun)", 0.08], ["Mainly in the central CBD area", 0.02], ["Across heartland estates", 0.04], ["In malls or tourist areas", 0.015]] },
  FOOD: { kind: "num", group: "Your numbers", text: "What do food and ingredients cost you, as a share of sales?",
    options: [["Under 25%", 0.22], ["25% to 30%", 0.28], ["30% to 35%", 0.33], ["35% to 40%", 0.38], ["Over 40%", 0.43]] },
  EXPOSED: { kind: "num", group: "Your numbers", text: "How much of your menu relies on rice, flour, sugar, cooking oil, beef, cocoa or coffee?",
    options: [["Most of it", 0.9], ["About half", 0.6], ["Some of it", 0.35], ["Very little", 0.15]] },
  // Services stress inputs
  AI: { kind: "num", group: "Technology", text: "How much of what clients pay you for could AI tools do to a “good enough” standard today?",
    options: [["Most of it", 0.6], ["A good part of it", 0.35], ["Some routine parts", 0.15], ["Very little. Clients pay for our judgement and accountability", 0.05]] },
  PRESS: { kind: "num", group: "Technology", text: "Over the next two years, how much do you expect fees for that AI-exposed work to fall?",
    options: [["Hardly at all", 0.05], ["About 10%", 0.1], ["About 25%", 0.25], ["40% or more", 0.4]] },
  // Default stress input
  COSTUP: { kind: "num", group: "Your numbers", text: "Over the next 12 months, how much do you expect your total costs to rise?",
    options: [["Under 5%", 0.03], ["5% to 10%", 0.075], ["10% to 15%", 0.125], ["More than 15%", 0.18]] },

  // Wellness stress input (LOC reused)
  LOC_W: { kind: "num", group: "Where you trade", text: "Where is your outlet, or where are most of your outlets?",
    options: [["In the north of Singapore (Woodlands, Marsiling, Admiralty, Sembawang, Yishun)", 0.08], ["Mainly in the central CBD area", 0.02], ["Across heartland estates", 0.04], ["In malls or tourist areas", 0.015]] },
  // E-commerce stress inputs
  ADSHARE: { kind: "num", group: "Your numbers", text: "What share of your sales goes to ads, marketplace commissions and platform fees?",
    options: [["Under 10%", 0.07], ["10% to 20%", 0.15], ["20% to 30%", 0.25], ["Over 30%", 0.35]] },
  ADUP: { kind: "num", group: "Your numbers", text: "Over the next 12 months, how much do you expect those fees and ad costs to rise?",
    options: [["Hardly at all", 0.03], ["About 10%", 0.1], ["About 20%", 0.2], ["30% or more", 0.3]] },
  OVERSEAS: { kind: "num", group: "Competition", text: "How much of your range could shoppers find cheaper from overseas sellers such as Temu, Shein or Taobao?",
    options: [["Most of it", 0.7], ["About half", 0.5], ["Some of it", 0.25], ["Very little", 0.05]] },
  CUT: { kind: "num", group: "Competition", text: "To keep those shoppers, how much would you have to cut prices on those items?",
    options: [["Hardly at all", 0.03], ["About 10%", 0.1], ["About 20%", 0.2], ["30% or more", 0.3]] },

  // Readiness, one or more per dimension
  CUST: { kind: "ready", dim: "D1", group: "Customer", text: "How well do you know your best customers, and can you reach them directly?",
    options: [["Not really", 0, "P05"], ["Only through social media followers", 1, "P05"], ["We keep a list we contact", 2], ["We track what each buys and talk to them regularly", 3]] },
  WHY: { kind: "ready", dim: "D2", group: "Proposition & Brand", text: "If a customer could get something similar for less elsewhere, why would they stay with you?",
    options: [["Honestly, price matters most", 0, "P09"], ["Mostly habit or our relationship", 1, "P03"], ["Our quality and track record", 2], ["A signature or specialism they can't get elsewhere", 3]] },
  REACH_FNB: { kind: "ready", dim: "D3", group: "Channels & Reach", text: "How do most customers find you?",
    options: [["Passing footfall at one location", 0, "P10"], ["Mostly delivery apps", 1, "P03"], ["Footfall plus our own social media and regulars list", 2], ["Several channels, including online orders we own", 3]] },
  REACH: { kind: "ready", dim: "D3", group: "Channels & Reach", text: "Where do most of your new customers come from?",
    options: [["Mostly one referrer, partner or platform", 0, "P01"], ["Referrals and word of mouth in general", 1, "P03"], ["Referrals, plus some marketing of our own", 2], ["Several channels, including enquiries we generate ourselves", 3]] },
  STREAMS_FNB: { kind: "ready", dim: "D4", group: "Revenue Model", text: "Do you earn anything beyond dine-in and takeaway?",
    options: [["No", 0, "P03"], ["Delivery apps only", 1, "P03"], ["Some catering, retail packs or online sales", 2], ["Retail, frozen or export products bring in real revenue", 3]] },
  SCALE_FNB: { kind: "ready", dim: "D4", group: "Revenue Model", text: "Is your brand ready to grow beyond your own outlets?",
    options: [["No, it's tied to us personally", 0, "P07"], ["People have asked to franchise, but we're not prepared", 1, "P07"], ["Recipes and SOPs are documented", 2, "P02"], ["We already license, franchise or export", 3, "P02"]] },
  RECUR: { kind: "ready", dim: "D4", group: "Revenue Model", text: "What share of your revenue is recurring (retainers, subscriptions, ongoing advisory)?",
    options: [["None", 0, "P05"], ["Under 20%", 1, "P05"], ["20% to 50%", 2], ["Over 50%", 3]] },
  TOP3: { kind: "ready", dim: "D4", group: "Revenue Model", text: "How much of your revenue comes from your top three clients?",
    options: [["Over 60%", 0, "P03"], ["40% to 60%", 1, "P03"], ["20% to 40%", 2], ["Under 20%", 3]] },
  STREAMS: { kind: "ready", dim: "D4", group: "Revenue Model", text: "How many meaningful revenue streams does the business have?",
    options: [["One product or service brings in almost everything", 0, "P03"], ["One main one, plus small extras", 1, "P05"], ["Two or three that each matter", 2], ["Several, including recurring income", 3]] },
  CASH: { kind: "ready", dim: "D5", group: "Cost, Margin & Cash", text: "If sales halved tomorrow, how long could you cover rent, wages and other fixed costs from cash?",
    options: [["Less than a month", 0, "P05"], ["1 to 3 months", 1, "P05"], ["3 to 6 months", 2], ["More than 6 months", 3]] },
  COSTING_FNB: { kind: "ready", dim: "D5", group: "Cost, Margin & Cash", text: "Do you know the food cost of every dish, and which ones turn unprofitable if costs rise?",
    options: [["No", 0, "P09"], ["Roughly, in my head", 1, "P09"], ["For our best-sellers", 2], ["Every item is costed and updated", 3]] },
  PRICING: { kind: "ready", dim: "D5", group: "Cost, Margin & Cash", text: "How do you mostly price your work?",
    options: [["Hourly or day rates", 0, "P08"], ["A fixed fee per deliverable", 1, "P08"], ["Project fees based on scope and value", 2], ["Outcome-based, or packaged products at fixed prices", 3]] },
  LOCK_FNB: { kind: "ready", dim: "D6", group: "Operations & Supply", text: "Have you locked in prices or stocked up on key ingredients for 2027?",
    options: [["Not yet", 0, "P04"], ["We've started talking to suppliers", 1, "P04"], ["Some prices are locked in", 2], ["Contracts are signed and stock is frozen", 3]] },
  MAKE_FNB: { kind: "ready", dim: "D6", group: "Operations & Supply", text: "How is your food made?",
    options: [["Each outlet cooks everything from scratch", 0, "P03"], ["Some prep is done centrally", 1, "P06"], ["Mostly in our own central kitchen", 2], ["Signature items are made by an OEM manufacturer and finished in store", 3]] },
  PARTNER: { kind: "ready", dim: "D6", group: "Operations & Supply", text: "If your most important supplier, partner or platform stopped working with you for 60 days, what would happen?",
    options: [["We couldn't deliver", 0, "P04"], ["Serious delays and a drop in quality", 1, "P06"], ["We'd cope, with some strain", 2], ["We have backups in place and would carry on", 3]] },
  FOUNDER: { kind: "ready", dim: "D7", group: "People & Leadership", text: "How dependent is the business on you personally?",
    options: [["Very little happens without me", 0, "P07"], ["I'm involved in every sale and every key decision", 1, "P07"], ["The team runs delivery; I lead sales and direction", 2], ["The team can win and deliver work without me", 3]] },
  REACH_W: { kind: "ready", dim: "D3", group: "Channels & Reach", text: "How do most new clients find you?",
    options: [["Walk-ins at one location", 0, "P10"], ["Mostly booking or deal apps", 1, "P03"], ["Referrals plus our own social media and client list", 2], ["Several channels, including online booking we own", 3]] },
  STREAMS_W: { kind: "ready", dim: "D4", group: "Revenue Model", text: "How much of your revenue comes from packages, memberships or retail products?",
    options: [["None", 0, "P05"], ["Under 20%", 1, "P03"], ["20% to 50%", 2], ["Over 50%", 3]] },
  KEYPRAC: { kind: "ready", dim: "D7", group: "People & Leadership", text: "If your top practitioner left tomorrow, how many clients would follow them?",
    options: [["Most of them", 0, "P07"], ["Many of them", 1, "P07"], ["A few", 2], ["Hardly any. Our method and brand keep them", 3]] },
  REACH_E: { kind: "ready", dim: "D3", group: "Channels & Reach", text: "How much of your sales come through marketplaces (Shopee, Lazada, Amazon, TikTok Shop) rather than your own site?",
    options: [["Over 80%", 0, "P05"], ["50% to 80%", 1, "P05"], ["20% to 50%", 2], ["Under 20%", 3]] },
  REPEAT: { kind: "ready", dim: "D4", group: "Revenue Model", text: "What share of your orders come from repeat customers?",
    options: [["Under 10%", 0, "P05"], ["10% to 25%", 1, "P05"], ["25% to 50%", 2], ["Over 50%", 3]] },
  STOCK: { kind: "ready", dim: "D6", group: "Operations & Supply", text: "How concentrated is where your stock comes from?",
    options: [["Almost all from one supplier", 0, "P04"], ["Several suppliers, but all in one country", 1, "P04"], ["Suppliers in two or three countries", 2], ["Well spread, with backups lined up", 3]] },
  TECH: { kind: "ready", dim: "D8", group: "Technology & Capability", text: "How much does the business use technology or automation to get work done (orders, scheduling, admin, delivery)?",
    options: [["Hardly at all", 0, "P06"], ["A few tools here and there", 1, "P06"], ["It's built into some of our workflows", 2], ["It's built into most workflows, and we track the time saved", 3]] },
  TECH_SVC: { kind: "ready", dim: "D8", group: "Technology & Capability", text: "How much does your own delivery already use AI or automation?",
    options: [["Not at all", 0, "P09"], ["A few people experiment with it", 1, "P09"], ["It's built into some of our workflows", 2], ["It's built into most workflows, and we track the time saved", 3]] }
};

var FLOWS = {
  "F&B": ["LOC", "REV", "FOOD", "MARGIN", "EXPOSED", "PASS", "CUST", "WHY", "REACH_FNB", "STREAMS_FNB", "SCALE_FNB", "CASH", "COSTING_FNB", "LOCK_FNB", "MAKE_FNB", "FOUNDER", "TECH"],
  "Services": ["REV", "MARGIN", "PASS", "AI", "PRESS", "CUST", "WHY", "REACH", "RECUR", "TOP3", "CASH", "PRICING", "PARTNER", "FOUNDER", "TECH_SVC"],
  "Wellness": ["LOC_W", "REV", "MARGIN", "PASS", "COSTUP", "CUST", "WHY", "REACH_W", "STREAMS_W", "CASH", "PARTNER", "KEYPRAC", "FOUNDER", "TECH"],
  "E-commerce": ["REV", "MARGIN", "PASS", "ADSHARE", "ADUP", "OVERSEAS", "CUT", "CUST", "WHY", "REACH_E", "REPEAT", "CASH", "STOCK", "FOUNDER", "TECH"],
  "Default": ["REV", "MARGIN", "PASS", "COSTUP", "CUST", "WHY", "REACH", "STREAMS", "CASH", "PARTNER", "FOUNDER", "TECH"]
};

var FEEDBACK = {
  felt: ["Too harsh", "About right", "Too soft"],
  worry: LIB.dims.map(function (d) { return d.name; })
};

// ---------- helpers ----------
function money(n) { var v = Math.round(Math.abs(n) / 100) * 100; return (n < 0 ? "−" : "") + "S$" + v.toLocaleString("en-SG"); }
function val(answers, id) { var q = Q[id], i = answers[id]; return (q && i != null && q.options[i]) ? q.options[i][1] : null; }

// ---------- stress test: returns threats with full monthly $ and expected $ ----------
function threats(pack, answers, scenario) {
  var R = val(answers, "REV"), m = val(answers, "MARGIN"), pass = val(answers, "PASS");
  var out = [];
  if (pack === "F&B") {
    var s1 = LIB.shocks.S01, shock = scenario === "severe" ? s1.severe : s1.moderate;
    var f = val(answers, "FOOD"), e = val(answers, "EXPOSED");
    var rise = R * f * e * shock, absorbed = rise * (1 - pass);
    out.push({ id: "S01", label: "Food costs you can't pass on", full: absorbed, conf: LIB.shockConfidence[s1.confidence], timing: LIB.timing[s1.urgency],
      detail: "Exposed ingredients up " + Math.round(shock * 100) + "% adds about " + money(rise) + " a month; you could pass on about " + money(rise - absorbed) + "." });
    var s2 = LIB.shocks.S02, why = answers.WHY != null ? Q.WHY.options[answers.WHY][1] : 1;
    var sub = [1.0, 0.6, 0.3, 0.1][why];
    var share = val(answers, "LOC") * sub, lost = R * share;
    out.push({ id: "S02", label: "Customers lost to Johor Bahru", full: lost * (1 - f), conf: LIB.shockConfidence[s2.confidence], timing: LIB.timing[s2.urgency],
      detail: "About " + (share * 100).toFixed(1).replace(/\.0$/, "") + "% of sales (" + money(lost) + " a month) could cross the border once the RTS opens. Rent and staff stay the same." });
  } else if (pack === "Services") {
    var ai = val(answers, "AI"), pr = val(answers, "PRESS");
    out.push({ id: "T-AI", label: "Fees lost to AI price pressure", full: R * ai * pr, conf: LIB.params.selfReportConfidence, timing: LIB.timing[3],
      detail: "About " + Math.round(ai * 100) + "% of your work is AI-exposed, and you expect its fees to fall about " + Math.round(pr * 100) + "% over two years." });
  } else if (pack === "E-commerce") {
    var ad = val(answers, "ADSHARE"), adup = val(answers, "ADUP"), feeRise = R * ad * adup;
    out.push({ id: "T-FEES", label: "Ad and platform fee rises you can't pass on", full: feeRise * (1 - pass), conf: LIB.params.selfReportConfidence, timing: LIB.timing[4],
      detail: "Fees and ads take about " + Math.round(ad * 100) + "% of sales; a " + Math.round(adup * 100) + "% rise adds about " + money(feeRise) + " a month." });
    var ov = val(answers, "OVERSEAS"), cut = val(answers, "CUT");
    out.push({ id: "T-OVERSEAS", label: "Price cuts to match overseas sellers", full: R * ov * cut, conf: LIB.params.selfReportConfidence, timing: LIB.timing[4],
      detail: "About " + Math.round(ov * 100) + "% of your range faces cheaper overseas sellers, and you'd cut those prices about " + Math.round(cut * 100) + "%." });
  } else {
    if (pack === "Wellness") {
      var s2w = LIB.shocks.S02, whyw = answers.WHY != null ? Q.WHY.options[answers.WHY][1] : 1;
      var sharew = val(answers, "LOC_W") * [1.0, 0.6, 0.3, 0.1][whyw], lostw = R * sharew;
      out.push({ id: "S02", label: "Clients lost to Johor Bahru", full: lostw * LIB.params.wellnessContribution, conf: LIB.shockConfidence[s2w.confidence], timing: LIB.timing[s2w.urgency],
        detail: "About " + (sharew * 100).toFixed(1).replace(/\.0$/, "") + "% of sales (" + money(lostw) + " a month) could cross the border once the RTS opens. Rent and staff stay the same." });
    }
    var up = val(answers, "COSTUP"), costs = R * (1 - m);
    var rise2 = costs * up, absorbed2 = rise2 * (1 - pass);
    out.push({ id: "T-COST", label: "Cost rises you can't pass on", full: absorbed2, conf: LIB.params.selfReportConfidence, timing: LIB.timing[4],
      detail: "Costs up about " + Math.round(up * 100) + "% adds about " + money(rise2) + " a month; you could pass on about " + money(rise2 - absorbed2) + "." });
  }
  out.forEach(function (t) { t.expected = t.full * t.conf * t.timing; });
  return out;
}

function score(category, answers, scenario) {
  var pack = packFor(category), P = LIB.packs[pack];
  var R = val(answers, "REV"), m = val(answers, "MARGIN");
  var profitNow = R * m;
  var th = threats(pack, answers, scenario || "moderate");
  var fullLoss = th.reduce(function (s, t) { return s + t.full; }, 0);
  var expLoss = th.reduce(function (s, t) { return s + t.expected; }, 0);
  var marginAfter = R ? (profitNow - expLoss) / R : 0;
  var buffer = 50 * Math.min(1, Math.max(0, (marginAfter - P.floor) / (P.target - P.floor)));

  // dimension health: average of readiness answers per dimension, 0-100
  var sums = {}, ns = {}, weak = [];
  FLOWS[pack].forEach(function (id, order) {
    var q = Q[id]; if (q.kind !== "ready" || answers[id] == null) return;
    var o = q.options[answers[id]];
    sums[q.dim] = (sums[q.dim] || 0) + o[1]; ns[q.dim] = (ns[q.dim] || 0) + 1;
    if (o[1] <= 1 && o[2]) weak.push({ id: id, dim: q.dim, score: o[1], play: o[2], order: order });
  });
  var health = {}, wsum = 0, wtot = 0;
  LIB.dims.forEach(function (d, i) {
    var h = ns[d.id] ? sums[d.id] / (ns[d.id] * 3) * 100 : null;
    health[d.id] = h;
    if (h != null) { wsum += P.weights[i] * h; wtot += P.weights[i]; }
  });
  var readiness = wtot ? 50 * wsum / (100 * wtot) : 0;
  var pri = readiness + buffer;
  var rng = LIB.params.rangeFactor * (1 - LIB.params.freeConfidence);
  var lo = Math.max(0, pri - rng), hi = Math.min(100, pri + rng);
  var band = pri < LIB.params.bandActNow ? "actnow" : pri < LIB.params.bandPrepared ? "exposed" : "prepared";
  var bandOf = function (x) { return x < LIB.params.bandActNow ? "actnow" : x < LIB.params.bandPrepared ? "exposed" : "prepared"; };
  var could = [bandOf(lo), bandOf(hi)].filter(function (b) { return b !== band; })[0] || null;

  // plays: urgent ones first, weighted by the dimension's sector weight
  var cand = [];
  if (marginAfter < 0.03) cand.push({ play: "P09", why: "margin", w: 99 });
  weak.forEach(function (x) { cand.push({ play: x.play, why: x.id, w: P.weights[LIB.dims.findIndex(function (d) { return d.id === x.dim; })] * (3 - x.score) - x.order * 0.01 }); });
  var locv = pack === "F&B" ? val(answers, "LOC") : pack === "Wellness" ? val(answers, "LOC_W") : 0;
  var rtsT = th.filter(function (t) { return t.id === "S02"; })[0];
  if (rtsT && rtsT.full > 0 && locv >= 0.04) cand.push({ play: "P10", why: "rts", w: locv * 875 });
  cand.sort(function (a, b) { return b.w - a.w; });
  var plays = [];
  cand.forEach(function (c) { if (plays.length < 3 && !plays.some(function (p) { return p.id === c.play; })) plays.push({ id: c.play, why: c.why, urgent: true }); });
  ["P02", "P03", "P05"].forEach(function (id) { if (plays.length < 3 && !plays.some(function (p) { return p.id === id; })) plays.push({ id: id, why: null, urgent: false }); });

  return { version: LIBRARY_VERSION, pack: pack, category: category, revenue: R, profitNow: profitNow, marginNow: m,
    threats: th, fullLoss: fullLoss, expectedLoss: expLoss, profitIfHit: profitNow - fullLoss,
    marginAfter: marginAfter, buffer: buffer, readiness: readiness, health: health,
    pri: pri, range: rng, low: lo, high: hi, band: band, could: could, plays: plays };
}

if (typeof module !== "undefined" && module.exports) module.exports = { LIB: LIB, Q: Q, FLOWS: FLOWS, INDUSTRIES: INDUSTRIES, FEEDBACK: FEEDBACK, packFor: packFor, threats: threats, score: score, money: money };
