import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		let output = '';
		async function insert(surah:number,aye:number) {
			// Get installation directory
			const installDir = await joplin.plugins.installationDir();

			// File System 
			const fs = joplin.require('fs-extra');

			// Read surah
			const fileContent = await fs.readFile(installDir + '/../quran/quran-simple.txt', 'utf8');

			// Find aye			
			const craye = `${surah}|${aye}|`
			const nxaye = `${surah}|${aye+1}|`
			const length = String(aye).length + String(surah).length + 2;
			output += fileContent.substring( fileContent.indexOf(craye) + length, fileContent.indexOf(nxaye));
		}
		async function readinfo() {
			// Get the selected Text.
			const note = (await joplin.commands.execute('selectedText') as string);
			if (note) {
				// Surah list
				const surahs = ['قرآن','فاتحه','بقره']

				// Get Surah's name
				const surah = note.split(":")[0];
				
				// Get index of surah
				const surahIndex = surahs.indexOf(surah);

				if (note.indexOf('-') !== -1) {
					const fromaye = parseInt(note.substring(note.indexOf(':')+1 , note.indexOf('-')));
					const toaye = parseInt(note.split("-")[1]);
					let i=fromaye;
					for (i; i<=toaye; i++) {
						await insert(surahIndex,i);
					}
				} else {
					const ayeIndex = parseInt(note.split(":")[1]);
					await insert(surahIndex,ayeIndex);
				}

				// replace selected text
				await joplin.commands.execute('replaceSelection', output);
				output = '';
			} else {
				// No text selected
				console.info('No note is selected');
			}
		}

		// Custom commend for our icon
			await joplin.commands.register({
				name: 'testCommand1',
				label: 'My Test Command 1',
				iconName: 'fas fa-music',
				execute: async () => {
					readinfo();
				},
			});

			// Add icon to toolbar
			await joplin.views.toolbarButtons.create('myButton', 'testCommand1', ToolbarButtonLocation.EditorToolbar);
	},
	
});

