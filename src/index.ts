import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		async function insert() {
			// Get the selected Text.
			const note = (await joplin.commands.execute('selectedText') as string);
			if (note) {
				// Surah list
				const surahs = ['فاتحه','بقره'];

				// Get Surah's name
				const surah = note.split(":")[0];

				// Get aye
				const ayeIndex = parseInt(note.split(":")[1]);

				// Get index of surah
				const surahIndex = surahs.indexOf(surah);

				// Get installation directory
				const installDir = await joplin.plugins.installationDir();

				// File System 
				const fs = joplin.require('fs-extra');

				// Read surah
				const fileContent = await fs.readFile(installDir + `/../quran/${surahIndex}.txt`, 'utf8');

				// Find aye
				const aye = fileContent.substring( fileContent.indexOf(ayeIndex-1) + 1, fileContent.lastIndexOf(ayeIndex));

				// replace selected text
				await joplin.commands.execute('replaceSelection', aye);
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
					insert();
				},
			});

			// Add icon to toolbar
			await joplin.views.toolbarButtons.create('myButton', 'testCommand1', ToolbarButtonLocation.EditorToolbar);
	},
	
});

