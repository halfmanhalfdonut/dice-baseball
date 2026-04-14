import './styles.css';
import './components/AppShell';
import './pages/SplashPage';
import './pages/SettingsPage';
import './pages/GamePage';
import './pages/StatsPage';
import './pages/TeamsPage';
import './pages/StandingsPage';
import './pages/GameLogPage';
import './pages/SeasonPage';
import './components/GameRunner';
import './components/BoxScore';
import './components/PlayByPlay';
import './components/LineupManager';
import './components/Toast';

const app = document.createElement('app-shell');

const splash = document.createElement('splash-page');
const settings = document.createElement('settings-page');
const game = document.createElement('game-page');
const stats = document.createElement('stats-page');
const teams = document.createElement('teams-page');
const standings = document.createElement('standings-page');
const gamelog = document.createElement('game-log-page');
const season = document.createElement('season-page');

// assign slot names so AppShell can project these into the correct area
splash.setAttribute('slot', 'splash');
settings.setAttribute('slot', 'settings');
game.setAttribute('slot', 'game');
stats.setAttribute('slot', 'stats');
teams.setAttribute('slot', 'teams');
standings.setAttribute('slot', 'standings');
gamelog.setAttribute('slot', 'log');
season.setAttribute('slot', 'season');

app.appendChild(splash);
app.appendChild(settings);
app.appendChild(game);
app.appendChild(stats);
app.appendChild(teams);
app.appendChild(standings);
app.appendChild(gamelog);
app.appendChild(season);

const lineupManager = document.createElement('lineup-manager');
app.appendChild(lineupManager);

const toast = document.createElement('app-toast');
document.body.appendChild(toast);

// forward show-toast events to the toast element
window.addEventListener('show-toast', (e:any)=>{
	const msg = e.detail?.message || '';
	(toast as any).show(msg);
});

document.body.appendChild(app);

// register generated service worker (vite-plugin-pwa will generate /sw.js in production build)
if('serviceWorker' in navigator){
	try{
		navigator.serviceWorker.register('/sw.js').then((reg)=>{
			console.log('sw registered', reg);
		}).catch((err)=>{ console.warn('sw registration failed', err); });
	}catch(e){ console.warn('sw registration error', e); }
}
