 /**
 * @name HideServers
 * @displayName HideServers
 * @authorId 262068640013090819
 * @website https://github.com/DGTBHItzDG
 * @source https://dgtbhitzdg.github.io/plugins/HideServers.plugin.js
 */

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

module.exports = (() => {
	const config = {
		info: {
			name: "HideServers",
			authors: [
				{
					name: "lixm.jb",
					discord_id: "262068640013090819",
					github_username: "DGTBHItzDG"
				}
			],
			version: "1",
			description: "Gives you the ability to hide server/guild list.",
			github: "https://github.com/nill",
			github_raw: "https://raw.githubusercontent.com/nill"
		},
		changelog: [
			{
				title: "Test build 1",
				type: "added",
				items: [
					"Currently experimenting"
				]
			}
		]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		load() {
			BdApi.showConfirmationModal("Library plugin is needed",
				[`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
					if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { Settings, PluginUtilities, Patcher } = Api;
			const { SettingPanel, SettingGroup, SettingField, Textbox, Switch } = Settings;

			const buttonName = 'toggleServers',
				buttonHideName = 'serversVisible',
				buttonShowName = 'serversHidden',
				hideElementsName = 'hideServersElement',
				targetElement = '.typeWindows-1za-n7',
				serversName = '.wrapper-1Rf91z';

			return class HideChannels extends Plugin {

				onStart() {
					PluginUtilities.addStyle(config.info.name + 'CSS',
						`
						#toggleServers {position: absolute ;width: 20px ;height: 20px ;top: 0 ;left: 5px  ;bottom: unset ;margin: auto 0 ;margin-top: 2px ;background-position: center ;background-size: 100% ;opacity: 0.8 ;z-index: 3002 ;cursor: pointer ;-webkit-app-region: no-drag;}
						.wordmark-2iDDfm {position: absolute;left: 20px !important;}
						.theme-dark #toggleServers.serversVisible { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24px' height='24px'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z'/%3E%3C/svg%3E"); }
						.theme-dark #toggleServers.serversHidden { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' fill='white' width='24px' height='24px'%3E%3Cpath d='M0,0h24v24H0V0z' fill='none'/%3E%3Cpath d='M4,18h11c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,17.55,3.45,18,4,18z M4,13h8c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,12.55,3.45,13,4,13z M3,7L3,7c0,0.55,0.45,1,1,1h11c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4C3.45,6,3,6.45,3,7z M20.3,14.88L17.42,12l2.88-2.88c0.39-0.39,0.39-1.02,0-1.41l0,0 c-0.39-0.39-1.02-0.39-1.41,0l-3.59,3.59c-0.39,0.39-0.39,1.02,0,1.41l3.59,3.59c0.39,0.39,1.02,0.39,1.41,0l0,0 C20.68,15.91,20.69,15.27,20.3,14.88z'/%3E%3Cpath d='M0,0h24v24H0V0z' fill='none'/%3E%3C/svg%3E"); }
						.theme-light #toggleServers.serversVisible { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black' width='24px' height='24px'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z'/%3E%3C/svg%3E"); }
						.theme-light #toggleServers.serversHidden { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' fill='black' width='24px' height='24px'%3E%3Cpath d='M0,0h24v24H0V0z' fill='none'/%3E%3Cpath d='M4,18h11c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,17.55,3.45,18,4,18z M4,13h8c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,12.55,3.45,13,4,13z M3,7L3,7c0,0.55,0.45,1,1,1h11c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4C3.45,6,3,6.45,3,7z M20.3,14.88L17.42,12l2.88-2.88c0.39-0.39,0.39-1.02,0-1.41l0,0 c-0.39-0.39-1.02-0.39-1.41,0l-3.59,3.59c-0.39,0.39-0.39,1.02,0,1.41l3.59,3.59c0.39,0.39,1.02,0.39,1.41,0l0,0 C20.68,15.91,20.69,15.27,20.3,14.88z'/%3E%3Cpath d='M0,0h24v24H0V0z' fill='none'/%3E%3C/svg%3E"); }
						.hideServersElement { width: 0 !important;}
						.wrapper-1Rf91z.serversVisible .scrollerWrap-1IAIlv .scroller-2TZvBN .container-2td-dC.unread-2OHH1w::before,.wrapper-1Rf91z.serversVisible .scrollerWrap-1IAIlv .scroller-2TZvBN .container-2td-dC.selected-nT-gM3::before,.wrapper-1Rf91z.serversVisible  .unreadMentionsIndicatorBottom-BXS58x, .wrapper-1Rf91z.serversVisible .unreadMentionsIndicatorTop-gA6RCh {opacity: 1;transition: all .5s ease-in-out !important;}
						.base-3dtUhz {transition: left .5s ease-in-out;}
						.wrapper-1Rf91z, .wrapper-1Rf91z .scrollerWrap-1IAIlv .scroller-2TZvBN>div.container-1ETFDs:first-child .homeButton-2Cw51C {transition: all .5s ease-in-out;transition-delay: 0 !important;}
						.wrapper-1Rf91z.serversVisible,.wrapper-1Rf91z .scrollerWrap-1IAIlv .scroller-2TZvBN>div.container-1ETFDs:first-child .homeButton-2Cw51C {width: 70px !important;}
						.wrapper-1Rf91z.hideServersElement ~ .base-3dtUhz {left: 0 !important; transition: left .5s ease-in-out !important;}
						.wrapper-1Rf91z.serversVisible ~ .base-3dtUhz {left: auto !important;}`
					);

					this.renderButton();
					this.addExtras();
				}

				onStop() {
					PluginUtilities.removeStyle(config.info.name + 'CSS');
					Patcher.unpatchAll();

					this.removeExtras();
				}

				onSwitch() {
					const checkButton = document.getElementById(buttonName);

					if (!checkButton) this.renderButton();
				}

				renderButton() {
					const button = document.createElement('div'),
						titleBar = document.querySelector(targetElement),
						settings = this.loadSettings();

					var buttonClass;

					if (settings.HideChannels.channelsHidden == true)
						buttonClass = buttonShowName;
					else
						buttonClass = buttonHideName;

					button.setAttribute('id', buttonName);
					button.setAttribute('class', buttonClass);

					titleBar.append(button);

					let buttonAction = document.getElementById(buttonName);
					buttonAction.addEventListener('click', ()=> this.toggleServers());

				}

				toggleServers() {
					const button = document.getElementById(buttonName),
						sidebar = document.querySelector(serversName);

					if (button.classList.contains(buttonHideName)) {
						button.setAttribute('class', buttonShowName);
						sidebar.classList.add(hideElementsName);

						this.saveSettings(true);
					} else if (button.classList.contains(buttonShowName)) {
						button.setAttribute('class', buttonHideName);
						sidebar.classList.remove(hideElementsName);

						this.saveSettings(false);
					}
				}

				addExtras() {
					const sidebar = document.querySelector(serversName),
						settings = this.loadSettings();

					if (settings.HideChannels.channelsHidden == true) {
						setTimeout(function() {
							sidebar.classList.add(hideElementsName);
						}, 2500);
					}
				}

				removeExtras() {
					const button = document.getElementById(buttonName);
					if (button) button.remove();

					const sidebar = document.querySelector(serversName);
					if (sidebar.classList.contains(hideElementsName))
						sidebar.classList.remove(hideElementsName);
				}

				get defaultSettings() {
					return {
						HideChannels: {
							channelsHidden: false
						}
					}
				}

				loadSettings() {
					BdApi.loadData(this.getName(), 'settings');
					var settings = (BdApi.loadData(this.getName(), 'settings')) ? BdApi.loadData(this.getName(), 'settings') : this.defaultSettings;

					return settings;
				}

				saveSettings(status) {
					const settings = this.loadSettings();

					settings.HideChannels.channelsHidden = status;
					BdApi.saveData(this.getName(), 'settings', settings);
				}
			};
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();