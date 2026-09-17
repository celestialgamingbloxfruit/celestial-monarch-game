// Secure V121 Ultimate Engine - Part 1
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let game = {
    authDone: false,
    user: null,
    isAdmin: false,
    hp: 15900,
    maxHp: 15900,
    level: 1,
    maxLevel: 100,
    bounty: 0,
    rumbleSkin: 'blue',
    charges: 0,
    maxCharges: 5,
    chargeProgress: 0,
    voltNode: 743,
    statPoints: 0,
    stats: { melee: 1, def: 1, sword: 1, rumble: 1 },
    inventory: [],
    invLimit: 1,
    storyIdx: 0,
    eventActive: false,
    flashTicks: 0,
    cameraZ: 250,
    ticks: 0,
    equippedTitle: "",
    equippedAura: "",
    isV4Awakened: false,
    v4TrialActive: false,
    v4TrialProgress: 0,
    bossMutated: false,
    eventRole: null,
    eventPhase: 1,
    comboStreak: 0,
    activeWeapon: "Sword"
};

let castleBlocks = [];
for (let i = 0; i < 110; i++) {
    castleBlocks.push({
        x: Math.random() * 2000 - 800,
        y: Math.random() * 800 - 300,
        z: Math.random() * 600 + 40,
        w: Math.random() * 40 + 15,
        h: Math.random() * 80 + 30,
        color: `rgba(${Math.floor(Math.random()*45+20)}, 25, 80, 0.45)`
    });
}

let leaderboard = [
    { name: "rip_indra", bounty: 30000000 },
    { name: "Zioles", bounty: 25000000 },
    { name: "Uzoth", bounty: 18500000 },
    { name: "BountyHunterX", bounty: 5000000 },
    { name: "Player_Buddha", bounty: 2400000 }
];
// End of Part 1 (Exactly line 54)
// Title Database & Aura Particle Engine - Part 2
const titlesDatabase = [
    { id: 1, name: "CURSED KING", color: "#bc13fe", aura: "purple", desc: "Unlock Nafisa from chains" },
    { id: 2, name: "THE VOID SLASHER", color: "#00d2ff", aura: "void", desc: "Defeat Void Boss with Sword M1 and Domain Only" },
    { id: 3, name: "SLAYER OF GOD", color: "#ef4444", aura: "red", desc: "Survive AIO True Form apocalypse battle" },
    { id: 4, name: "RICHEST IN THE WORLD", color: "#ffcc00", aura: "gold", desc: "Achieve Top Leaderboard Ranking Spot" },
    { id: 5, name: "JUNGLE SURVIVOR", color: "#22c55e", aura: "green", desc: "Complete Chapter 1 story milestone" },
    { id: 6, name: "PRISON BREAKER", color: "#a8a29e", aura: "gray", desc: "Escape Dark Prison cells with Nafisa" },
    { id: 7, name: "LIGHTNING MASTER", color: "#38bdf8", aura: "cyan", desc: "Achieve 3715 Volts of full electrical capacity" },
    { id: 8, name: "SANGUINE BERSERKER", color: "#b91c1c", aura: "crimson", desc: "Trigger Sanguine V4 health regeneration" },
    { id: 9, name: "ROMANTIC DESTINY", color: "#ec4899", aura: "pink", desc: "Witness Nafisa sweet romantic covenant dialogue" },
    { id: 10, name: "CELESTIAL BEAST", color: "#6366f1", aura: "indigo", desc: "Defeat Chela Boss and get your full revenge" }
];

for (let i = 11; i <= 50; i++) {
    titlesDatabase.push({
        id: i, name: `CELESTIAL WARRIOR TIER ${i}`, color: "#fff", aura: "white", desc: `Perform high difficulty challenge quest tier ${i}`
    });
}
let unlockedTitles = [];

function checkTitleUnlocks(condition) {
    titlesDatabase.forEach(t => {
        if (!unlockedTitles.includes(t.name) && t.desc.toLowerCase().includes(condition.toLowerCase())) {
            unlockedTitles.push(t.name);
            logSystem(`🏆 TITLE UNLOCKED: [${t.name}]. Open Profile UI to equip!`);
        }
    });
}

