:root {
    --bg: #06040a;
    --panel: rgba(18, 13, 30, 0.95);
    --border: #3d3463;
    --text: #eae2f0;
    --gold: #ffcc00;
}
body { margin: 0; background: #000; color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; font-family: sans-serif; }
#game-container { position: relative; width: 960px; height: 600px; background: var(--bg); border: 3px solid var(--border); border-radius: 12px; overflow: hidden; }
canvas { width: 100%; height: 100%; display: block; }
.overlay { position: absolute; inset: 0; background: radial-gradient(circle, #150d2a 0%, #030206 100%); z-index: 100; display: flex; align-items: center; justify-content: center; }
.auth-box { background: var(--panel); border: 2px solid var(--border); border-radius: 14px; padding: 25px; width: 360px; text-align: center; }
.auth-box input { width: 100%; padding: 10px; margin: 8px 0; background: #000; border: 1px solid var(--border); color: #fff; border-radius: 6px; }
.auth-box button { width: 100%; padding: 12px; background: #6d28d9; border: none; color: #fff; font-weight: bold; border-radius: 6px; cursor: pointer; }
.toggle-link { color: #a78bfa; font-size: 13px; margin-top: 12px; display: inline-block; cursor: pointer; }
#hud { position: absolute; top: 15px; left: 15px; z-index: 50; width: 220px; }
.bar-container { background: #000; border: 1px solid var(--border); height: 18px; border-radius: 9px; overflow: hidden; position: relative; }
.bar-fill { height: 100%; width: 100%; transition: width 0.2s; }
.hp-fill { background: linear-gradient(90deg, #991b1b, #ef4444); }
.hud-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #fff; }
.charge-container { display: flex; gap: 4px; margin-top: 5px; }
.charge-node { flex: 1; height: 10px; background: #222; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.charge-fill { height: 100%; width: 0%; }
#volt-display { font-size: 11px; font-weight: bold; margin-top: 3px; text-shadow: 1px 1px 2px #000; }
#leaderboard { position: absolute; top: 15px; right: 15px; width: 210px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 10px; z-index: 50; }
#leaderboard h3 { margin: 0 0 6px 0; font-size: 13px; color: var(--gold); text-align: center; border-bottom: 1px solid var(--border); }
.lb-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
.current-player { color: #22c55e; font-weight: bold; }
#chat-area { position: absolute; bottom: 15px; left: 15px; z-index: 50; width: 360px; }
#chat-log { height: 110px; background: rgba(0,0,0,0.75); border: 1px solid var(--border); border-radius: 6px; padding: 6px; overflow-y: auto; font-size: 12px; }
.chat-system { color: var(--gold); }
.chat-admin { color: #ef4444; font-weight: bold; }
#chat-input-row { display: flex; gap: 4px; margin-top: 4px; }
#chat-input { flex: 1; padding: 8px; background: #000; border: 1px solid var(--border); color: #fff; border-radius: 4px; }
#vip-btn { background: #d97706; border: none; color: white; font-weight: bold; border-radius: 4px; cursor: pointer; display: none; }
#menu-btn, #inv-btn { position: absolute; bottom: 15px; z-index: 50; padding: 8px 14px; background: #1e1b4b; border: 1px solid var(--border); color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; }
#menu-btn { right: 100px; }
#inv-btn { right: 15px; }
#stat-panel, #inv-panel, #admin-panel { position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); width: 280px; background: rgba(15,10,25,0.98); border: 2px solid var(--border); border-radius: 10px; padding: 15px; z-index: 80; display: none; }
#admin-panel { border-color: var(--gold); }
.close-btn, #close-admin { position: absolute; top: 6px; right: 10px; cursor: pointer; color: #ef4444; font-weight: bold; }
.stat-row { display: flex; justify-content: space-between; margin: 8px 0; align-items: center; }
.stat-row button { padding: 2px 8px; background: #2563eb; color: white; border: none; border-radius: 3px; cursor: pointer; }
#story-box { position: absolute; bottom: 145px; left: 50%; transform: translateX(-50%); width: 55%; background: var(--panel); border: 1px solid var(--border); padding: 12px; border-radius: 8px; text-align: center; z-index: 60; display: none; }
#role-prompt { position: absolute; left: 50%; top: 30%; transform: translate(-50%, -50%); background: var(--panel); border: 2px solid var(--gold); padding: 20px; border-radius: 10px; text-align: center; z-index: 90; display: none; }
.role-btn { padding: 10px 20px; margin: 5px; border: none; color: white; font-weight: bold; border-radius: 4px; cursor: pointer; }
.btn-red { background: #dc2626; }
.btn-blue { background: #2563eb; }
