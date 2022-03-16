import joplin from 'api';
import { MenuItemLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		let output = '';
		async function insert(surah:number,aye:number) {

			const installDir = await joplin.plugins.installationDir();

			const fs = joplin.require('fs-extra');

			const fileContent = await fs.readFile(installDir + '/../quran/quran-simple.txt', 'utf8');
		
			const craye = `${surah}|${aye}|`
			const nxaye = `${surah}|${aye+1}|`
			const length = String(aye).length + String(surah).length + 2;
			output += fileContent.substring( fileContent.indexOf(craye) + length, fileContent.indexOf(nxaye));
		}
		async function getinfo(note) {
			const surahs = ['قرآن','فاتحه','بقره'];
			const surah = note.split(":")[0];
				
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

		}
		async function readinfo() {
			const noteBody = await joplin.workspace.selectedNote();
			const note = (await joplin.commands.execute('selectedText') as string);
			if (note) {
				await getinfo (note);
				await joplin.commands.execute('replaceSelection', output);
				output = '';
				
			}else
			if(noteBody) {
				const lines = noteBody.body.split("\n");
				const notee = lines[lines.length -1];
				await getinfo (notee);
				await joplin.commands.execute('editor.deleteLine', notee);
				await joplin.commands.execute('insertText', output);
				output = '';
			}else {
				console.info("bad usege");
			}
	}
			await joplin.commands.register({
				name: 'convert',
				label: 'insert aye',
				execute: async () => {
					readinfo();
				},
			});

			await joplin.views.menuItems.create('Quran', 'convert', MenuItemLocation.Edit,{ accelerator: 'CmdOrCtrl+Shift+Q' });
	},
});