let auraParticles = [];
function updateAuraParticles() {
    if (!game.authDone || game.equippedAura === "") return;
    if (Math.random() < 0.45) {
        auraParticles.push({
            x: 480 + (Math.random() - 0.5) * 45, y: 320 + (Math.random() - 0.5) * 55,
            vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 4 - 1.5, alpha: 1, size: Math.random() * 5 + 2
        });
    }
    auraParticles.forEach(p => { p.x += p.vx; p.y += p.vy; p.alpha -= 0.025; });
    auraParticles = auraParticles.filter(p => p.alpha > 0);
}

const storyTexts = [
    "Chapter 1: গল্পের শুরু হয় এক ঘন জঙ্গলে। আপনি আপনার বিশ্বস্ত স্কোয়াডের সৈনিকদের সাথে একটি ট্র্যাভেল বাসে মিশনে বের হয়েছেন। হঠাৎ মাঝপথে এক লোক হাত নেড়ে গাড়ি থামায় এবং কান্নাকাটি করে জানায় গভীর জঙ্গলে তার গাড়িটা নষ্ট হয়ে পড়ে আছে। তাকে সাহায্য করার জন্য আপনারা বাস থেকে নেমে জঙ্গল পার হয়ে একটা খোলা মাঠে দাঁড়ানো গাড়িটার দিকে এগিয়ে যান। কিন্তু গাড়িটার কাছে পৌঁছানো মাত্রই বুঝতে পারেন এটা একটা ভয়ংকর ট্র্যাপ! কোনো কিছু বুঝে ওঠার আগেই হঠাৎ মাটি ফেটে সুড়ঙ্গ থেকে স্পন করে মেইন বসের অধীনস্থ এক হিংস্র 'চেলা' (ছোট বস)। সে মুহূর্তের মধ্যে অতর্কিত আক্রমণ চালিয়ে আপনাকে মাটিতে আছাড় মারে। চেলার মারাত্মক আঘাতে আপনার চোখের প্রায় ৭০% দৃষ্টিশক্তি নষ্ট হয়ে যায় এবং চারপাশ ঝাপসা হয়ে আসে। সেই ঝাপসা চোখে আপনি দেখতে পান এক হাড়হিম করা দৃশ্য—সেই চেলা আপনার স্কোয়াডের প্রধান ফরেস্ট সোলজারকে জীবন্ত গিলে ফেলে! আপনার চোখের সামনেই বাকি সোলজারদের হত্যা করা হয়। তবে ভাগ্যক্রমে আপনার বেস্ট ফ্রেন্ড বেঁচে যায়। শত্রুরা আপনাদের দুজনকে বন্দি করে এক অন্ধকার কারাগারে নিয়ে যায়।",
    "Chapter 2: অন্ধকার কারাকক্ষে আপনি এবং আপনার বেস্ট ফ্রেন্ড লোহার শিকলে আবদ্ধ থাকেন। তবে সেই একই জেলখানায় বন্দি ছিল এক অপূর্ব সুন্দরী জাদুকরী বা 'উইচ' (Nafisa)। আপনাকে দেখা মাত্রই উইচ আপনার ওপর ক্রাশ খেয়ে বসে। কিন্তু সমস্যা হলো, সেই জেলখানায় এক কালাযাদুকরের মন্ত্র দিয়ে ম্যাজিক লক করা ছিল, যার ফলে কোনো পাওয়ার কাজ করছিল না। আপনি আপনার গায়ের শক্তি দিয়ে লড়াই করে উইচের হাতের চেইন বা শিকল ভেঙে দেন। শৃঙ্খলমুক্ত হয়েই আপনারা দুজনে মিলে জাদুটোনার গণ্ডি ও জেলখানার সীমানা পার হয়ে বাইরের স্বাধীন বাতাসে পা রাখেন।",
    "Chapter 3: জেলখানা থেকে সফলভাবে পালিয়ে আসার পর উইচ আপনাকে সমুদ্রের তীরে একটি জাদুকরী নৌকার কাছে নিয়ে যায়। শত্রু দ্বীপে যাওয়ার সময় আপনাকে সাহায্য করার জন্য উইচ আপনাকে একটি বিষ্ময়কর 'রুম্বল ফ্রুট' (Rumble Fruit) দেয়। ফ্রুটটি খাওয়ার সাথে সাথেই আপনার শরীরে বিদ্যুৎ ও বিজলির অলৌকিক শক্তি চলে আসে! এরপর উইচ আপনাকে ডোমেইন ব্যবহারের কৌশল শেখায় এবং জানায় তারা দুজনে একে অপরের সেরা বন্ধু (Best Friends) হিসেবে লড়াই করবে।"
];
// Extended Story Scripts - Part 3
const extendedStoryTexts = [
    "Chapter 4: শত্রু দ্বীপে পা রাখতেই মাটির নিচে থেকে শত শত জম্বি ও ঘাতক স্পন করে। আপনি মাটির নিচে থাকা পাথর থেকে কুড়িয়ে পাওয়া তলোয়ার দিয়ে লড়াই শুরু করেন। লড়াইয়ের মাঝে হঠাৎ পেছন থেকে এক ঘাতক আপনাকে মারাত্মকভাবে আঘাত করে মাটিতে ফেলে দেয়। ঠিক সেই সংকট মুহূর্তে উইচ আপনার পাশে এসে নিজের জাদুকরী পাওয়ার দিয়ে আপনাকে V4 Power অর্পণ করে, যাতে আপনি দ্রুত শত্রু সাফ করতে পারেন! তারপর আরও বাকিশব জমবি দের মারেন। এর পর ২য় দ্বীপে যান। নতুন শক্তি পাওয়ার পরও রক্তক্ষয়ী লড়াইয়ে একপর্যায়ে আঘাত পেয়ে আপনি মাটিতে পড়ে যান। তখন আপনার চোখের সামনে একটা চিঠি ভেসে ওঠে। রক্তমাখা হাতে আপনি স্ক্রিনে 'F' বাটন প্রেস করতেই ডেকে আনেন এক প্রেতাত্মা! আপনার ওপর ভর করে 'স্যানগুইন আর্ট' (Sanguine Art)। স্যানগুইন আর্টের মব-পুল, হিলিং রিজেনারেশন, রুম্বল ফ্রুট এবং ১-ই সোর্ড কম্বো মিলিয়ে আপনি মুহূর্তের মধ্যে পুরো দ্বীপের শত্রুবাহিনীকে ছারখার করে দেন!",
    "Chapter 5: ২য় দ্বীপের জম্বিদের নিশ্চিহ্ন করে আপনি ও উইচ ৩য় দ্বীপে পৌঁছান। সেখানকার দুটি মিনি-বসকে পরাজিত করে আপনি তাদের কাছ থেকে পিলারের মতো দুটি বিশেষ ড্রপস আইটেম সংগ্রহ করেন। সামনে এগোতেই দেখতে পান একটা পাথরের দেওয়াল, যেখানে একই আকৃতির দুটি ফাঁকা জায়গা রয়েছে। উইচ আপনাকে সতর্ক করে বলে—'সাবধানে ওই পিলারের মতো Cursed Item দুটি দেওয়ালে বসাও, তাহলেই মূল বস সামন হবে। যদি লড়াইয়ে আমরা মারা যাই, তবে লাশটাকে কিস দিবা/দিব... কারণ আমরা জন্মই হইছি একে অপরকে নিজের বানাইতে 🌹 (কিন্তু আমরা তো জিতবোই, হারবো কেমনে!)' উইচের এই মিষ্টি ডায়ালগ ও রোমান্টিক মুহূর্ত শেষে আপনি আইটেম দুটি দেওয়ালে বসাতেই খুলে যায় গোপন ঘরের দরজা!",
    "Chapter 6: গোপন ঘরের ভেতরে প্রবেশের পর মুখোমুখি হন মূল বসের। আপনার স্পাইকি ট্রাইডেন্ট (Spikey Trident) আর সিডিকে (CDK)-র মিক্সড সোর্ড, রুম্বল ফ্রুটের বিজলি আর স্যানগুইন আর্ট ব্যবহার করে রক্তক্ষয়ী মহাযুদ্ধে আপনি আর উইচ মিলে বসকে পরাস্ত করেন। কিন্তু বস মাটিতে লুটিয়ে পড়ার পর তার পেটের ভেতর থেকে অলৌকিকভাবে অক্ষত অবস্থায় বেরিয়ে আসে আপনার সেই হারিয়ে যাওয়া বেস্ট ফ্রেন্ড! আর সেই বস প্রকাশ করে—সে-ই আসলে সেই ফরেস্ট সোলজার, যাকে শুরুতে চেলা গিলে ফেলেছিল! চেলার পেটের ভেতর লুকিয়ে থেকে সে-ই এই সমস্ত নাটকের মূল কারিগর ছিল। পরাজিত ফরেস্ট সোলজার মৃত্যুর মুখে দাঁড়িয়ে শেষ অভিশাপ দিয়ে বলে— 'আর তোকেও যেন এইরকম Cursed Sword দিয়ে মারা হয়! এই Cursed Katana হলো এমন এক সোর্ড, যা দিয়ে একবার কাউকে আঘাত করলে কোনো হিলিং বা যাদু দিয়ে তার ক্ষত সারানো যায় না... যতক্ষণ না ওই সোর্ডের মালিক নিজে মারা যায়!' কথাটি শেষ হতেই সেই অতর্কিত চেলা পেছন থেকে এসে উইচের পেটে তার বড় হাত বা তলোয়ার ঢুকিয়ে দেয় এবং উপহাস করে বলে 'Ez noob!' উইচ যন্ত্রণায় ছটফট করে অচৈতন্য হয়ে মাটিতে পড়ে যায়। আপনি দ্রুত উইচকে কাঁধে তুলে নেন। কিন্তু উইচের ওপর অভিশাপ কাজ করায় তাকে হিল করা যাচ্ছিল না। তাকে বাঁচাতে হলে ক্যাটানার মালিককে মারতেই হতো! আপনি একহাতে আপনার আহতো উইচ ও বেস্ট ফ্রেন্ডকে আগলে রেখে নিজের শরীরের সমস্ত শক্তি দিয়ে লড়াই করে সেই চেলাকে হত্যা করে 'Ez' বলে প্রতিশোধ নেন! কিন্তু অমনি পেছন থেকে আরেকটা মিনি-বস এসে আপনার পেটে সেই Cursed Katana ঢুকিয়ে দেয়। মারাত্মক জখম হয়ে আপনি লুটিয়ে পড়েন। তবে আপনার বেস্ট ফ্রেন্ড শেষ শক্তি দিয়ে কষ্ট করে উঠে দাঁড়ায় এবং সেই শেষ শত্রুটিকেও মেরে ফেলে অভিশাপের চক্র পুরোপুরি ধ্বংস করে দেয়!",
    "Chapter 7: অভিশাপ কেটে যাওয়ার পর আপনার শরীরের ক্ষত কমতে শুরু করে। ঠিক সেই মুহূর্তে বিকট শব্দে আকাশে অবতরন করে বিশেষ কপ টিম (Cop Team)। কপ্টার নিয়ে তারা আপনাদের তিনজনকে রেস্কিউ করে এক গোপন হাসপাতালে নিয়ে যায়। হাসপাতালে দীর্ঘ চিকিৎসার পর আপনি, উইচ এবং আপনার বেস্ট ফ্রেন্ড—সবাই পুরোপুরি সুস্থ হয়ে ওঠেন। এতদিন পর সব রক্তপাত, অন্ধকার আর যুদ্ধের অবসান ঘটে। রাতে সবাই মিলে hospital প্রাঙ্গণে এক বিশাল জয় আর আনন্দের 'ভিক্টরি পার্টি' আয়োজন করে। পার্টি শেষে উইচ এসে আপনার পাশে বসে। গল্পের একদম শেষ দৃশ্যে দেখা যায়—সব কষ্ট পার করে পরদিন সকালে এক সুন্দর ঝলমলে রোদে আপনি ও উইচ বিবাহের (Marriage) বন্ধনে আবদ্ধ হচ্ছেন, আর আপনাদের ভালোবাসার এক সুন্দর নতুন অধ্যায় শুরু হচ্ছে! Happy Ending!"
];

