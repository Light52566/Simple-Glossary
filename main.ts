import { Menu, App, Editor, MarkdownView, 
	Modal, Notice, Plugin, PluginSettingTab, 
	Setting, Vault, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

// A function to add a term and definition to the glossary file
// Glossary file is a markdown file with a format:
// # glossary
// term1:= definition1;
// term2:= definition2;
// ...
function addToGlossary(vault: Vault, glossaryFile: TFile, new_term: string, new_definition: string): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		try{
			let already_exists = false;
			vault.process(glossaryFile, (content) => {
				// Split the content into lines
				const lines = content.split(';\n');
				// Create a dictionary to store the terms and definitions
				const glossary: { [key: string]: string } = {}; // Add index signature
				// Iterate over each line
				for (let line of lines) {
					// Split the line into term and definition
					const [term, definition] = line.split(':=');
					// Add the term and definition to the dictionary
					if (term.valueOf() === new_term.valueOf()) {
						already_exists = true;
						console.log('Term already exists in glossary %b', already_exists);
						break;
					}
					glossary[term] = definition;
				}

				if (!already_exists) {
					// Add the new term and definition to the dictionary
					glossary[new_term] = new_definition;
					// Convert the dictionary back into a string
					let new_content = '';
					for (let term in glossary) {
						if (term === '') {
							continue;
						}
						new_content += term + ':=' + glossary[term] + ';\n';
					}
					return new_content;
				} else {
					return content;
				}
			});
			resolve(already_exists);
		} catch (error) {
			reject(error);
		}
	});
}
export default class GlossaryPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log('loading plugin')


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('book-a', 'Glossary', (evt: MouseEvent) => {

			// Opens the glossary file in a new tab on left click
			if (evt.button === 0) {
				// Called when the user clicks the icon.
				new Notice('Opening glossary...');
				this.app.workspace.openLinkText('glossary.md', '', true);
			}

			// Opens menu on right click
			if (evt.button === 2) {
				const menu = new Menu();
				// Opens the glossary file in a new tab
				menu.addItem(item => {
					item.setTitle('Open Glossary');
					item.setIcon('book-a');
					item.onClick(() => {
						this.app.workspace.openLinkText('glossary.md', '', true);
					});
				});

				// Adds the highlighted text to the glossary
				menu.addItem(item => {
					item.setTitle('Add to Glossary');
					item.setIcon('plus');
					item.onClick(async () => {
						const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
						if (activeView) {
							// Get selected text
							const selectedText = activeView.editor.getSelection().toLowerCase();
							let new_term: string = 'term';
							let new_definition: string = 'definition';

							// Call the modal to get the term and definition
							await new Promise(resolve => { // Wait for the modal to close
								new AddToGlossaryModal(this.app, selectedText, async (term, definition) => {
									new_term = term;
									new_definition = definition;
									console.log('new term: %s, new definition: %s', new_term, new_definition);

									new Notice('Adding ' + new_term + ' to glossary...');

									// Find glossary file
									const glossaryFile = this.app.vault.getFileByPath('glossary.md');
									if (glossaryFile) {
										// Read glossary file
										const { vault } = this.app;
										// Add the selected text to the glossary
										const result = await addToGlossary(vault, glossaryFile, new_term, new_definition);
										console.log('exists: %b', result);
										if (result) {
											new Notice('Term already exists in glossary');
										} else {
											new Notice('Added ' + new_term + ' to glossary');
										}
											
									} else {
										new Notice('Glossary file not found');
									}

								}).open();
							});
						}
					});
				});
				
				menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
			}

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Glossary active!');

		// This adds a simple command to add a term to the glossary
		this.addCommand({
			id: 'add-to-glossary',
			name: 'Add to Glossary',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					// Get selected text
					const selectedText = activeView.editor.getSelection().toLowerCase();
					let new_term: string = 'term';
					let new_definition: string = 'definition';

					// Call the modal to get the term and definition
					await new Promise(resolve => { // Wait for the modal to close
						new AddToGlossaryModal(this.app, selectedText, async (term, definition) => {
							new_term = term;
							new_definition = definition;
							console.log('new term: %s, new definition: %s', new_term, new_definition);

							new Notice('Adding ' + new_term + ' to glossary...');

							// Find glossary file
							const glossaryFile = this.app.vault.getFileByPath('glossary.md');
							if (glossaryFile) {
								// Read glossary file
								const { vault } = this.app;
								// Add the selected text to the glossary
								const result = await addToGlossary(vault, glossaryFile, new_term, new_definition);
								console.log('exists: %b', result);
								if (result) {
									new Notice('Term already exists in glossary');
								} else {
									new Notice('Added ' + new_term + ' to glossary');
								}
									
							} else {
								new Notice('Glossary file not found');
							}

						}).open();
					});
					
				}
			}
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('unloading plugin')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// A model for adding a term to the glossary
class AddToGlossaryModal extends Modal {
	new_term: string;
	new_definition: string;
	onSubmit: (term: string, definition: string) => void;

	constructor(app: App, new_term: string, onSubmit: (term: string, definition: string) => void) {
		super(app);
		this.new_term = new_term;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.createEl('h1', {text: 'Add to Glossary'});
		
		new Setting(contentEl).setName('Term').addText((text) =>
			text.setValue(this.new_term).onChange((value) => {
				this.new_term = value;
			})
		);

		new Setting(contentEl).setName('Definition').addText((text) =>
			text.onChange((value) => {
				this.new_definition = value;
			})
		);

		new Setting(contentEl).addButton((button) => 
			button.setButtonText('Add').setCta().onClick(() => {
				this.onSubmit(this.new_term, this.new_definition);
				this.close();
			})
		);
	}

	onClose(): void {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: GlossaryPlugin;

	constructor(app: App, plugin: GlossaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