// Combine arrays to ensure logic handles it smoothly
extendedStoryTexts.forEach(txt => storyTexts.push(txt));
// Account Registration & Encryption Validation - Part 4
function toggleAuthPanel(showSignup) {
    document.getElementById('signup-form').style.display = showSignup ? 'block' : 'none';
    document.getElementById('login-form').style.display = showSignup ? 'none' : 'block';
}

function handleAuthAction(mode) {
    let uIn = document.getElementById('su-username');
    let lIn = document.getElementById('lg-username');
    let username = mode === 'signup' ? uIn.value.trim() : lIn.value.trim();
    let email = mode === 'signup' ? document.getElementById('su-email').value.trim() : "";
    
    if(!username) { alert("Please input a valid username."); return; }
    
    if(mode === 'signup') {
        if(localStorage.getItem('cc_user_' + username)) {
            alert("Username already taken!"); return;
        }
        let profile = { 
            username, email, bounty: 35000, level: 1, stats: {melee:1, def:1, sword:1, rumble:1} 
        };
        localStorage.setItem('cc_user_' + username, JSON.stringify(profile));
        game.user = profile;
    } else {
        let saved = localStorage.getItem('cc_user_' + username);
        if(!saved) { alert("Account data not found."); return; }
        game.user = JSON.parse(saved);
    }

    game.authDone = true;
    game.bounty = game.user.bounty;
    game.level = game.user.level;
    game.stats = game.user.stats;
    document.getElementById('auth-panel').style.display = 'none';

    let inputHash = btoa(email.toLowerCase());
    let adminHash = "Y2VsZXN0aWFsZ2FtaW5nYmxveGZydWl0QGdtYWlsLmNvbQ==";

    if(username.toLowerCase() === 'admin' || inputHash === adminHash) {
        game.isAdmin = true;
        game.maxLevel = Infinity;
        game.invLimit = Infinity;
        game.level = Infinity;
        document.getElementById('vip-btn').style.display = 'block';
        logSystem("A GOD 'CELESTIAL MONARCH' HAS JOINED THE SERVER");
        titlesDatabase.forEach(t => unlockedTitles.push(t.name));
    } else {
        logSystem(`Welcome ${game.user.username} to the server battle zone.`);
    }

    updateLeaderboard(game.user.username, game.bounty);
    startCutscenes();
}

function handleSignup() { handleAuthAction('signup'); }
function handleLogin() { handleAuthAction('login'); }
// Leaderboard Update, Cutscenes and Stats Engine - Part 5
function renderLeaderboard() {
    let sorted = [...leaderboard].sort((a,b) => b.bounty - a.bounty);
    let out = '';
    sorted.forEach((p, i) => {
        let isCurrent = game.user && p.name === game.user.username;
        out += `<div class="lb-row ${isCurrent ? 'current-player' : ''}"><span>#${i+1} ${p.name}</span><span>${p.bounty.toLocaleString()}</span></div>`;
    });
    document.getElementById('lb-content').innerHTML = out;
}

function updateLeaderboard(uname, val) {
    let exist = leaderboard.find(x => x.name === uname);
    if(exist) exist.bounty = val;
    else leaderboard.push({ name: uname, bounty: val });
    renderLeaderboard();
}

function startCutscenes() {
    document.getElementById('story-box').style.display = 'block';
    game.storyIdx = 0;
    setChapterProgress();
}

function setChapterProgress() {
    if(game.storyIdx < storyTexts.length) {
        document.getElementById('story-text').innerText = storyTexts[game.storyIdx];
        game.statPoints += 10;
        updateStatUI();
        if(game.storyIdx === 1) checkTitleUnlocks("Unlock Nafisa");
        if(game.storyIdx === 6) checkTitleUnlocks("Marriage");
    } else {
        document.getElementById('story-box').style.display = 'none';
        logSystem("Campaign progression cleared! Sandbox unlocked.");
    }
}

document.getElementById('story-next-btn').onclick = () => {
    game.storyIdx++;
    setChapterProgress();
};

function triggerSkipCommand() {
    game.storyIdx = storyTexts.length;
    setChapterProgress();
    logSystem("Story sequences bypassed completely via terminal hook.");
}

function toggleStatMenu() {
    let p = document.getElementById('stat-panel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
    updateStatUI();
}
// RPG Stat UI and Storage Interaction Core - Part 6
function updateStatUI() {
    document.getElementById('stat-pts').innerText = game.statPoints;
    document.getElementById('stat-melee').innerText = game.stats.melee;
    document.getElementById('stat-def').innerText = game.stats.def;
    document.getElementById('stat-sword').innerText = game.stats.sword;
    document.getElementById('stat-rumble').innerText = game.stats.rumble;
    document.getElementById('level-display').innerText = `Level: ${game.level === Infinity ? '∞' : game.level}`;
}

function upgradeStat(type) {
    if(game.statPoints > 0) {
        game.statPoints--;
        game.stats[type]++;
        if(type === 'def') {
            game.maxHp = 15900 + (game.stats.def * 250);
            game.hp = game.maxHp;
        }
        updateStatUI();
    }
}

function toggleInventory() {
    let p = document.getElementById('inv-panel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
    renderInventoryUI();
}

function renderInventoryUI() {
    let count = game.inventory.length;
    let maxText = game.level === Infinity ? '∞' : count;
    document.getElementById('inv-count').innerText = maxText;
    let out = '';
    game.inventory.forEach((f, idx) => {
        out += `<div style="padding:4px; font-size:12px; border-bottom:1px solid #332850;">` +
               `🍎 ${f} <button onclick="interactItem(${idx}, 'eat')">Eat</button> ` +
               `<button onclick="interactItem(${idx}, 'drop')">Drop</button>` +
               `</div>`;
    });
    out += `<div style="margin-top:10px; border-top:1px solid #ffcc00; padding:5px;">` +
           `<b>Equip Title:</b><select onchange="equipTitleAction(this.value)"><option value=''>None</option>`;
    unlockedTitles.forEach(t => {
        out += `<option value="${t}" ${game.equippedTitle === t ? 'selected':''}>${t}</option>`;
    });
    out += `</select></div>`;
    document.getElementById('inv-list').innerHTML = out || 'Inventory Storage Empty';
}

function equipTitleAction(tname) {
    let found = titlesDatabase.find(x => x.name === tname);
    if(found) {
        game.equippedTitle = found.name;
        game.equippedAura = found.aura;
        logSystem(`Title equipped: [${found.name}] displays above head display.`);
    } else { game.equippedTitle = ""; game.equippedAura = ""; }
}

function interactItem(idx, mode) {
    let item = game.inventory[idx];
    if(mode === 'eat') { logSystem(`Consumed [${item}]. Power updated.`); }
    else { logSystem(`Dropped [${item}] down into floor map.`); }
    game.inventory.splice(idx, 1);
    renderInventoryUI();
}
// Chat Engine, Apocalypse Loops and 3D Graphic Pipeline - Part 7
function sendChatMessage() {
    let input = document.getElementById('chat-input');
    let txt = input.value.trim();
    if(!txt) return;
    input.value = '';
    let name = game.user ? game.user.username : "Guest";
    appendChatLog(name, txt, game.isAdmin ? 'chat-admin' : '');
    if(game.isAdmin) { processSlashRules(txt); }
    else if(txt.startsWith('/')) { logSystem("Access Restricted to Monarch."); }
}

function appendChatLog(user, msg, cls) {
    let log = document.getElementById('chat-log');
    let d = document.createElement('div');
    d.className = cls; d.innerHTML = `<b>[${user}]:</b> ${msg}`;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
}

function logSystem(msg) {
    let log = document.getElementById('chat-log');
    let d = document.createElement('div');
    d.className = 'chat-system'; d.innerHTML = `<i>* SYSTEM: ${msg}</i>`;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
}

function processSlashRules(str) {
    let cmd = str.toLowerCase().trim();
    if(cmd === '/heal') {
        game.hp = game.maxHp; logSystem("Admin Action: Recovered maximum 15,900+ HP.");
    } else if(cmd === '/skip') {
        triggerSkipCommand();
    } else if(cmd === '/skin_purple_rumble') {
        game.rumbleSkin = 'purple'; logSystem("Purple Lighting Overhauled.");
    } else if(cmd.startsWith('/gift')) {
        logSystem("Admin Gift Box deployed.");
    } else if(cmd === '/rt2') {
        logSystem("Teleported to V4 Pedestal.");
        game.v4TrialActive = true; game.v4TrialProgress = 0;
    } else if(cmd === '/kill all') {
        game.flashTicks = 25; logSystem("Mass Obliteration Completed.");
    } else if(cmd === '/reward') {
        game.bounty += 1000000; updateLeaderboard(game.user.username, game.bounty);
        logSystem("Bounty Cache Updated: +1M.");
    } else if(cmd === '/event') {
        triggerServerApocalypse();
    }
}

function toggleAdminPanel() {
    if(!game.isAdmin) return;
    let p = document.getElementById('admin-panel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
}

function quickAdminCmd(c) {
    document.getElementById('chat-input').value = c;
    sendChatMessage(); toggleAdminPanel();
}

function triggerServerApocalypse() {
    document.getElementById('role-prompt').style.display = 'block';
    game.eventActive = true;
    logSystem("🔥 AUTO EVENT: 41-Minute Apocalypse Engine is running.");
}

function selectEventRole(role) {
    document.getElementById('role-prompt').style.display = 'none';
    let label = role === 'aio' ? 'AIO Boss' : 'Resistance';
    logSystem(`Role Confirmed: Joined as [${label}].`);
}

function tick() {
    if(!game.authDone) return;
    game.ticks++;
    game.chargeProgress += (1 / 60);
    if(game.chargeProgress >= 4.0) {
        game.chargeProgress = 0;
        if(game.charges < game.maxCharges) game.charges++;
    }
    if(game.flashTicks > 0) game.flashTicks--;
    updateAuraParticles();
    document.getElementById('hp-bar').style.width = `${(game.hp / game.maxHp) * 100}%`;
    document.getElementById('hp-text').innerText = `HP: ${Math.floor(game.hp)}/${game.maxHp}`;
    document.getElementById('volt-display').innerText = `Voltage: ${game.charges * game.voltNode}V / 3715V`;
    let nodes = document.querySelectorAll('.charge-fill');
    for(let i=0; i<game.maxCharges; i++) {
        if(i < game.charges) {
            nodes[i].style.width = '100%';
            nodes[i].style.background = game.rumbleSkin === 'purple' ? '#bc13fe' : '#00d2ff';
        } else if(i === game.charges) {
            nodes[i].style.width = `${(game.chargeProgress / 4.0) * 100}%`;
            nodes[i].style.background = '#2c1945';
        } else { nodes[i].style.width = '0%'; }
    }
}

function draw() {
    ctx.fillStyle = '#040208'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if(!game.authDone) { requestAnimationFrame(draw); return; }
    ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2);
    let drift = Math.sin(game.ticks * 0.008) * 45;
    castleBlocks.forEach(b => {
        let fovScale = game.cameraZ / (game.cameraZ + b.z);
        let screenX = (b.x + drift) * fovScale; let screenY = b.y * fovScale;
        let finalW = b.w * fovScale * 2.8; let finalH = b.h * fovScale * 2.8;
        ctx.fillStyle = b.color; ctx.strokeStyle = 'rgba(74, 58, 148, 0.4)'; ctx.lineWidth = 1;
        ctx.fillRect(screenX - finalW/2, screenY - finalH/2, finalW, finalH);
        ctx.strokeRect(screenX - finalW/2, screenY - finalH/2, finalW, finalH);
    });
    ctx.restore();
    auraParticles.forEach(p => {
        let color = '#fff';
        if (game.equippedAura === 'purple') color = '#bc13fe';
        if (game.equippedAura === 'void') color = '#00d2ff';
        if (game.equippedAura === 'red') color = '#ef4444';
        if (game.equippedAura === 'gold') color = '#ffcc00';
        ctx.fillStyle = color; ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.save(); ctx.translate(480, 320 + Math.sin(game.ticks * 0.06) * 4);
    let ringColor = game.rumbleSkin === 'purple' ? 'rgba(188, 19, 254, 0.25)' : 'rgba(0, 210, 255, 0.25)';
    ctx.fillStyle = ringColor; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0c071b'; ctx.strokeStyle = '#4b3b8c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#00d2ff'; ctx.shadowColor = '#00d2ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(6, -4, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-6, -4, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.restore(); ctx.shadowBlur = 0;
    if (game.equippedTitle !== "") {
        let titleData = titlesDatabase.find(x => x.name === game.equippedTitle);
        ctx.fillStyle = titleData ? titleData.color : "#ffcc00"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
        ctx.fillText(`[${game.equippedTitle}]`, 480, 275 + Math.sin(game.ticks * 0.06) * 4);
    }
    if(game.flashTicks > 0) { ctx.fillStyle = 'rgba(255, 0, 68, 0.45)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    requestAnimationFrame(draw);
}

function init() {
    renderLeaderboard();
    logSystem("Castle Environment loaded. Authenticate profile configurations.");
    setInterval(tick, 1000 / 60); requestAnimationFrame(draw);
}
window.onload = init;
